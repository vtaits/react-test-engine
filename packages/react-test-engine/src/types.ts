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
	Properties extends Record<string, [keyof Queries, string]>,
	Hooks extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: should extend Function
		(...args: any) => any
	>,
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
	 * An object whose values is tupples of keys of queries and names of props of components found by queries
	 *
	 * ```
	 * const render = create(Component, defaultProps, {
	 *   queries: {
	 *     content: {
	 *       component: 'div',
	 *       className: 'foo',
	 *     },
	 *   },
	 *
	 *   properties: {
	 *     contentChildren: ['content', 'children'],
	 *   },
	 * });
	 *
	 * const engine = render({});
	 *
	 * const contentChildren = page.getProperty('contentChildren');
	 * ```
	 */
	properties?: {
		[Key in keyof Properties & string]: [
			Properties[Key][0],
			Properties[Key][1],
		];
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
	/**
	 * An object whose values is hooks that called in currect component, and keys can be used to access them
	 *
	 * ```
	 * import { vi } from "vitest";
	 *
	 * const render = create(Component, defaultProps, {
	 *   queries: {},
	 *   hooks: {
	 *     firstState: useState,
	 *     secondState: useState,
	 *     someCallback: useCallback,
	 *     someEffect: useEffect,
	 *   },
	 *   hookOrder: [
	 *     "firstState",
	 *     "someCallback",
	 *     "someEffect",
	 *     "secondState",
	 *   ],
	 * });
	 *
	 * const engine = render({}, {
	 *   firstState: [0, vi.fn()],
	 *   someCallback: vi.fn(),
	 * });
	 * ```
	 */
	hooks?: Hooks;
	/**
	 * Order of calling of hooks
	 *
	 * ```
	 * function Component() {
	 *   const [counter, setCounter] = useState(0);
	 *
	 *   useEffect(() => {
	 *     setCounter(3);
	 *   }, []);
	 *
	 *   // ...
	 * }
	 *
	 * const render = create(Component, defaultProps, {
	 *   queries: {},
	 *   hooks: {
	 *     counter: useState,
	 *     someEffect: useEffect,
	 *   },
	 *   hookOrder: [
	 *     "counter",
	 *     "someEffect",
	 *   ],
	 * });
	 * ```
	 */
	hookOrder?: readonly (keyof Hooks)[];
	/**
	 * Mocked returns of hooks by default
	 *
	 * ```
	 * import { vi } from "vitest";
	 *
	 * const render = create(Component, defaultProps, {
	 *   queries: {},
	 *   hooks: {
	 *     firstState: useState,
	 *     secondState: useState,
	 *     someCallback: useCallback,
	 *     someEffect: useEffect,
	 *   },
	 *   hookOrder: [
	 *     "firstState",
	 *     "someCallback",
	 *     "someEffect",
	 *     "secondState",
	 *   ],
	 *   hookDefaultValues: {
	 *     firstState: [0, vi.fn()],
	 *     secondState: [false, vi.fn()],
	 *     someCallback: vi.fn(),
	 *   },
	 * });
	 * ```
	 */
	hookDefaultValues?: Partial<{
		[Key in keyof Hooks]: ReturnType<Hooks[Key]>;
	}>;
	/**
	 * Mock function return using test engine
	 * @param fn function for mock
	 * @param value mocked value
	 *
	 * ```
	 * import { vi } from "vitest";
	 *
	 * const render = create(Component, defaultProps, {
	 *   // ...
	 *   mockFunctionValue: (fn, value) => {
	 *     vi.mocked(fn).mockReturnValueOnce(value);
	 *   },
	 * });
	 * ```
	 */
	// biome-ignore lint/suspicious/noExplicitAny: should extend Function
	mockFunctionValue?: <Fn extends (...args: any) => any>(
		fn: Fn,
		value: unknown,
	) => void;
	/**
	 * Get arguments of called function by index using test engine
	 * @param fn mocked function
	 * @param callIndex index of call
	 *
	 * ```
	 * import { vi } from "vitest";
	 *
	 * const render = create(Component, defaultProps, {
	 *   // ...
	 *   getMockArguments: (fn, callIndex) => {
	 *     return vi.mocked(fn).mock.calls[callIndex];
	 *   },
	 * });
	 * ```
	 */
	// biome-ignore lint/suspicious/noExplicitAny: should extend Function
	getMockArguments?: <Fn extends (...args: any) => any>(
		fn: Fn,
		callIndex: number,
	) => Parameters<Fn>;
};

export type EngineType<
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
	 * Get prop value from parameters by the key
	 * @param propertyKey a key of the `properties` parameter
	 * @returns value by paramteres of the `properties[propertyKey]`
	 *
	 * ```
	 * const render = create(Component, defaultProps, {
	 *   queries: {
	 *     content: {
	 *       component: 'div',
	 *       className: 'foo',
	 *     },
	 *   },
	 *
	 *   properties: {
	 *     contentChildren: ['content', 'children'],
	 *   },
	 * });
	 *
	 * const engine = render({});
	 *
	 * const contentChildren = page.getProperty('contentChildren');
	 * ```
	 */
	getProperty: <Key extends keyof Properties & string,>(
		propertyKey: Key,
	) => ComponentProps<Queries[Properties[Key][0]]>[Properties[Key][1]];
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
	/**
	 * Get the arguments of the called hook function
	 * @param hookKey a key of the `hooks` parameter
	 * @returns the arguments with which the hook by key was called
	 * @throws if `hooks` not setted
	 * @throws if `hookOrder` not setted
	 * @throws if `mockFunctionValue` not setted
	 * @throws if `getMockArguments` not setted
	 *
	 * ```
	 * import { vi } from "vitest";
	 *
	 * function Component() {
	 *   const [counter, setCounter] = useState(0);
	 *
	 *   // ...
	 * }
	 *
	 * const render = create(Component, defaultProps, {
	 *   queries: {},
	 *   hooks: {
	 *     counter: useState,
	 *   },
	 *   hookOrder: [
	 *     "counter",
	 *   ],
	 *   mockFunctionValue: (fn, value) => {
	 *     vi.mocked(fn).mockReturnValueOnce(value);
	 *   },
	 *   getMockArguments: (fn, callIndex) => {
	 *     return vi.mocked(fn).mock.calls[callIndex];
	 *   },
	 * });
	 *
	 * const engine = render({});
	 *
	 * assert.strictEqual(
	 *   engine.getHookArguments("counter"),
	 *   0,
	 * );
	 * ```
	 */
	getHookArguments: <Key extends keyof Hooks>(
		hookKey: Key,
	) => Parameters<Hooks[Key]>;
};
