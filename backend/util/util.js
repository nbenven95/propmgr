import path from 'node:path'

/* Given a file name or path, returns a globally unique version of the base name. */
export const getUniqueFileName = (filePath) => {
  // Parse file name
  const parsed    = path.parse(path.basename(filePath));
  const tempName  = parsed.name;
  const ext       = parsed.ext;

  // Replace any number of successive whitespace or '-' characters with '_'
  const name = tempName.replace(/[\s-]+/g, '_');

  // Uploaded filename should include timestamp of upload
  // The additonal random number is to prevent edge cases where the same
  // file may be uploaded at exactly the same timestamp (very unlikely)
  const uniqueSuffix = `${Math.round(Math.random()*1E9)}-${Date.now()}`;
  const uniqueName = `${name}-${uniqueSuffix}`;
  
  // Return the unique basename
  return `${uniqueName}${ext}`;
};