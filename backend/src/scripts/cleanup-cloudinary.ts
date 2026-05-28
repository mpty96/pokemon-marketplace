import dotenv from 'dotenv';
dotenv.config();

import cloudinary from '../utils/cloudinary';

const foldersToClean = [
  'listings',
  'pokemon-marketplace',
  'pokemon-marketplace/wanted-cards',
];

async function deleteResourcesByPrefix(prefix: string) {
  console.log(`Buscando archivos en Cloudinary: ${prefix}`);

  let nextCursor: string | undefined;

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix,
      max_results: 100,
      next_cursor: nextCursor,
    });

    const publicIds = result.resources.map((resource: any) => resource.public_id);

    if (publicIds.length > 0) {
      console.log(`Eliminando ${publicIds.length} archivo(s) de ${prefix}`);
      await cloudinary.api.delete_resources(publicIds, {
        resource_type: 'image',
      });
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  console.log(`Carpeta limpia: ${prefix}`);
}

async function main() {
  console.log('Iniciando limpieza Cloudinary pre-beta...');

  for (const folder of foldersToClean) {
    await deleteResourcesByPrefix(folder);
  }

  console.log('Limpieza Cloudinary completada.');
}

main().catch((error) => {
  console.error('Error limpiando Cloudinary:', error);
  process.exit(1);
});