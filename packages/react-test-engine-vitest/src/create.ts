import type { ComponentType } from "react";
import { type OptionsType, create as baseCreate } from "react-test-engine";
import { vi } from "vitest";

/**
 * Creates engine for unit-testing of react component
 * @param Component target component
 * @param defaultProps stubs for required props
 * @param options named accessors for rendered components and their props and callbacks
 * @returns function that renders components and initializes accessors
 */
export function create<
	Props,
	Queries extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: supports any component
		keyof JSX.IntrinsicElements | ComponentType<any>
	>,
	Callbacks extends Record<string, [keyof Queries & string, string]>,
	Properties extends Record<string, [keyof Queries, string]>,
	Hooks extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: should extend Function
		(...args: any[]) => any
	>,
>(
	Component: ComponentType<Props>,
	defaultProps: Props,
	options: Omit<
		OptionsType<Queries, Callbacks, Properties, Hooks>,
		"mockFunctionValue" | "getMockArguments"
	>,
) {
	return baseCreate(Component, defaultProps, {
		...options,

		mockFunctionValue: (hook, value) => {
			vi.mocked(hook).mockReturnValueOnce(value);
		},

		getMockArguments: (hook, callIndex) => {
			return vi.mocked(hook).mock.calls[callIndex] as Parameters<typeof hook>;
		},
	});
}
