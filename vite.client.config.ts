import { globSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { defineConfig } from 'vite';

const virtualEntryPrefix = 'virtual:island-entry:';
const hydrationRuntimePath = resolve('src/utils/island.ts');

const islandEntries = globSync('src/utils/jsx/islands/*.tsx')
    .filter((file) => !file.endsWith('.spec.ts'))
    .sort()
    .map((file) => ({
        name: basename(file, extname(file)),
        path: resolve(file),
    }));

const islandEntryByName = new Map(
    islandEntries.map((entry) => [entry.name, entry]),
);
const islandEntryByPath = new Map(
    islandEntries.map((entry) => [entry.path, entry]),
);

const parseWithIslandDeclaration = (source: string) => {
    const match = source.match(
        /export\s+default\s+withIsland\(\s*([^,]+)\s*,\s*['"]([^'"]+)['"]\s*\)\s*;?/,
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

                const declaration = parseWithIslandDeclaration(code);
                if (!declaration) {
                    throw new Error(
                        `Island file "${id}" must export its default component via withIsland(..., '<file>.tsx').`,
                    );
                }

                if (declaration.declaredFile !== `${entry.name}.tsx`) {
                    throw new Error(
                        [
                            `Island filename mismatch for "${entry.path}".`,
                            `withIsland declares "${declaration.declaredFile}", but the actual file builds as "${entry.name}.tsx".`,
                            'Keep these names aligned so SSR script tags match generated client bundles.',
                        ].join(' '),
                    );
                }

                return code.replace(
                    declaration.fullMatch,
                    `export default ${declaration.componentReference};`,
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
        outDir: 'dist-client',
        emptyOutDir: true,
        sourcemap: true,
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
                entryFileNames: 'islands/[name].js',
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
