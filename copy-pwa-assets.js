const fs = require('fs-extra');
const path = require('path');

// Ensure web-build/public directory exists
fs.ensureDirSync(path.join(__dirname, 'web-build', 'public'));

// Copy PWA assets from public to web-build
fs.copySync(
  path.join(__dirname, 'public'),
  path.join(__dirname, 'web-build'),
  { overwrite: true }
);

console.log('✅ PWA assets copied successfully'); 