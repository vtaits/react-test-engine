import { type ReactElement, useDebugValue } from "react";
import { type OptionsType, create as baseCreate } from "react-test-engine";
import { expect, test, vi } from "vitest";

import { create } from "./create";

vi.mock("react-test-engine");
const mockedCreate = vi.mocked(baseCreate);

type Props = {
	foo: number;
};

function TestComponent(props: Props): ReactElement {
	useDebugValue(props);

	return <div />;
}

const defaultProps = {
	foo: 0,
};

const options = {
	queries: {
		button: {
			component: "button" as const,
		},
	},
	callbacks: {
		onClick: ["button", "onClick"] as const,
	},
	properties: {
		children: ["button", "children"] as const,
	},
	hooks: {
		useHook: vi.fn(),
	},
	hookOrder: ["useHook"] as const,
	hookDefaultValues: {
		useHook: null,
	},
};

test("provide not changed options", () => {
	create(TestComponent, defaultProps, options);

	expect(mockedCreate).toHaveBeenCalledTimes(1);
	expect(mockedCreate.mock.calls[0][0]).toBe(TestComponent);
	expect(mockedCreate.mock.calls[0][1]).toBe(defaultProps);

	for (const [key, value] of Object.entries(options)) {
		expect(mockedCreate.mock.calls[0][2]).toHaveProperty(key, value);
	}
});

test("return a result of base `create`", () => {
	const engine = vi.fn();

	mockedCreate.mockReturnValue(engine);

	const result = create(TestComponent, defaultProps, options);

	expect(result).toBe(engine);
});

test("mockFunctionValue", () => {
	const { mockFunctionValue } = mockedCreate.mock.calls[0][2];

	if (!mockFunctionValue) {
		throw new Error("`mockFunctionValue` is not provided");
	}

	const mock = vi.fn().mockReturnValue("foo");

	mockFunctionValue(mock, "bar");

	expect(mock).toHaveBeenCalledTimes(0);

	expect(mock()).toBe("bar");
	expect(mock()).toBe("foo");
});

test("getMockArguments", () => {
	const { getMockArguments } = mockedCreate.mock.calls[0][2];

	if (!getMockArguments) {
		throw new Error("`getMockArguments` is not provided");
	}

	const mock = vi.fn();

	mock("foo", 1);
	mock("bar", 2);
	mock("baz", 3);

	expect(getMockArguments(mock, 1)).toEqual(["bar", 2]);
});
