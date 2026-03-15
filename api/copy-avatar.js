import fs from 'fs';
import path from 'path';

const src = 'C:/Users/mathe/.gemini/antigravity/brain/9d703be6-e2f6-4140-906f-3041c04f0d9b/media__1772873796097.jpg';
const dest = 'c:/Users/mathe/OneDrive/Área de Trabalho/projetos/pdv/pdv/src/assets/lizandro.jpg';

try {
    fs.copyFileSync(src, dest);
    console.log('File copied successfully to ' + dest);
} catch (err) {
    console.error('Error copying file:', err);
}
