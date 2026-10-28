import sharp from 'sharp';
import fs from 'node:fs';
import { load, snapToShadow, pts } from './object-cut-lib.mjs';
const src = 'src/assets/rajasthan/amber-fort/invitation-object.png';
const img = await load(src);
const lower = [[1400,194],[1385,215],[1352,230],[1335,260],[1320,290],[1300,307],[936,551],[820,523],[383,415],[347,392],[321,361],[303,330],[270,331],[218,315],[190,279],[167,261],[150,230],[137,197]];
const seal = ([x, y]) => Math.hypot(x - 898, y - 512) < 112;
const snapped = snapToShadow(img, lower, { side: -1, keep: seal });
fs.writeFileSync(process.argv[2] + '/flap-edge.json', JSON.stringify(snapped.map(p => p.map(v => +v.toFixed(1)))));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.w}" height="${img.h}"><polyline points="${pts(lower)}" fill="none" stroke="#0ff" stroke-width="2"/><polyline points="${pts(snapped)}" fill="none" stroke="#f0f" stroke-width="2"/></svg>`;
const b = await sharp(src).flatten({ background: '#333' }).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
for (const [name, c] of [['left', { left: 100, top: 150, width: 720, height: 450 }], ['right', { left: 760, top: 60, width: 720, height: 520 }]])
  await sharp(b).extract(c).resize(1400).jpeg({ quality: 82 }).toFile(`${process.argv[2]}/flap-snap-${name}.jpg`);
