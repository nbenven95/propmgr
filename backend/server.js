import dotenv from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import express from 'express'
import multer from 'multer'
import path from 'node:path'

import { logError, clientErrorHandler, errorHandler } from '@util/errorHandler.js'

// Load values from .env into environment variables
dotenvExpand.expand(dotenv.config());

// Init app; load middleware
const app = express();
app.use(express.json()); // Parse json in req.body

// Register error handlers in the order that you want errors to be processed (if it matters)
// This should be done after other express middleware, but before other setup logic
app.use(logError);
app.use(clientErrorHandler);
app.use(errorHandler);

// Load env variables
const port = parseInt(process.env.PORT?? 3000);
const uploadPath = path.resolve(process.env.UPLOAD?? './static/file/uploads'); 

// TODO: temporary -- get path to index page
const indexPath = path.resolve('./frontend/index.html');

// Multer config -- set file upload limits here
const myMulter = multer({ dest: uploadPath });

// TODO: look into multer.memoryStorage() objects
// These allow you to temporarily save uploaded files into the server's program memory
// and read from them using a file buffer.
// Probably don't want to use these for file staging -- can cause server to crash
// if too many files are uploaded at once (or too large of a file)

// Routes
app.get('/', (req, res) => res.redirect('/api/upload')); // Redirect to /api/upload
app.get('/api/upload', (req, res) => res.status(200).sendFile(indexPath)); // Render index.html
app.post('/api/upload', myMulter.single('file'), (req, res) => {
	console.log(req.file);
	res.status(201).send({
		message: 'File upload successful',
		data: req.file.originalname
	});
});

// Start server
app.listen(port, () => {
	console.log(`Server listening on port: ${port}`);
});