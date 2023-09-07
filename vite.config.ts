import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import path from "path";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: "globalThis",
            },
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true
                })
            ],
        },
    },
    resolve: {
      alias: {
            stream: "stream-browserify",
            os: "os-browserify/browser",
            util: "util",
            process: "process/browser",
            buffer: "buffer",
      },
    },
});
