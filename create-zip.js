const AdmZip = require('adm-zip');
const fs = require('fs');

const zip = new AdmZip();
const outputFileName = 'project.zip';

// List of folders/files to strictly IGNORE
const IGNORE_LIST = [
  'node_modules',
  '.git',
  '.next',
  '.vscode',
  '.DS_Store',
  'public',
  outputFileName
];

try {
  fs.readdirSync('.').forEach((file) => {
    if (!IGNORE_LIST.includes(file)) {
      if (fs.statSync(file).isDirectory()) {
        // addLocalFolder(path, zipPath)
        // zipPath ensures the folder structure is kept inside the zip
        zip.addLocalFolder(file, file);
      } else {
        zip.addLocalFile(file);
      }
    }
  });

  zip.writeZip(outputFileName);
} catch (e) {
  console.error('Error creating zip. You likely ran out of memory.', e);
}
