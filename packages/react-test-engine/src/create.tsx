import mapValues from "lodash/mapValues";
import type { ComponentType } from "react";
import { type AccessorsType, createAccessors } from "react-shallow-search";
import { createRenderer } from "react-test-renderer/shallow";
import { getMapHookKeyToLocalIndex } from "./getMapHookKeyToLocalIndex";
import { mockHookValues } from "./mockHookValues";
import type { EngineType, OptionsType } from "./types";

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
		(...args: any) => any
	>,
>(
	Component: ComponentType<Props>,
	defaultProps: Props,
	{
		queries,
		callbacks,
		properties,
		hooks,
		hookOrder,
		hookDefaultValues = {},
		mockFunctionValue,
		getMockArguments,
	}: OptionsType<Queries, Callbacks, Properties, Hooks>,
) {
	/**
	 * function that renders components and initializes accessors
	 * @param props props of target component
	 * @param hookValues values of hooks
	 * @returns engine for unit-testing
	 */
	const render = (
		props: Partial<Props>,
		hookValues: Partial<{
			[Key in keyof Hooks]: ReturnType<Hooks[Key]>;
		}> = {},
	): EngineType<Queries, Callbacks, Properties, Hooks> => {
		const mapHookKeyToLocalIndex =
			hooks && hookOrder ? getMapHookKeyToLocalIndex(hooks, hookOrder) : null;

		mockHookValues(
			hooks,
			hookOrder,
			hookDefaultValues,
			hookValues,
			mockFunctionValue,
		);

		const renderer = createRenderer();

		renderer.render(<Component {...defaultProps} {...props} />);

		const root = renderer.getRenderOutput();

		const accessors = mapValues(queries, (accessorsParams) => {
			if (Array.isArray(accessorsParams)) {
				return createAccessors(root, accessorsParams[0], accessorsParams[1]);
			}

			return createAccessors(root, accessorsParams);
		}) as {
			[Key in keyof Queries]: AccessorsType<Queries[Key]>;
		};

		const getCallback = <Key extends keyof Callbacks & string>(
			callbackKey: Key,
		) => {
			if (!callbacks) {
				throw new Error("`callbacks` option is not setted");
			}

			const [accessorKey, propName] = callbacks[callbackKey];
			const props = accessors[accessorKey].getProps();

			const callback = props[propName];

			if (typeof callback !== "function") {
				throw new Error(
					`accessor "${accessorKey}", prop "${propName}" is not a function`,
				);
			}

			return callback;
		};

		const getProperty = <Key extends keyof Properties & string>(
			propertyKey: Key,
		) => {
			if (!properties) {
				throw new Error("`properties` option is not setted");
			}

			const [accessorKey, propName] = properties[propertyKey];
			const props = accessors[accessorKey].getProps();

			return props[propName];
		};

		const getHookArguments = <Key extends keyof Hooks>(hookKey: Key) => {
			if (!hooks || !mapHookKeyToLocalIndex || !getMockArguments) {
				throw new Error(
					"Required parameters to initialize hooks: `hooks`, `hookOrder`, `mockFunctionValue`, `getMockArguments`",
				);
			}

			return getMockArguments(hooks[hookKey], mapHookKeyToLocalIndex[hookKey]);
		};

		return {
			root,
			checkIsRendered: () => Boolean(root),
			accessors,
			getCallback,
			getHookArguments,
			getProperty,
		};
	};

	return render;
}
