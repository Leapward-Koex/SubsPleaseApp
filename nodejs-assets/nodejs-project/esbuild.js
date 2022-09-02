require('esbuild')
    .build({
        entryPoints: ['main.ts'],
        bundle: true,
        outfile: 'main.js',
        platform: 'node',
        minify: true,
        external: ['rn-bridge'],
    })
    .catch(() => process.exit(1));
