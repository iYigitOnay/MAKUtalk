const fs = require('fs');
const path = require('path');

const replacements = {
  'Ş': 'Ş',
  'Ş': 'Ş', // Bazen sondaki karakter kaybolabiliyor
  'ş': 'ş',
  'DEĞİŞİKLİKLERİ': 'DEĞİŞİKLİKLERİ',
  'Ş': 'Ş',
  'ş': 'ş',
  'Ğ': 'Ğ',
  'ğ': 'ğ',
  'Ç': 'Ç',
  'ç': 'ç',
  'Ö': 'Ö',
  'ö': 'ö',
  'Ü': 'Ü',
  'ü': 'ü',
  'İ': 'İ',
  'ı': 'ı',
  '🔒': '🔒',
  '🌍': '🌍',
  '🔥': '🔥',
  '📈': '📈',
  '⏱️': '⏱️',
  '🧠': '🧠',
  '✨': '✨'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') return;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (filePath.match(/\.(vue|ts|js|html|md|json)$/)) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const rootDir = __dirname;
const files = walk(rootDir);

let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const [bad, good] of Object.entries(replacements)) {
    content = content.split(bad).join(good);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Düzeltildi: ${file}`);
  }
});

console.log(`
Toplam ${modifiedCount} dosya temizlendi.`);
