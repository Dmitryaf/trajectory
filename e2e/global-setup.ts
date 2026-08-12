import { createServer } from 'vite';
import { writeDemoFile } from '../scripts/generate-demo-data.mjs';

export default async function globalSetup() {
  await writeDemoFile();
  const server = await createServer({
    logLevel: 'error',
    server: { host: '127.0.0.1', port: 4173, strictPort: true },
  });
  await server.listen();
  return async () => server.close();
}
