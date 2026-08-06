import MagicString from 'magic-string';
import { existsSync, globSync, mkdirSync, rmSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';
import { defineConfig, normalizePath } from 'vite';

const outputDirectory = resolve('dist-client');
const virtualEntryPrefix = 'virtual:island-entry:';
const hydrationRuntimePath = resolve('src/utils/island.ts');

const isDev = process.env.WRANGLER_COMMAND === 'dev';

const isCssImport = (source: string) => /\.css(?:$|\?)/.test(source);

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
    islandEntries.map((entry) => [normalizePath(entry.path), entry]),
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
    define: {
        'process.env.NODE_ENV': JSON.stringify(
            isDev ? 'development' : 'production',
        ),
    },
    plugins: [
        {
            name: 'raw-css-imports',
            enforce: 'pre',
            // Force CSS to be imported as a raw string, matching how Wrangler handles CSS imports.
            resolveId(source, importer, options) {
                if (!isCssImport(source)) {
                    return null;
                }

                return this.resolve(
                    `${source}${source.includes('?') ? '&' : '?'}raw`,
                    importer,
                    { ...options, skipSelf: true },
                );
            },
        },
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
                const entry = islandEntryByPath.get(normalizePath(id));
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

                const transformed = new MagicString(code);
                const declarationStart = code.indexOf(declaration.fullMatch);
                if (declarationStart === -1) {
                    throw new Error(
                        `Failed to locate createIsland declaration in "${id}" for sourcemap transform.`,
                    );
                }

                transformed.overwrite(
                    declarationStart,
                    declarationStart + declaration.fullMatch.length,
                    `export default ${declaration.componentReference};`,
                );

                for (const match of code.matchAll(
                    /import\s+(?:createIsland\s+)?from\s+['"]\.\.\/island\.tsx['"];?\n?/g,
                )) {
                    if (match.index === undefined) {
                        continue;
                    }
                    transformed.remove(
                        match.index,
                        match.index + match[0].length,
                    );
                }

                return {
                    code: transformed.toString(),
                    map: transformed.generateMap({
                        hires: true,
                        source: id,
                        includeContent: true,
                    }),
                };
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
        minify: isDev ? false : undefined,
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
                    const normalizedId = normalizePath(id);

                    if (
                        normalizedId.includes('/node_modules/react/') ||
                        normalizedId.includes('/node_modules/react-dom/') ||
                        normalizedId === normalizePath(hydrationRuntimePath)
                    ) {
                        return 'hydration-runtime';
                    }

                    return undefined;
                },
            },
        },
    },
});
