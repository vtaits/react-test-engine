import { type ReactElement, useState } from "react";
import { expect, test, vi } from "vitest";
import { create } from "..";

vi.mock("react", async () => {
	const result = (await vi.importActual("react")) as Record<string, unknown>;

	return {
		...result,
		useState: vi.fn(),
	};
});

function TestComponent(): ReactElement {
	const [counter, setCounter] = useState(0);
	const [disabled, setDisabled] = useState(false);

	return (
		<>
			<button
				className="counter"
				disabled={disabled}
				type="button"
				onClick={() => {
					setCounter((prevCounter) => prevCounter + 1);
				}}
			>
				{counter}
			</button>

			<button
				className="toggler"
				type="button"
				onClick={() => {
					setDisabled((prevDisabled) => !prevDisabled);
				}}
			>
				{disabled ? "Disabled" : "Enabled"}
			</button>
		</>
	);
}

const setCounter = vi.fn();
const setDisabled = vi.fn();

const render = create(
	TestComponent,
	{},
	{
		queries: {
			counter: {
				component: "button",
				className: "counter",
			},

			toggler: {
				component: "button",
				className: "toggler",
			},
		},

		properties: {
			counterButtonDisabled: ["counter", "disabled"],
			counterText: ["counter", "children"],
			togglerText: ["toggler", "children"],
		},

		callbacks: {
			increase: ["counter", "onClick"],
			toggle: ["toggler", "onClick"],
		},

		hooks: {
			counter: useState,
			disabled: useState,
		},

		hookOrder: ["counter", "disabled"],

		hookDefaultValues: {
			counter: [0, setCounter],
			disabled: [false, setDisabled],
		},

		mockFunctionValue: (hook, value) => {
			vi.mocked(hook).mockReturnValueOnce(value);
		},

		getMockArguments: (hook, callIndex) => {
			return vi.mocked(hook).mock.calls[callIndex] as Parameters<typeof hook>;
		},
	},
);

test("should init hooks correctly", () => {
	const engine = render({});

	expect(engine.getHookArguments("counter")).toEqual([0]);
	expect(engine.getHookArguments("disabled")).toEqual([false]);
});

test("should render counter correctly", () => {
	const engine = render(
		{},
		{
			counter: [2, vi.fn()],
		},
	);

	expect(engine.getProperty("counterText")).toBe(2);
});

test("should render enabled state correctly", () => {
	const engine = render(
		{},
		{
			disabled: [false, vi.fn()],
		},
	);

	expect(engine.getProperty("togglerText")).toBe("Enabled");
	expect(engine.getProperty("counterButtonDisabled")).toBe(false);
});

test("should render disabled state correctly", () => {
	const engine = render(
		{},
		{
			disabled: [true, vi.fn()],
		},
	);

	expect(engine.getProperty("togglerText")).toBe("Disabled");
	expect(engine.getProperty("counterButtonDisabled")).toBe(true);
});

test("should call `setCounter` correctly", () => {
	const engine = render({});

	engine.getCallback("increase")();

	expect(setCounter).toHaveBeenCalledTimes(1);

	const stateMapper = setCounter.mock.calls[0][0];

	if (typeof stateMapper !== "function") {
		throw new Error("state mapper is not a function");
	}

	expect(stateMapper(3)).toBe(4);
});

test("should call `setCounter` correctly", () => {
	const engine = render({});

	engine.getCallback("toggle")();

	expect(setDisabled).toHaveBeenCalledTimes(1);

	const stateMapper = setDisabled.mock.calls[0][0];

	if (typeof stateMapper !== "function") {
		throw new Error("state mapper is not a function");
	}

	expect(stateMapper(false)).toBe(true);
	expect(stateMapper(true)).toBe(false);
});
