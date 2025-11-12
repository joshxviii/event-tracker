const mongoose = require('mongoose');

const pass = process.env.PASSWORD
const user = process.env.USER
const host = process.env.HOST
const dbName = process.env.DB_NAME

console.log('Connecting to MongoDB with user:', user, 'host:', host, 'db:', dbName);

const uri = `mongodb+srv://${user}:${pass}@${host}/${dbName}?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`

if (!uri) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connected successfully');
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = { dbConnect };