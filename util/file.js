const fs = require('fs');
const path = require('path');
const rootDir = require('./path');

exports.deleteFile = (fileName) => {
  const filePath = path.join(rootDir, fileName);
  /** unlink deletes given path */
  fs.unlink(filePath, (err) => {
    if (err) throw new Error(err);
  })
}

