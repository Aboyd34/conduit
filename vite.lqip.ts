import fs from 'fs';
import sharp from 'sharp';
import type { Plugin } from 'vite';

export default function lqipPlugin(): Plugin {
  return {
    name: 'conduit-lqip',
    enforce: 'pre',
    async load(id: string) {
      if (!id.match(/\.(png|jpe?g|webp)$/i)) return;

      const file = fs.readFileSync(id);
      const lqip = await sharp(file)
        .resize(32)
        .blur(4)
        .jpeg({ quality: 40 })
        .toBuffer();

      const base64 = `data:image/jpeg;base64,${lqip.toString('base64')}`;

      return [
        `export const src = ${JSON.stringify(id)};`,
        `export const lqip = ${JSON.stringify(base64)};`,
        `export default { src, lqip };`,
      ].join('\n');
    },
  };
}
