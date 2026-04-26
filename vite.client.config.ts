import { existsSync, globSync, mkdirSync, rmSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { defineConfig } from 'vite';

const outputDirectory = resolve('dist-client');
const virtualEntryPrefix = 'virtual:island-entry:';
const hydrationRuntimePath = resolve('src/utils/island.ts');

const islandEntries = globSync('src/utils/jsx/islands/*.tsx')
    .filter((file) => !file.endsWith('.spec.ts'))
    .sort()
    .map((file) => ({
        name: basename(file, extname(file)),
        path: resolve(file),
    }));

if (islandEntries.length === 0) {
    console.warn('No island entries found. Skipping client build.');
    if (existsSync(outputDirectory)) {
        rmSync(outputDirectory, { recursive: true });
    }
    mkdirSync(outputDirectory, { recursive: true });
    process.exit(0);
}

const islandEntryByName = new Map(
    islandEntries.map((entry) => [entry.name, entry]),
);
const islandEntryByPath = new Map(
    islandEntries.map((entry) => [entry.path, entry]),
);

const parseCreateIslandDeclaration = (source: string) => {
    const match = source.match(
        /export\s+default\s+createIsland\(\s*([^,]+)\s*,\s*['"]([^'"]+)['"]\s*\)\s*;?/,
    );
    if (!match || !match[1] || !match[2]) {
        return null;
    }

    return {
        componentReference: match[1].trim(),
        declaredFile: match[2],
        fullMatch: match[0],
    };
};

export default defineConfig({
    publicDir: false,
    plugins: [
        {
            name: 'virtual-island-entries',
            resolveId(source) {
                if (!source.startsWith(virtualEntryPrefix)) {
                    return null;
                }

                return `\0${source}`;
            },
            // Strip the SSR wrapper from island modules in the client build.
            transform(code, id) {
                const entry = islandEntryByPath.get(id);
                if (!entry) {
                    return null;
                }

                const declaration = parseCreateIslandDeclaration(code);
                if (!declaration) {
                    throw new Error(
                        `Island file "${id}" must export its default component via createIsland(..., '<file>.tsx').`,
                    );
                }

                if (declaration.declaredFile !== `${entry.name}.tsx`) {
                    throw new Error(
                        [
                            `Island filename mismatch for "${entry.path}".`,
                            `createIsland declares "${declaration.declaredFile}", but the actual file builds as "${entry.name}.tsx".`,
                            'Keep these names aligned so SSR script tags match generated client bundles.',
                        ].join(' '),
                    );
                }

                return code
                    .replace(
                        declaration.fullMatch,
                        `export default ${declaration.componentReference};`,
                    )
                    .replace(
                        /import\s+(?:createIsland\s+)?from\s+['"]\.\.\/island\.tsx['"];?\n?/g,
                        '',
                    );
            },
            // Generate one virtual hydration entry per island source file.
            load(id) {
                if (!id.startsWith(`\0${virtualEntryPrefix}`)) {
                    return null;
                }

                const islandName = id.slice(`\0${virtualEntryPrefix}`.length);
                const entry = islandEntryByName.get(islandName);
                if (!entry) {
                    throw new Error(
                        `Missing island component for virtual entry "${islandName}"`,
                    );
                }

                return [
                    `import Component from ${JSON.stringify(entry.path)};`,
                    `import hydrateIsland from ${JSON.stringify(hydrationRuntimePath)};`,
                    '',
                    `hydrateIsland(${JSON.stringify(islandName)}, Component);`,
                ].join('\n');
            },
        },
    ],
    build: {
        target: 'es2022',
        outDir: outputDirectory,
        emptyOutDir: true,
        sourcemap: true,
        manifest: 'islands/manifest.json',
        rollupOptions: {
            // Generate a separate client entry for each island, based on the file name.
            input: Object.fromEntries(
                islandEntries.map((entry) => [
                    entry.name,
                    `${virtualEntryPrefix}${entry.name}`,
                ]),
            ),
            output: {
                // Place island chunks in a directory that doesn't conflict with the API.
                entryFileNames: 'islands/[name]-[hash].js',
                chunkFileNames: 'islands/chunks/[name]-[hash].js',
                assetFileNames: 'islands/assets/[name]-[hash][extname]',
                // Share the core React hydration code across all islands as a separate chunk.
                manualChunks(id) {
                    const normalizedId = id.replaceAll('\\', '/');

                    if (
                        normalizedId.includes('/node_modules/react/') ||
                        normalizedId.includes('/node_modules/react-dom/') ||
                        normalizedId ===
                            hydrationRuntimePath.replaceAll('\\', '/')
                    ) {
                        return 'hydration-runtime';
                    }

                    return undefined;
                },
            },
        },
    },
});
