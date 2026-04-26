import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

export const setup = () => {
    if (process.env.VITEST_EXTERNAL_API_URL) {
        mkdirSync('dist-client', { recursive: true });
        return;
    }

    console.log('Building client islands...');
    execSync('npx vite build --config vite.client.config.ts', {
        stdio: 'inherit',
    });
};
