import generateAliasesResolver from 'esm-module-alias';
import fs from 'node:fs';
import path from 'node:path';

/* NOTE: because this script is run from the project root, the relative path 
to package.json must be relative to the project root, not scripts */
const packageJson = JSON.parse(fs.readFileSync(path.resolve('./package.json'),
'utf8'));

// Read "aliases"
const aliases = packageJson?.aliases?? {};

// Create/export resolver given aliases
export const resolve = generateAliasesResolver(aliases);