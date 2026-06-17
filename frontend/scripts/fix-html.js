import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../dist');

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (filePath.endsWith('.html')) {
      let content = fs.readFileSync(filePath, 'utf8');
      // Match scripts that are from Expo's web bundle but missing type="module"
      const regex = /<script ([^>]*src="(\/_expo\/static\/js\/web\/[^"]+)"[^>]*)>/g;
      if (regex.test(content)) {
        console.log(`Fixing ${filePath}`);
        // Reset regex state due to test()
        regex.lastIndex = 0;
        content = content.replace(regex, (match, p1) => {
          if (p1.includes('type="module"')) return match;
          return `<script type="module" ${p1}>`;
        });
        fs.writeFileSync(filePath, content);
      }
    }
  });
}

walk(distPath);
