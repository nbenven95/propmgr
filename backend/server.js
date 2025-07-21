import cors from 'cors'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import sysPath from 'node:path'

import connectMongoDB from '@config/mongoConnect.js'

import DocumentRouter from '@routes/document.route.js'
import FileRouter from '@routes/file.route.js'
import PropertyRouter from '@routes/property.route.js'

import { logError, clientErrorHandler, errorHandler } from '@util/errorHandler.js'

// Load env variables
const env = dotenvExpand.expand(dotenv.config({ path: sysPath.resolve('../.env') }))?.parsed;

// Immediately exit if MONGO_URI is not set (needed for functionality)
const mongoUri = env.MONGO_URI?? (() => { 
	console.error('MONGO_URI unset in .env');
	process.exit(1); 
})();

// Set auth options (if auth is enabled)
const mongoAuthOpt = parseInt(env.MONGO_AUTH_EN) === 1
	? (() => {
		const mongoAuthSrc = env.MONGO_AUTH_SRC;
		const mongoUser = env.MONGO_USER;
		const mongoPass = env.MONGO_PASS;
		return {
			'authSource': mongoAuthSrc,
			'auth': {
				'username': mongoUser, 
				'password': mongoPass
			}
		};
	})()
	: null;

const expressHost = env.EXPRESS_HOST?? 'localhost';
const expressPort = parseInt(env.EXPRESS_PORT?? 5000); 
const reactHost = env.REACT_HOST?? 'localhost';
const reactPort = parseInt(env.REACT_PORT)?? 5173;
const uploadDir = sysPath.resolve(env.UPLOAD?? '../../data/files');

// Create upload directory if it does not exist
!fs.existsSync(uploadDir)? fs.mkdirSync(uploadDir) : '';

// CORS allows our react app (frontend) to make requests to the backend
// TODO: how to use CORS to only allow requests from frontend? 
const corsOpt = { origin: `http://${reactHost}:${reactPort}`, optionsSuccessStatus: 200 };

// multer config for local disk storage
// TODO: add/enforce file upload limits
const multerOpt = {
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => { // Note: this is called by multer middleware, before createFileRefs controller logic
		// Parse file name, extract the name and extension
		const parsed = sysPath.parse(sysPath.basename(file.originalname))
		const tempName = parsed.name;
  	const ext = parsed.ext;
		// Replace any number of successive whitespace or '-' characters with '_'
  	const name = tempName.replace(/[\s-]+/g, '_');
		// Unique suffix based on random number and timestamp // TODO: better way of doing this?
		const uniqueSuffix = `${Math.round(Math.random()*1E9)}-${Date.now()}`;
		// Rename file
		cb(null, `${name}-${uniqueSuffix}${ext}`) 
	}
};
const localDiskStorage = multer.diskStorage(multerOpt);
const upload = multer({ storage: localDiskStorage });

// Init app, load middleware, route handlers, error handlers
const app = express();

app.use(express.json());
app.use(cors(corsOpt));
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Get router objects
const documentRoutes = DocumentRouter(upload); // Pass in multer object to handle file uploads
const fileRoutes = FileRouter(upload);
const propertyRoutes = PropertyRouter();

// Assign routes to routers
app.use('/api/docs', documentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/properties', propertyRoutes);

app.use(logError); // General error handler
app.use(clientErrorHandler); // Conditional error handler (only handle client-generated errors)
app.use(errorHandler); // Catch-all error handler

// Connect to database, then start express server
connectMongoDB(mongoUri, mongoAuthOpt).then(res => {
	const { host, port, name } = res;
	console.log('MongoDB server:', 'mongodb://' + host + ':' + port + '/' + name);
	app.listen(expressPort, expressHost, () => {
		console.log('Express server:', 'http://' + expressHost + ':' + expressPort);
	});
}).catch(err => {
	console.error('Unexpected error:', err);
	process.exit(1);
});