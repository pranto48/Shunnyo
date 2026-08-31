import fs from 'fs';
import path from 'path';

const COPYRIGHT_HEADER_JS = `/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */
`;

const COPYRIGHT_HEADER_HTML = `<!--
  Copyright (c) IT Support BD (https://itsupport.com.bd)
  All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
-->
`;

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '.git', 'android', 'build'].includes(entry.name)) {
        processDir(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.js', '.jsx', '.ts', '.tsx', '.css'].includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (!content.includes('itsupport.com.bd')) {
          content = COPYRIGHT_HEADER_JS + '\n' + content;
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated: ${fullPath}`);
        }
      } else if (['.html'].includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (!content.includes('itsupport.com.bd')) {
          content = COPYRIGHT_HEADER_HTML + '\n' + content;
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated HTML: ${fullPath}`);
        }
      }
    }
  }
}

processDir(path.resolve('./src'));
processDir(path.resolve('./backend'));
if (fs.existsSync('./index.html')) {
  let content = fs.readFileSync('./index.html', 'utf8');
  if (!content.includes('itsupport.com.bd')) {
    content = COPYRIGHT_HEADER_HTML + '\n' + content;
    fs.writeFileSync('./index.html', content, 'utf8');
    console.log('Updated index.html');
  }
}
