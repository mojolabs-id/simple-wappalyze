import { defineConfig } from "tsup";
import tsconfig from "./tsconfig.json";

export default defineConfig((options)=>({
  entry: ['src/**/*.ts'],
  loader: {
    '.d.ts': 'copy',
    '.html': 'copy',
    '.txt': 'copy',
    '.md': 'copy',
    '.ico': 'copy',
    '.bak': 'empty'
  },
  dts:true,
  splitting: false,
  sourcemap: false,
  minify: true,
  clean: true,
  skipNodeModulesBundle: true,
  target: tsconfig.compilerOptions.target as "es2016",
  publicDir: 'public',
  outDir:"./dist",
  format: ["cjs"], //["esm", "cjs"]
  platform: 'node',
  treeshake: false,
}));
