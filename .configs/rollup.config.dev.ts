import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import path from 'path';
import readPackage from 'read-pkg';
import dts from 'rollup-plugin-dts';
import { swc } from 'rollup-plugin-swc3';
import ts from 'typescript';

const pkg = readPackage.sync();

const resolveOnly = (module) => {
  return (
    pkg?.dependencies?.[module] != null &&
    pkg?.devDependencies?.[module] != null &&
    pkg?.peerDependencies?.[module] != null
  );
};

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        format: 'cjs',
        file: 'dist/cjs/index.cjs',
        sourcemap: true,
      },
      {
        format: 'esm',
        file: 'dist/esm/index.mjs',
        sourcemap: true,
      },
    ],

    plugins: [
      nodeResolve({ resolveOnly }),
      typescript({
        tsconfig: 'tsconfig.prod.json',
        compilerOptions: {
          sourceMap: true,
        },
      }),
      swc(),
    ],
  },
  {
    input: 'dist/esm/src/index.d.ts',
    output: [
      {
        file: 'dist/cjs/index.d.cts',
        format: 'cjs',
      },
      {
        file: 'dist/esm/index.d.mts',
        format: 'esm',
      },
    ],
    plugins: [
      nodeResolve({ resolveOnly }),
      dts({
        compilerOptions: {
          baseUrl: 'dist/cjs',
          paths: ts.readConfigFile(path.resolve('./tsconfig.json'), (p) => readFileSync(p, 'utf8')).config
            .compilerOptions.paths,
        },
      }),
    ],
  },
];
