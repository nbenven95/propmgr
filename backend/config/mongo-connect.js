import mongoose from 'mongoose'

/**
 * Handle asynchronous database connection.
 *
 * @fires mongoose.Connection#connecting    // 0
 * @fires mongoose.Connection#connected     // 1
 * @fires mongoose.Connection#disconnecting // 2
 * @fires mongoose.Connection#disconnected  // 3
 * @fires mongoose.Connection#uninitialized // 99
 *
 * @param {string} uri                      The URI of the MongoDB instance; e.g., mongodb://localhost:27017/myDatabase
 * @param {Object} [options]                For passing authentication information, if you have authentication enabled
 * @param {string} options.user             The username of the MongoDB user (plaintext)
 * @param {string} options.pass             The password of the MongoDB user (plaintext)
 * @param {Object} options.auth             Nested object containing the authSource field
 * @param {string} options.auth.authSource  The collection in the target database containing credentials to authenticate against
 */
export const dbConnect = async (uri, options) => {

  // TODO: handle all connection events

  // Attempt connection
  try {
    // Wait for db to connect (await promise)
    const result = await mongoose.connect(uri, options);
    // Log success, return true
    const {host, port, name}  = result.connection;
    console.log(`MongoDB connected: mongodb://${host}:${port}/${name}`);
  } catch (err) {
    // Handle error for failed connection
    console.error(err);
  }
}