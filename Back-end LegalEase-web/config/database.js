const mongoose = require('mongoose');

// Hard-coded MongoDB URI (without .env)
const mongoURI = 'mongodb://legalease:lura1219@ac-is7skb9-shard-00-00.bqanect.mongodb.net:27017,ac-is7skb9-shard-00-01.bqanect.mongodb.net:27017,ac-is7skb9-shard-00-02.bqanect.mongodb.net:27017/?ssl=true&replicaSet=atlas-e469mu-shard-0&authSource=admin&retryWrites=true&w=majority&appName=LegalEase-cluster';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoURI); 
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectDB;
