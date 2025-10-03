import cors from 'cors'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import express from 'express'
import fs from 'node:fs'
import multer from 'multer'

import DocTypeEnum from '@config/DocTypes.js'
import OpSysTypeEnum, { ApplianceTypeEnum } from '@config/OpSysTypes.js'
import ToolTipDict from '@config/ToolTips.js'

import connectMongoDB from '@middleware/mongoConnect.js'
import validator from '@config/environmentValidator.js'
import multerConfig from '@config/multerConfig.js'
import errorHandler from '@middleware/errorHandler.js'

import DocumentRouter from '@routes/document.route.js'
import FileRefRouter from '@routes/fileRef.route.js'
import InfoRouter from '@routes/info.route.js'
import PropertyProfileRouter from '@routes/propertyProfile.route.js'
import SubunitRouter from '@routes/subunit.route.js'

/* LOAD AND VALIDATE ENVIRONMENT VARIABLES */

const envNotValidated = dotenvExpand	// Load environment
	.expand(dotenv.config())						// Expand variables
	?.parsed;								 						// Get env (use instead of "process.env")

// Use Joi schema to validate environment variables
const { error, value: env } = validator.validate(envNotValidated);
if (error) {
	console.error('Environment validation error:', error.details);
	process.exit(1);
}

const {
	MONGO_AUTH_EN, MONGO_AUTH_SRC, MONGO_AUTH_USER, MONGO_AUTH_PASS, MONGO_URI, // MongoDB environment variables
	EXPRESS_HOST, EXPRESS_PORT, REACT_HOST, REACT_PORT,													// Express and React environment variables
	UPLOAD_DIR, MAX_FILE_SIZE, MAX_FILES_PER_UPLOAD, ALLOWED_FILE_EXT						// Multer environment variables
} = env;

/* DEFINE MIDDLEWARE OPTIONS */

// Create upload directory if it does not exist
!fs.existsSync(UPLOAD_DIR)? fs.mkdirSync(UPLOAD_DIR) : /* do nothing */ '';

// Create multer object from 
const upload = multer(
  multerConfig({ // Multer config from env var
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

// Define body-parsing middleware (must be before routes)
// TODO: research request body parsing; I think this could be conflicting with multer and parsing multi-part form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors(corsOpt));

// Init Express routers with required args (e.g., multer object for routes handling file uploads)
const documentRoutes  = DocumentRouter(upload);
const fileRoutes      = FileRefRouter(upload);
const infoRoutes			= InfoRouter({ 
	allowedFileExt	: ALLOWED_FILE_EXT, // Valid file types for upload (define in env)
	toolTips  			: ToolTipDict, // Tooltips to display when hovering over certain elements on frontend
	docTypes				: DocTypeEnum, // Valid document types
	opSysTypes      : OpSysTypeEnum,
	applianceTypes  : ApplianceTypeEnum
});
const propertyRoutes  = PropertyProfileRouter(upload);
const subunitRoutes 	= SubunitRouter();

// Register Express routers
app.use('/api/docs', 				documentRoutes);
app.use('/api/files', 			fileRoutes);
app.use('/api/info', 				infoRoutes);
app.use('/api/properties', 	propertyRoutes);
app.use('/api/subunits', 		subunitRoutes);

// Register custom error handler (must be last registered middleware!)
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