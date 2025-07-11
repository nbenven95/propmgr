export default (env) => {

  // Immediately exit if MONGO_URI is not set (needed for functionality)
  const mongoUri = env.MONGO_URI?? (() => { 
    console.error('MONGO_URI not set');
    process.exit(1); 
  })();
  
  // Is mongo authentication enabled?
  const isMongoAuthEn = parseInt(env.MONGO_AUTH_EN)?? 0;
  
  // Authentication source on the mongo server
  const mongoAuthSrc = isMongoAuthEn
    ? env.MONGO_AUTH_SRC?? 'admin'
    : null; // Don't bother reading if auth is disabled
  
  // Mongo auth username
  const mongoUser = isMongoAuthEn
    ? env.MONGO_USER?? 'root'
    : null;
  
  // Mongo auth password
  const mongoPass = isMongoAuthEn
    ? env.MONGO_PASS?? 'example'
    : null;
  
  const expressHost = env.EXPRESS_HOST?? 'localhost';
  const expressPort = parseInt(env.EXPRESS_PORT?? 5000); 
  const reactHost = env.REACT_HOST?? 'localhost';
  const reactPort = parseInt(env.REACT_PORT?? 5173);
  const uploadDir = path.resolve(env.UPLOAD?? '../data/files');

}