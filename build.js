const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'views'); // view 폴더를 사용
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

fs.readdirSync(srcDir).forEach(file => {
  if (path.extname(file) === '.ejs') {
    const ejsContent = fs.readFileSync(path.join(srcDir, file), 'utf8');
    const htmlContent = ejs.render(ejsContent);
    const htmlFileName = file.replace('.ejs', '.html');
    fs.writeFileSync(path.join(distDir, htmlFileName), htmlContent);
  }
});
