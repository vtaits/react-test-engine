import { type ReactElement, useCallback } from "react";
import type { QueryType } from "react-shallow-search";
import { expect, test, vi } from "vitest";
import { create } from "..";

type Props = {
	callback: (foo: number, bar: string) => [number, string];
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

const setup = create(
	Component,
	{
		isRender: true,
		callback: vi.fn(),
	},
	{
		queries: {
			targetButton: {
				component: "button",
			} as QueryType<"button">,
		},
	},
);

test("should not render", () => {
	const page = setup({
		isRender: false,
	});

	expect(page.checkIsRendered()).toBe(false);
});

test("should render children", () => {
	const page = setup({
		children: "Test children",
	});

	expect(page.accessors.targetButton.getProps().children).toBe("Test children");
});

test("should call callback", () => {
	const callback = vi.fn();

	const page = setup({
		callback,
	});

	const result = page.getCallback("targetButton", "onClick")();

	expect(result).toBe(3);

	expect(callback).toHaveBeenCalledTimes(1);
	expect(callback).toHaveBeenCalledWith(1, "2");
});
