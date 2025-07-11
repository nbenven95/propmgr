import cors from 'cors'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'

import initFileRoutes from '@routes/file.route.js'
import connectMongoDB from '@config/mongo-connect.js'
import { logError, clientErrorHandler, errorHandler } from '@util/errorHandler.js'
import { getUniqueFileName } from '@util/util.js'

// Load env variables
const envPath = path.resolve('../.env');
const env = dotenvExpand.expand(dotenv.config({ path: envPath }))?.parsed;

if (env === null || env === undefined) {
	console.log('TODO: validate env to set default values in case of null')
}

// TODO: validate env variables

// Load env variables
const expressHost = env.EXPRESS_HOST;
const expressPort = env.EXPRESS_PORT;
const uploadDir = env.UPLOAD;
const reactHost = env.REACT_HOST;
const reactPort = env.REACT_PORT;

// Create upload directory if it does not exist
!fs.existsSync(uploadDir)? fs.mkdirSync(uploadDir) : null;

/* Define config objects */

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

// Init app
const app = express();

// Load middleware
app.use(express.json());
app.use(cors(corsOptions));

// Load route handlers
const fileRoutes = initFileRoutes(upload); // Pass in multer object
app.use("/api/files", fileRoutes);

// Load error handlers
app.use(logError);
app.use(clientErrorHandler);
app.use(errorHandler);

// Program entry point: ensure DB connection, then start express server
connectMongoDB(env).then(res => {
	const { host, port, name } = res;
	console.log('MongoDB connected:', 'mongodb://' + host + ':' + port + '/' + name);
	app.listen(expressPort, expressHost, () => {
		console.log('Express server listening:', 'http://' + expressHost + ':' + expressPort);
	});
}).catch(err => {
	console.error('Unexpected error:', err);
	process.exit(1);
});