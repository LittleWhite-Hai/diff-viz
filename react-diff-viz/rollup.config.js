import dts from 'rollup-plugin-dts';

export default [
  {
    input: "./tsc-dist/react-diff-viz/src/index.js",
    output: {
      file: "./dist/react-diff-viz/index.js",
      format: "es",
    },
  },
  {
    input: "./tsc-dist/types/react-diff-viz/src/index.d.ts",
    output: {
      file: "./dist/react-diff-viz/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  }
];
