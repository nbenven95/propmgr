import cors from 'cors'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import express from 'express'
import fs from 'node:fs'
import multer from 'multer'

import connectMongoDB from '@config/mongoConnect.js'
import DocTypeEnum from '@config/docType.js'
import envSchema from '@config/envValidationSchema.js'
import multerOptions from '@config/multerOpt.js'
import { clientErrorHandler, errorHandler, logError } from '@config/errHandler.js'

import DocumentRouter from '@routes/document.route.js'
import FileRouter from '@routes/file.route.js'
import InfoRouter from '@routes/info.route.js'
import PropertyRouter from '@routes/property.route.js'

/* LOAD AND VALIDATE ENVIRONMENT VARIABLES */

const env = dotenvExpand		// Load environment
	.expand(dotenv.config()) 	// Expand variables
	?.parsed;								 	// Get env (use instead of "process.env")

const { error, value: validatedEnvVars } = envSchema.validate(env); // Validate env with Joi schema
if (error) {
	console.error('Environment validation error:', error.details);
	process.exit(1);
}

const {
	MONGO_AUTH_EN, MONGO_AUTH_SRC, MONGO_AUTH_USER, MONGO_AUTH_PASS, MONGO_URI, // MongoDB environment variables
	EXPRESS_HOST, EXPRESS_PORT, REACT_HOST, REACT_PORT,													// Express and React environment variables
	UPLOAD_DIR, MAX_FILE_SIZE, MAX_FILES_PER_UPLOAD, ALLOWED_FILE_EXT						// Multer environment variables
} = validatedEnvVars;

/* DEFINE MIDDLEWARE OPTIONS */

// Create upload directory if it does not exist
!fs.existsSync(UPLOAD_DIR)? fs.mkdirSync(UPLOAD_DIR) : /* do nothing */ '';

// Create multer object from 
const upload = multer(
  multerOptions({ // Multer config from env var
    uploadDir         : UPLOAD_DIR,
    maxFileSize       : MAX_FILE_SIZE,
    maxFilesPerUpload : MAX_FILES_PER_UPLOAD,
    allowedFileExt    : ALLOWED_FILE_EXT
  }
));

// Set CORS options
const corsOpt = { origin: `http://${REACT_HOST}:${REACT_PORT}`, optionsSuccessStatus: 200 }; // TODO: how to only allow requests from frontend? 

/* INIT APP; LOAD MIDDLEWARE, ROUTES, AND ERROR HANDLERS */

const app = express();
app.use(express.json());
app.use(cors(corsOpt));
app.use(express.urlencoded({ extended: true }));

// Init Express routers with required args (e.g., multer object for routes handling file uploads)
const documentRoutes  = DocumentRouter(upload);
const fileRoutes      = FileRouter(upload);
const infoRoutes			= InfoRouter(DocTypeEnum, ALLOWED_FILE_EXT);
const propertyRoutes  = PropertyRouter();

// Register Express routers
app.use('/api/docs', 				documentRoutes);
app.use('/api/files', 			fileRoutes);
app.use('/api/info', 				infoRoutes);
app.use('/api/properties', 	propertyRoutes);

// Register Express error handlers
app.use(logError);
app.use(clientErrorHandler); // TODO: research Express error handler patterns/best practices 
app.use(errorHandler);

/* ATTEMPT DATABASE CONNECTION; START EXPRESS SERVER */

// If MongoDB authentication is enabled, set auth options
const MONGO_AUTH = MONGO_AUTH_EN
?	{ authSource: MONGO_AUTH_SRC, auth: { username: MONGO_AUTH_USER, password: MONGO_AUTH_PASS } }
: null;

// Connect to MongoDB instance; start Express server if successful
connectMongoDB(MONGO_URI, MONGO_AUTH).then(res => {
	const { host, port, name } = res;
	console.log(`MongoDB server: mongodb://${host}:${port}/${name}`);
	app.listen(EXPRESS_PORT, EXPRESS_HOST, () => {
		console.log(`Express server: http://${EXPRESS_HOST}:${EXPRESS_PORT}`);
	});
}).catch(err => {
	console.error('Unexpected error:', err);
	process.exit(1);
});