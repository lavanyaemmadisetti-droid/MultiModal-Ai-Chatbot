import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize dotenv configuration with robust path resolution.
 * Ensures backend/.env is found whether running from workspace root or backend directory.
 */
export const initEnv = () => {
  const candidatePaths = [
    // 1. Relative to this file: backend/src/config/ -> backend/.env
    path.resolve(__dirname, '../../.env'),
    // 2. Relative to process.cwd(): backend/.env
    path.resolve(process.cwd(), 'backend/.env'),
    // 3. Directly in process.cwd(): .env
    path.resolve(process.cwd(), '.env')
  ];

  let loaded = false;
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate, override: true });
      loaded = true;
      break;
    }
  }

  if (!loaded) {
    dotenv.config();
  }
};

// Execute immediately when imported
initEnv();

export default initEnv;
