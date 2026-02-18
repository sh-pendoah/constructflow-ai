import mongoose from 'mongoose';

async function main() {
  try {
    console.log('Connecting to database...');
    const mongoUri = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/docflow-360?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      console.log(`Total collections: ${collections.length}`);
      
      // Check user collection if it exists
      const userCollection = db.collection('users');
      const userCount = await userCollection.countDocuments();
      console.log(`Current user count: ${userCount}`);
    }

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

main();

