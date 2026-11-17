const fs = require('fs'), path = require('path');
const out = path.join(__dirname, 'www');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'app.js', 'app.css', 'icon.svg', 'manifest.webmanifest', 'sw.js']) fs.copyFileSync(path.join(__dirname, f), path.join(out, f));
console.log('www ready');
