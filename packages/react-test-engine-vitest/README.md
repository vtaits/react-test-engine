# react-test-engine-vitest

[![NPM](https://img.shields.io/npm/v/react-test-engine-vitest.svg)](https://www.npmjs.com/package/react-test-engine-vitest)
![dependencies status](https://img.shields.io/librariesio/release/npm/react-test-engine-vitest)

Integration of `react-test-engine` and `vitest`

The api of this wrapper is the api of `react-test-engine`. But `mockFunctionValue` and `getMockArguments` for testing hooks are provided automatically.

## Installation

```sh
npm install react-test-engine-vitest react-test-engine react-test-renderer react-is --save-dev
```

or

```sh
yarn add react-test-engine-vitest react-test-engine react-test-renderer react-is --dev
```

## Usage

```tsx
import { create } from 'react-test-engine-vitest';

const render = create(Component, defaultProps, {
  ...otherOptions,

  /**
   * You don't have to provide this
   */

  // mockFunctionValue: (hook, value) => {
  //   vi.mocked(hook).mockReturnValueOnce(value);
  // },

  // getMockArguments: (hook, callIndex) => {
  //   return vi.mocked(hook).mock.calls[callIndex];
  // },
});
```
