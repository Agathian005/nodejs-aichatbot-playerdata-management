require('dotenv').config();
const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

async function getEmbedding(text) {
  try {
    const response = await cohere.embed({
      texts: [text],
      model: 'embed-english-light-v3.0', // or 'embed-english-v3.0'
      input_type: 'search_query',
    });

    return response.embeddings[0];
  } catch (err) {
    console.error('Cohere embedding error:', err);
    return null;
  }
}

module.exports = { getEmbedding };
