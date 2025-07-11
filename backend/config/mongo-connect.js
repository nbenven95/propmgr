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
 * @param {object} env An object mapping environment variables to their parsed values.
 *            
 * Can easily produce using:
 * `dotenv.config({path: '.envPath'})?.parsed'
 * OR
 * `dotenvExpand.expand(dotenv.config({path: '.envPath'}))?.parsed'
 *
 * Argument {path: '.envPath'} is only required if user .env file is
 * not in user project root directory.
 *
 * If .envPath does not exist, or user fails to pass the `path' argument
 * and there is no .env in the project root, dotenv.config()
 * and dotenvExpand.expand() will both return null. In this case,
 * *.parsed should just return null, which would make this parameter null.
 *
 * User should either ensure that env is not null before calling this
 * function, or wrap in try/catch to catch undefined environment error.
 *   
 * @param {string} env.MONGO_URI      The URI of the MongoDB instance (e.g., mongodb://localhost:27017/myDatabase)  
 * @param {string} env.MONGO_AUTH_EN  [0,1] Is authentication enabled? (must be parsed to integer)
 * @param {string} env.MONGO_AUTH_SRC The database where you created MONGO_USER (usually same as MONGO_NAME)
 * @param {string} env.MONGO_USER     The plaintext username of the MongoDB user
 * @param {string} env.MONGO_PASS     The plaintext password of the MongoDB user
 * 
 * NOTE: there are more KVPs in env; these are the only ones relevant to this module.
 */
export default (env) => {
  // Check for undefined environment
  if (env === null || env === undefined) throw Error('UNDEFINED_ENV_ERR');
  console.log(env);
  const uri = env.MONGO_URI;
  const options = (() => {
    if (parseInt(env.MONGO_AUTH_EN) === 1) {
      const mongoUser = env.MONGO_USER;
      const mongoPass = env.MONGO_PASS;
      const mongoAuthSrc = env.MONGO_AUTH_SRC;
      return {'auth': {'username': mongoUser, 'password': mongoPass}, 'authSource': mongoAuthSrc };
    }
    return {'auth': {'username': null, 'password': null}, 'authSource': null };
  })(); // Invoke anonymous function to set 'options'

  // TODO: handle error states; e.g., throw error if not authenticated (db requests will fail)

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
  


  