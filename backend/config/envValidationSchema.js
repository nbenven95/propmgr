import fs from 'node:fs'
import Joi from 'joi'
import path from 'node:path'

/**
 * Schema for validating environment variables
 */
export default Joi.object({

	MONGO_AUTH_EN: Joi.bool()
		.truthy(1,'1','t') 		// Additional values to parse as "true"
		.falsy(0,'0','f','')	// Additional values to parse as "false"
		.required()
		.messages({
			'any.invalid': 'MONGO_AUTH_EN must be a valid "truthy" value (0, 1, t, f, true, false)'
		}),

	MONGO_AUTH_SRC: Joi.string()
		.when('MONGO_AUTH_EN', {
			is: true,
			then: Joi.required(),
			otherwise: Joi.optional()
		})
		.messages({
			'any.invalid': 'MONGO_AUTH_SRC must be a valid MongoDB database name (where the authenticating user was created)'
		}),

	MONGO_AUTH_USER: Joi.string()
		.when('MONGO_AUTH_EN', {
			is: true,
			then: Joi.required(),
			otherwise: Joi.optional()
		})
		.messages({
			'any.invalid': 'MONGO_AUTH_USER must be a valid MongoDB user with sufficient privileges for the target database'
		}),

	MONGO_AUTH_PASS: Joi.string()
		.when('MONGO_AUTH_EN', {
			is: true,
			then: Joi.required(),
			otherwise: Joi.optional()
		})
		.messages({
			'any.invalid': 'MONGO_AUTH_PASS must be the corresponding password for MONGO_AUTH_USER'
		}),

	MONGO_HOST: Joi.alternatives()
		.try(
			Joi.string().hostname(),
			Joi.string().ip()
		)
		.required()
		.messages({
			'any.invalid': 'MONGO_HOST must be a valid IP address or RFC1123 hostname'
		}),

	MONGO_PORT: Joi.number()
		.port()
		.required()
		.messages({
			'any.invalid': 'MONGO_PORT must be a valid TCP port'
		}),
	
	MONGO_NAME: Joi.string()
		.required()
		.messages({
			'any.invalid': 'MONGO_NAME must be a valid MongoDB database name'
		}),

	MONGO_URI: Joi.string()
		.uri()
		.required()
		.messages({
			'any.invalid': 'MONGO_URI must be a valid database connection string'
		}),

	EXPRESS_HOST: Joi.alternatives()
		.try(
			Joi.string().hostname(),
			Joi.string().ip()
		)
		.required()
		.messages({
			'any.invalid': 'EXPRESS_HOST must be a valid IP address or RFC1123 hostname'
		}),

	REACT_HOST: Joi.alternatives()
		.try(
			Joi.string().hostname(),
			Joi.string().ip()
		)
		.required()
		.messages({
			'any.invalid': 'REACT_HOST must be a valid IP address or RFC1123 hostname'
		}),

	EXPRESS_PORT: Joi.number()
		.port()
		.required()
		.messages({
			'any.invalid': 'EXPRESS_PORT must be a valid TCP port'
		}),

	REACT_PORT: Joi.number()
		.port()
		.required()
		.messages({
			'any.invalid': 'REACT_PORT must be a valid TCP port'
		}),

	UPLOAD_DIR: Joi.string()
		.required()
		.custom((value, helpers) => {
			// Attempt to resolve UPLOAD_DIR
			const resolvedPath = path.resolve(value);
			// Ensure UPLOAD_DIR is a valid directory path
			if (!fs.existsSync(resolvedPath) || !fs.lstatSync(resolvedPath).isDirectory()) {
				return helpers.message('UPLOAD_DIR must be a valid directory path')
			}
			// Validated
			return resolvedPath;
		}, 'UPLOAD_DIR path validation'),

	MAX_FILE_SIZE: Joi.number()
		.required()
		.custom((value, helpers) => {
			if (value <= 0) return helpers.message('MAX_FILE_SIZE must be a valid positive number');
			return value;
		}, 'MAX_FILE_SIZE value validation'),

	MAX_FILES_PER_UPLOAD: Joi.number()
		.integer()
		.min(1)
		.required()
		.messages({
			'any.invalid': 'MAX_FILES_PER_UPLOAD must be a valid positive integer'
		}),

	ALLOWED_FILE_EXT: Joi.string()
		.required()
		.custom((value, helpers) => {
			// Regex to match a string comprised of space-delimited tokens
			const regex = /^(\S+)(\s\S+)*$/;
			if (regex.test(value)) {
				// Parse the list into an array and return it
				const tokens = value.trim().split(/\s+/);
				return tokens;
			}
			return helpers.message('ALLOWED_FILE_EXT must be a space-delimited string of valid file extensions');
		}, 'ALLOWED_FILE_EXT list validation')

})