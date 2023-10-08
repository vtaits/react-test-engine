# react-test-engine

[![NPM](https://img.shields.io/npm/v/react-test-engine.svg)](https://www.npmjs.com/package/react-test-engine)
![dependencies status](https://img.shields.io/librariesio/release/npm/react-test-engine)

Unit test utils for react components

[Api reference](https://vtaits.github.io/react-test-engine/)

## Example

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

Then let's describe accsessors of our components. In this case, only `button` is needed. Let's call it "targetButton"

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

A boilerplate is ready. Let's write a test that checks for correct render of children

```tsx
import { expect, test } from "vitest";

test("should render children correctly", () => {
  const engine = render({
    children: "Children for our test",
  });

  expect(engine.accessors.targetButton.getProps()).toBe(children);
});
```

Here is used a method `getProps`, but you can use other methods. Full list:

- `get` - get an element or throw an error if element is not found of there are more than one element by curreny query;
- `getProps` - get props of the element or throw an error if element is not found of there are more than one element by curreny query;
- `getAll` - get array of all mathed elements or throw an error if there are not elements for curreny query;
- `query` - get an element or return null if element is not found or throw an error if there are no matched elements for curreny query;
- `queryAll` - get array of all mathed elements.

[react-shallow-search](https://github.com/vtaits/react-shallow-search) is used.

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
  // !!!!!!!!!!!!!!!
  // ADDED `callbacks` section
  callbacks: {
    onClickTarget: ["targetButton", "onClick"],
  },
});
```

The first value of the tupple is a key of `queries`. The second value is the key of props

Let's write a test for the callback;

```tsx
import type { MouseEvent } from "react";
import { expect, test, vi } from "vitest";

test("should call the callback correctly", () => {
	const callback = vi.fn();

	const page = setup({
		callback,
	});

	const event = {};

	page.getCallback("onClickTarget")(
		event as MouseEvent<HTMLButtonElement>,
	);

	expect(callback).toHaveBeenCalledTimes(1);
	expect(callback).toHaveBeenCalledWith(1, "2");
});
```