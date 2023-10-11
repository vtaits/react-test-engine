import { type MouseEvent, type ReactElement, useCallback } from "react";
import { expect, test, vi } from "vitest";
import { create } from "..";

type Props = {
	callback: (foo: number, bar: string) => number;
	children?: string;
	isRender: boolean;
};

function Component({
	callback,
	children = undefined,
	isRender,
}: Props): ReactElement | null {
	const onClick = useCallback(() => {
		callback(1, "2");

		return 3;
	}, [callback]);

	if (!isRender) {
		return null;
	}

	return (
		<div>
			<button type="button" onClick={onClick}>
				{children}
			</button>
		</div>
	);
}

const render = create(
	Component,
	{
		isRender: true,
		callback: vi.fn(),
	},
	{
		queries: {
			targetButton: {
				component: "button",
			},
		},
		callbacks: {
			onClickTarget: ["targetButton", "onClick"],
		},
		properties: {
			renderedChildren: ["targetButton", "children"],
		},
	},
);

test("[checkIsRendered] should not render", () => {
	const engine = render({
		isRender: false,
	});

	expect(engine.checkIsRendered()).toBe(false);
});

test("[getProperty] should render children", () => {
	const engine = render({
		children: "Test children",
	});

	expect(engine.getProperty("renderedChildren")).toBe("Test children");
});

test("[accessors] should render children", () => {
	const engine = render({
		children: "Test children",
	});

	expect(engine.accessors.targetButton.getProps().children).toBe(
		"Test children",
	);
});

test("[getCallback] should call callback", () => {
	const callback = vi.fn();

	const engine = render({
		callback,
	});

	const event = {};

	const result = engine.getCallback("onClickTarget")(
		event as MouseEvent<HTMLButtonElement>,
	);

	expect(result).toBe(3);

	expect(callback).toHaveBeenCalledTimes(1);
	expect(callback).toHaveBeenCalledWith(1, "2");
});
