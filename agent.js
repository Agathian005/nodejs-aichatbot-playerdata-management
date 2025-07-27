// agent.js  (CommonJS version)
// Converts previous ESM code to require/module.exports so it can be `require()`‑d
// from a CommonJS Express server.

require('dotenv').config();
const { CohereEmbeddings, ChatCohere } = require('@langchain/cohere');
const { HumanMessage } = require('@langchain/core/messages');
const { ChatPromptTemplate, MessagesPlaceholder } = require('@langchain/core/prompts');
const { Annotation, StateGraph } = require('@langchain/langgraph');
const { tool } = require('@langchain/core/tools');
const { ToolNode } = require('@langchain/langgraph/prebuilt');
const { MongoDBAtlasVectorSearch } = require('@langchain/mongodb');
const z = require('zod');

// ────────────────────────────────────────────────────────────
// Vector‑search tool factory (collection‑scoped)
// ────────────────────────────────────────────────────────────
function buildPlayerLookupTool(db) {
  const playersCol = db.collection('clubplayers');
  const detailsCol = db.collection('details');
  const injuriesCol = db.collection('injuries');

  return tool(
    async ({ query, n = 10 }) => {
      const vectorStore = new MongoDBAtlasVectorSearch(
        new CohereEmbeddings({
          apiKey: process.env.COHERE_API_KEY,
          model: 'embed-english-light-v3.0',
          inputType: 'search_query',
        }),
        {
          collection: playersCol,
          indexName: 'hello123',
          textKey: 'summary',
          embeddingKey: 'embedding',
        },
      );

      const hits = await vectorStore.similaritySearchWithScore(query, n);

      const enriched = await Promise.all(
        hits.map(async ([doc, score]) => {
          const playerId = doc._id;
          const details = await detailsCol.findOne({ player_id: playerId });
          const injuries = await injuriesCol.find({ player_id: playerId }).toArray();
          return { ...doc, score, details, injuries };
        })
      );

      return JSON.stringify(enriched);
    },
    {
      name: 'player_lookup',
      description: 'Vector‑search FootballClub players, then join details & injuries',
      schema: z.object({
        query: z.string(),
        n: z.number().optional().default(10),
      }),
    },
  );
}

// ────────────────────────────────────────────────────────────
// Root graph state (chat history)
// ────────────────────────────────────────────────────────────
const GraphState = Annotation.Root({
  messages: Annotation({ reducer: (x, y) => x.concat(y) }),
});

// ────────────────────────────────────────────────────────────
// Exported helper used by the Express server
// ────────────────────────────────────────────────────────────
async function callAgent(nativeClient, query, threadId) {
  const db = nativeClient.db('FootballClub');
  const tools = [buildPlayerLookupTool(db)];
  const toolNode = new ToolNode(tools);

  const llm = new ChatCohere({
    apiKey: process.env.COHERE_API_KEY,
    model: 'command-r-plus',
    temperature: 0,
  }).bindTools(tools);

  async function callModel(state) {
    const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are a helpful FootballClub assistant. 
    Users will send their questions inside a JSON object with a "message" key.
    Extract the value of the "message" key and treat it as a natural language question. 
    Respond with a clear, concise, and accurate answer.
    If the question is about a football player, club, country, or stat, use your knowledge to answer appropriately. 
    Use tools when needed.`,
  ],
      new MessagesPlaceholder('messages'),
    ]);

    const formatted = await prompt.formatMessages({
      tool_names: tools.map((t) => t.name).join(', '),
      messages: state.messages,
      time: new Date().toISOString(),
      system_message: 'Be concise.',
    });

    const result = await llm.invoke(formatted);
    return { messages: [result] };
  }

  function shouldContinue(state) {
    const last = state.messages.at(-1);
    return last.tool_calls && last.tool_calls.length ? 'tools' : '__end__';
  }

  const app = new StateGraph(GraphState)
    .addNode('agent', callModel)
    .addNode('tools', toolNode)
    .addEdge('__start__', 'agent')
    .addConditionalEdges('agent', shouldContinue)
    .addEdge('tools', 'agent')
    .compile({ timeout: 60_000 });

  const finalState = await app.invoke(
    { messages: [new HumanMessage(query)] },
    { recursionLimit: 15, configurable: { thread_id: threadId } },
  );

  let answer = finalState.messages.at(-1).content;
  if (answer.startsWith('FINAL ANSWER')) {
    answer = answer.replace(/^FINAL ANSWER[:\-\s]*/i, '');
  }
  return answer;
}

module.exports = { callAgent };
