require('esbuild')
    .build({
        entryPoints: ['main.ts'],
        bundle: true,
        outfile: 'main.js',
        platform: 'node',
        external: ['rn-bridge'],
    })
    .catch(() => process.exit(1));
