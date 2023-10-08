import type { ComponentProps, ComponentType, ReactElement } from "react";
import type {
	AccessorsType,
	ParamsType,
	QueryType,
} from "react-shallow-search";

/**
 * Parameters of accessors in the format of `react-shallow-search`.
 * It can be an query object
 *
 * ```
 * { component: "div", className: "foo", props: { title: "bar" } }
 * ```
 *
 * or a tupple of query object and additional parameters
 *
 * ```
 * [
 *   { component: "div", className: "foo", props: { title: "bar" } },
 *   { getChildren: (element) => [], match: (element, query) => true }
 * ]
 * ```
 */
export type AccessorParamsType<
	// biome-ignore lint/suspicious/noExplicitAny: supports any component
	Component extends keyof JSX.IntrinsicElements | ComponentType<any>,
> = QueryType<Component> | [QueryType<Component>, ParamsType<Component>];

/**
 * Options of the engine
 */
export type OptionsType<
	Queries extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: supports any component
		keyof JSX.IntrinsicElements | ComponentType<any>
	>,
	Callbacks extends Record<string, [keyof Queries, string]>,
> = {
	/**
	 * An object whose values is queries to rendered elements, and keys can be used to access them
	 *
	 * ```
	 * const render = create(Component, defaultProps, {
	 *   queries: {
	 *     fooButton: {
	 *       component: 'button',
	 *       className: 'foo',
	 *     },
	 *   },
	 * });
	 *
	 * const engine = render({});
	 *
	 * const fooButtonProps = page.accessors.fooButton.getProps();
	 * ```
	 */
	queries: {
		[Key in keyof Queries]: AccessorParamsType<Queries[Key]>;
	};
	/**
	 * And object whose values is tupples of keys of queries and names of props that contains callbacks
	 *
	 * ```
	 * const render = create(Component, defaultProps, {
	 *   queries: {
	 *     fooButton: {
	 *       component: 'button',
	 *       className: 'foo',
	 *     },
	 *   },
	 *
	 *   callbacks: {
	 *     onFooClick: ['fooButton', 'onClick'],
	 *   },
	 * });
	 *
	 * const engine = render({});
	 *
	 * page.getCallback('onFooClick')({} as MouseEvent);
	 * ```
	 */
	callbacks?: {
		[Key in keyof Callbacks & string]: [Callbacks[Key][0], Callbacks[Key][1]];
	};
};

export type EngineType<
	Queries extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: supports any component
		keyof JSX.IntrinsicElements | ComponentType<any>
	>,
	Callbacks extends Record<string, [keyof Queries & string, string]>,
> = {
	/**
	 * Root node of rendered react tree
	 */
	root: ReactElement | null | undefined;
	/**
	 * Check if any react elements are rendered
	 */
	checkIsRendered: () => boolean;
	/**
	 * An object whose keys are keys of the `queries` parameter and whose values are accessors in the format of `react-shallow-search`
	 *
	 * ```
	 * const render = create(Component, defaultProps, {
	 *   queries: {
	 *     fooButton: {
	 *       component: 'button',
	 *       className: 'foo',
	 *     },
	 *   },
	 * });
	 *
	 * const engine = render({});
	 *
	 * const fooButtonProps = page.accessors.fooButton.getProps();
	 */
	accessors: {
		[Key in keyof Queries]: AccessorsType<Queries[Key]>;
	};
	/**
	 * Get callback from parameters by the key
	 * @param callbackKey a key of the `callbacks` parameter
	 * @returns callback by paramteres of the `callbacks[callbackKey]`
	 * @throws if `callbacks` parameter is not setted
	 * @throws if the property value is not a function
	 *
	 * ```
	 * const render = create(Component, defaultProps, {
	 *   queries: {
	 *     fooButton: {
	 *       component: 'button',
	 *       className: 'foo',
	 *     },
	 *   },
	 *
	 *   callbacks: {
	 *     onFooClick: ['fooButton', 'onClick'],
	 *   },
	 * });
	 *
	 * const engine = render({});
	 *
	 * page.getCallback('onFooClick')({} as MouseEvent);
	 * ```
	 */
	getCallback: <Key extends keyof Callbacks & string,>(
		callbackKey: Key,
		// biome-ignore lint/complexity/noBannedTypes: should return a function
	) => Function & ComponentProps<Queries[Callbacks[Key][0]]>[Callbacks[Key][1]];
};
