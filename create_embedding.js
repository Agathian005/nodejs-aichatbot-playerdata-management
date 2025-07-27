// update_embeddings.js  (CommonJS)

require('dotenv').config();
const { MongoClient } = require('mongodb');
const { getEmbedding } = require('./get_embedding');   // <-- make sure this uses module.exports

async function run() {
  const client = new MongoClient(process.env.DATABASE_URI);

  try {
    await client.connect();
    const col = client.db('FootballClub').collection('clubplayers');

    // Only select players that have all required fields
    const filter = {
      name:        { $exists: true, $type: 'string', $ne: '' },
      position:    { $exists: true, $type: 'string', $ne: '' },
      nationality: { $exists: true, $type: 'string', $ne: '' },
      age:         { $exists: true },   // allow any type so we don’t skip strings
      jerseyno:    { $exists: true },
    };

    const players = await col.find(filter).limit(50).toArray();
    if (!players.length) {
      console.log('No players matched the filter — nothing to update.');
      return;
    }

    console.log(`Generating embeddings for ${players.length} players…`);
    const ops = [];

    await Promise.all(
      players.map(async (p) => {
        try {
          // Build a rich, searchable summary
          const summary = `${p.name}, aged ${p.age}, is a ${p.position} from ` +
                          `${p.nationality} and wears jersey number ${p.jerseyno}.`;

          // Create document‑type embedding
          const embedding = await getEmbedding(summary, 'search_document');

          ops.push({
            updateOne: {
              filter: { _id: p._id },
              update: { $set: { summary, embedding } },
            },
          });
        } catch (err) {
          console.error(`Embedding failed for ${p.name}:`, err.message);
        }
      })
    );

    if (ops.length) {
      const res = await col.bulkWrite(ops, { ordered: false });
      console.log(`Updated ${res.modifiedCount}/${players.length} documents.`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run().catch(console.error);
