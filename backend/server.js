import cors from 'cors'
import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import express from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'

import { logError, clientErrorHandler, errorHandler } from '@util/errorHandler.js'

// Load values from .env into environment variables
dotenvExpand.expand(dotenv.config());

// Load env variables
const exprsHost = process.env.EXPRESS_HOST?? 'localhost';
const exprsPort = parseInt(process.env.EXPRESS_PORT?? 5000);
const reactHost = process.env.REACT_HOST?? 'localhost';
const reactPort = parseInt(process.env.REACT_PORT?? 5173);
const uploadDir = path.resolve(process.env.UPLOAD?? './static/file/uploads'); // TODO: update this with shared storage volume

// Check if uploadDir needs to be created (synchrnous check); do nothing if it exists
!fs.existsSync(uploadDir)? fs.mkdirSync(uploadDir): '';

// Load middleware
const app = express();
app.use(express.json());
app.use(cors({
	origin: `http://${reactHost}:${reactPort}`, // CORS config -- only allow requests from frontend
	optionsSuccessStatus: 200,
}));

// Load error handlers (should be done after middleware, but before main program logic)
app.use(logError);
app.use(clientErrorHandler);
app.use(errorHandler);

/* Multer config */
const localDiskStorage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => {
		// Append timestamp to original filename to prevent conflicts
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random()*1E9)}`; // TODO: not sure if the random number is necessary, or the best/most secure way of doing this
		cb(null, `${file.originalname}-${uniqueSuffix}`);
	}
});
const upload = multer({ storage: localDiskStorage }); // Can also specify file size limits, etc.
let uploadedFiles = []; // TODO: temp until DB is implemented to track {fileId: 'filePath'}

/* Upload files from request body to disk storage */
app.post('/upload', upload.array('files'), (req, res) => { // TODO: validate file type, etc.
	const files = req.files;
	files.forEach(file => {
		uploadedFiles.push({ // TODO: replace with db operations
			_id: file.filename, // Use uniquely-generated filename as its ID -- TODO: may need to specify this behavior in mongo
			filename: file.originalname,
			path: file.path
		});
	});
	res.status(200).send({
		message: 'Successfully uploaded files',
		files: uploadedFiles // TODO: not sure if we should send the list of file refs in the response; maybe just an updated list of ids?
	});
});

/* Get list of currently uploaded files */
app.get('/files', (req, res) => { 
	res.status(200).send(uploadedFiles); // TODO: set up mongodb container and track fileId (key) to filePath (value)
});

/* Delete a file */
app.delete('/files/:id', (req, res) => {
	
	const fileId = req.params.id;
	const fileIndex = uploadedFiles.findIndex(f => f._id === fileId); // TODO: replace with db operations
	if (fileIndex === -1) {
		return res.status(404).send({ // 404 if no file was found for fileId
			error: 'File not found',
			data: fileId
		});
	}

	// Remove file reference
	const file = uploadedFiles[fileIndex];
	uploadedFiles.splice(fileIndex, 1); // TODO: replace with db operations

	// async call to delete file from disk
	fs.unlink(file.path, (err) => {
		if (err) {
			return res.status(500).json({ error: 'Error deleting file', data: fileId})
		}
		res.status(200).send({
			message: 'Successfully deleted file',
			data: fileId
		});
	});
});

// Start server
app.listen(exprsPort, exprsHost, () => {
	console.log(`Server listening on: http://${exprsHost}:${exprsPort}`);
});