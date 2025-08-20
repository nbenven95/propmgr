import mongoose from 'mongoose'

/**
 * Handle async connect to MongoDB
 *
 * @fires mongoose.Connection#connecting
 * @fires mongoose.Connection#connected
 * @fires mongoose.Connection#open
 * @fires mongoose.Connection#disconnecting
 * @fires mongoose.Connection#disconnected
 * @fires mongoose.Connection#close
 * @fires mongoose.Connection#reconnected
 * @fires mongoose.Connection#error
 */
const mongoConnect = (uri, options) => {

  return new Promise((resolve, reject) => {

    mongoose.connect(uri, options).then(result => {

      const conn = result.connection;
      const { host, port, name } = conn;

      conn.on('connecting', () => console.log('Connecting. . .'));
      conn.on('connected', () => console.log('Connected to MongoDB instance'));
      conn.on('open', () => console.log('Connection open'));
      conn.on('disconnecting', () => console.log('Disconnecting. . .'));
      conn.on('disconnected', () => console.log('Disconnected from MongoDB instance'));
      conn.on('reconnected', () => console.log('Reconnected to MongoDB instance'));
      conn.on('close', () => console.log('Connection closed'));

      // Handle post-connection errors
      conn.on('error', err => {
        console.error(`MongoDB encountered an unexpected connection error: ${err}`);
        conn.close(); // Close the connection
        reject(err);
      });

      // Resolve promise on successful connection
      if (conn.readyState === 1) resolve({ host, port, name }); // TODO: not sure if this check is redundant or not 
      else console.log('Waiting to connect. . .'); // DEBUG: not sure when this would ever print 

    }).catch(err => {

      // Handle initial connection errors (authentication, etc.)
      console.error(`Failed to connect to MongoDB instance: ${err}`);
      reject(err);

    });
  });
}

export default mongoConnect;