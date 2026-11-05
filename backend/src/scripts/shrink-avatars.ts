import dotenv from 'dotenv';
dotenv.config();

import sharp from 'sharp';
import prisma from '../lib/prisma';

const APPLY = process.argv.includes('--apply');

async function main() {
  const profiles = await prisma.profile.findMany({
    where: { avatarUrl: { startsWith: 'data:' } },
    select: { id: true, avatarUrl: true },
  });

  console.log(`Avatares a revisar: ${profiles.length}`);

  for (const p of profiles) {
    const base64 = p.avatarUrl!.split(',')[1];
    const before = p.avatarUrl!.length;
    const small = await sharp(Buffer.from(base64, 'base64'))
      .rotate()
      .resize(192, 192, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer();
    const newUrl = `data:image/webp;base64,${small.toString('base64')}`;
    console.log(`${p.id}: ${Math.round(before / 1024)} KB -> ${Math.round(newUrl.length / 1024)} KB`);

    if (APPLY) {
      await prisma.profile.update({ where: { id: p.id }, data: { avatarUrl: newUrl } });
    }
  }

  console.log(APPLY ? 'Listo: avatares actualizados.' : 'Simulación: no se cambió nada. Usa --apply para guardar.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());