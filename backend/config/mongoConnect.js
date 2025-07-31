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
 */
export default (uri, options) => {

  // FIXME: handle error states; e.g., throw error if not authenticated (db requests will fail)

  return new Promise((resolve, reject) => {
    mongoose.connect(uri, options).then(result => {
      const { host, port, name } = result.connection;
      const res = { host, port, name };
      resolve(res);
    }).catch(err => {
      reject(err);
    });
  });
}