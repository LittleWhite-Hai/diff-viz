# <img src="./public/diff.ico" height="20" /> diff-viz

![ts][ts-badge]
![version][version-badge]
[![download-badge]][download-link]
![license][license-badge]
![test][test-badge]
![coverage][coverage-badge]
[![官网](https://img.shields.io/badge/Demo-example.com-red.svg)](https://littlewhite-hai.github.io/diff-viz/)

render JSON differences and custom your styles

## Install

two choices:

```bash
# react component, easy to start
npm install react-diff-viz

# function, flexible and extendable
npm install diff-viz
```

## Demo And Usage

**https://littlewhite-hai.github.io/diff-viz/**

![demo](./docs/public/demo.png)

## Features

- 🔍 Precise diff detection between complex JSON objects
- ⚡ Efficient array alignment using LCS (Longest Common Subsequence) algorithm
- 🔄 Support for nested arrays and objects with any level of complexity
- 🎨 Customizable styling of diff results
- 🧪 Well-tested with comprehensive test cases

## Test Coverage

The library is thoroughly tested to ensure reliability and correctness:

| File              | % Statements | % Branches | % Functions | % Lines |
| ----------------- | ------------ | ---------- | ----------- | ------- |
| diff-algorithm.ts | 69.84%       | 86.14%     | 79.16%      | 69.84%  |

### Test Scenarios

We test various scenarios to ensure robust diff detection:

- ✅ Simple object differences
- ✅ Nested object structures
- ✅ Array handling with different alignment strategies
- ✅ Multi-dimensional arrays
- ✅ Special value comparisons (null, undefined, dates)
- ✅ Custom equality functions

## License

[MIT](/LICENSE)

[ts-badge]: https://badgen.net/badge/-/TypeScript/blue?icon=typescript&label
[download-badge]: https://img.shields.io/npm/dm/diff-viz
[download-link]: https://www.npmjs.com/package/diff-viz
[version-badge]: https://img.shields.io/npm/v/diff-viz
[license-badge]: https://img.shields.io/github/license/Milkdown/milkdown
[test-badge]: https://img.shields.io/badge/tests-22%20passed-brightgreen
[coverage-badge]: https://img.shields.io/badge/coverage-86%25%20branches-yellow
