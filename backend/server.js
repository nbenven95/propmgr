import cors from 'cors'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'

import initFileRoutes from '@routes/file.route.js'
import { dbConnect } from '@config/mongo-connect.js'
import { logError, clientErrorHandler, errorHandler } from '@util/errorHandler.js'
import { getUniqueFileName } from '@util/util.js'

/* Load/validate environment variables */
dotenvExpand.expand(dotenv.config());

// Immediately exit if MONGO_URI is not set (needed for functionality)
const mongoUri = process.env.MONGO_URI?? (() => { 
	console.error('MONGO_URI not set');
	process.exit(1); 
})();

// Is mongo authentication enabled?
const isMongoAuthEn = parseInt(process.env.MONGO_AUTH_EN)?? 0;

// Authentication source on the mongo server
const mongoAuthSrc = isMongoAuthEn
	? process.env.MONGO_AUTH_SRC?? 'admin'
	: null; // Don't bother reading if auth is disabled

// Mongo auth username
const mongoUser = isMongoAuthEn
	? process.env.MONGO_USER?? 'root'
	: null;

// Mongo auth password
const mongoPass = isMongoAuthEn
	? process.env.MONGO_PASS?? 'example'
	: null;

const expressHost = process.env.EXPRESS_HOST?? 'localhost';
const expressPort = parseInt(process.env.EXPRESS_PORT?? 5000); 
const reactHost = process.env.REACT_HOST?? 'localhost';
const reactPort = parseInt(process.env.REACT_PORT?? 5173);
const uploadDir = path.resolve(process.env.UPLOAD?? '../data/files');

// Create upload directory if it does not exist
!fs.existsSync(uploadDir)? fs.mkdirSync(uploadDir) : null;

/* Define config objects */

// mongoAuth config
const mongoAuthOptions = isMongoAuthEn 
	? {	'auth': {'username': mongoUser, 'password': mongoPass}, 'authSource': mongoAuthSrc } 
	: {	'auth': {'username': null, 'password': null}, 'authSource': null };

// CORS config: only allow requests from frontend
const corsOptions = {
	origin: `http://${reactHost}:${reactPort}`,
	optionsSuccessStatus: 200,
};

// multer config for local disk storage; TODO: enforce file upload restrictions
const multerOptions = {
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => cb(null, getUniqueFileName(file.originalname))
};
const localDiskStorage = multer.diskStorage(multerOptions);
const upload = multer({ storage: localDiskStorage }); // Use this to init router

/* Load middleware */
const app = express();
app.use(express.json());
app.use(cors(corsOptions));

/* Load error handlers */
app.use(logError);
app.use(clientErrorHandler);
app.use(errorHandler);

/* Routers */
const fileRoutes = initFileRoutes(upload); // Pass in multer object
app.use("/api/files", fileRoutes);

/* Program entry point */
dbConnect(mongoUri, mongoAuthOptions).then(() => { // Wait for successful DB connection, then start express server
	app.listen(expressPort, expressHost, () => {
		console.log(`Server listening on: http://${expressHost}:${expressPort}`);
	});
}).catch(err => {
	console.error('Unexpected error:', err);
	process.exit(1);
});