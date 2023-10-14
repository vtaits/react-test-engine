# react-test-engine

[![NPM](https://img.shields.io/npm/v/react-test-engine.svg)](https://www.npmjs.com/package/react-test-engine)
![dependencies status](https://img.shields.io/librariesio/release/npm/react-test-engine)

Unit test utils for react components

[Api reference](https://vtaits.github.io/react-test-engine/)

## Examples

- [Simple component](https://github.com/vtaits/react-test-engine/blob/main/packages/react-test-engine/src/tests/render.test.tsx)
- [Component with hooks](https://github.com/vtaits/react-test-engine/blob/main/packages/react-test-engine/src/tests/hooks.test.tsx)

## Installation

```sh
npm install react-test-engine react-test-renderer react-is --save-dev
```

or

```sh
yarn add react-test-engine react-test-renderer react-is --dev
```

## Quickstart

Let's test a component. I'm using `vitest`, but you can use your favourite test framework

```tsx
import type {
	ReactElement,
} from "react";

type Props = {
	callback: (foo: number, bar: string) => void;
	children?: string;
};

function Component({
	callback,
	children = undefined,
}: Props): ReactElement | null {
	const onClick = useCallback(() => {
		callback(1, "2");
	}, [callback]);

	return (
		<div className="my-wrapper">
			<button className="my-button" type="button" onClick={onClick}>
				{children}
			</button>
		</div>
	);
}
```

At first, we have to define stubs for required props of the component

```tsx
import { vi } from "vitest";

const defaultProps: Props = {
	callback: vi.fn(),
};
```

Then let's describe accsessors of rendered components. In this case, only `button` is needed. Let's call it "targetButton"

```tsx
import { create } from "react-test-engine";

const render = create(Component, defaultProps, {
	queries: {
		targetButton: {
			component: "button",
			className: "my-button",
		},
	},
});
```

A boilerplate is ready. Let's write a test that checks for the correct render of the children

```tsx
import { expect, test } from "vitest";

test("should render children correctly", () => {
	const engine = render({
		children: "Children for our test",
	});

	expect(engine.accessors.targetButton.getProps().children).toBe("Children for our test");
});
```

A method `getProps` is used here, but you can use other methods. The full list:

- `get` - returns an element or throw an error if element is not found or there are more than one element for curreny query;
- `getProps` - returns props of the element or throw an error if element is not found or there are more than one element for curreny query;
- `getAll` - returns array of all matched elements or throw an error if there are no elements for curreny query;
- `query` - returns an element or `null` if element is not found or throw an error if there are no matched elements for curreny query;
- `queryAll` - returns array of all matched elements.

[react-shallow-search](https://github.com/vtaits/react-shallow-search) is used.

`engine.accessors.targetButton.getProps().children` is too long. We can simplify it:

```tsx
import { create } from "react-test-engine";

const render = create(Component, defaultProps, {
	queries: {
		targetButton: {
			component: "button",
			className: "my-button",
		},
	},
	// !!!!!!!!!!!!!!!
	// ADDED `properties` SECTION
	properties: {
		targetChildren: ["targetButton", "children"],
	},
});
```

Then change a test:

```tsx
import { expect, test } from "vitest";

test("should render children correctly", () => {
	const engine = render({
		children: "Children for our test",
	});

	expect(engine.getProperty("targetChildren")).toBe("Children for our test");
});
```

Then let's test a callback. We can get it by props and check if this defined by ourselves, but there's an easy way. Let's change definition a little

```tsx
import { create } from "react-test-engine";

const render = create(Component, defaultProps, {
	queries: {
		targetButton: {
			component: "button",
			className: "my-button",
		},
	},
	properties: {
		targetChildren: ["targetButton", "children"],
	},
	// !!!!!!!!!!!!!!!
	// ADDED `callbacks` SECTION
	callbacks: {
		onClickTarget: ["targetButton", "onClick"],
	},
});
```

The first value of the tupple is the key of `queries`. The second value is the key of props

Let's write a test for the callback:

```tsx
import type { MouseEvent } from "react";
import { expect, test, vi } from "vitest";

test("should call callback correctly", () => {
	const callback = vi.fn();

	const engine = render({
		callback,
	});

	const event = {};

	engine.getCallback("onClickTarget")(
		event as MouseEvent<HTMLButtonElement>,
	);

	expect(callback).toHaveBeenCalledTimes(1);
	expect(callback).toHaveBeenCalledWith(1, "2");
});
```
