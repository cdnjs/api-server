import { execSync } from 'node:child_process';

export const setup = () => {
    console.log('Building client islands...');
    execSync('npx vite build --config vite.client.config.ts', {
        stdio: 'inherit',
    });
};
