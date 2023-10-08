import mapValues from "lodash/mapValues";
import type { ComponentProps, ComponentType, ReactElement } from "react";
import {
	type AccessorsType,
	type ParamsType,
	type QueryType,
	createAccessors,
} from "react-shallow-search";
import { createRenderer } from "react-test-renderer/shallow";

type AccessorParamsType<
	// biome-ignore lint/suspicious/noExplicitAny: supports any component
	Component extends keyof JSX.IntrinsicElements | ComponentType<any>,
> = QueryType<Component> | [QueryType<Component>, ParamsType<Component>];

type Options<
	Queries extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: supports any component
		keyof JSX.IntrinsicElements | ComponentType<any>
	>,
	Callbacks extends Record<string, [keyof Queries, string]>,
> = {
	queries: {
		[Key in keyof Queries]: AccessorParamsType<Queries[Key]>;
	};
	callbacks?: {
		[Key in keyof Callbacks & string]: [Callbacks[Key][0], Callbacks[Key][1]];
	};
};

type EngineType<
	Queries extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: supports any component
		keyof JSX.IntrinsicElements | ComponentType<any>
	>,
	Callbacks extends Record<string, [keyof Queries & string, string]>,
> = {
	root: ReactElement | null | undefined;
	checkIsRendered: () => boolean;
	accessors: {
		[Key in keyof Queries]: AccessorsType<Queries[Key]>;
	};
	getCallback: <Key extends keyof Callbacks & string,>(
		callbackKey: Key,
		// biome-ignore lint/complexity/noBannedTypes: should return a function
	) => Function & ComponentProps<Queries[Callbacks[Key][0]]>[Callbacks[Key][1]];
};

export function create<
	Props,
	Queries extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: supports any component
		keyof JSX.IntrinsicElements | ComponentType<any>
	>,
	Callbacks extends Record<string, [keyof Queries & string, string]>,
>(
	Component: ComponentType<Props>,
	defaultProps: Props,
	{ queries, callbacks }: Options<Queries, Callbacks>,
) {
	const render = (props: Partial<Props>): EngineType<Queries, Callbacks> => {
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

		const getCallback = <Key extends keyof Callbacks & string,>(
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

		return {
			root,
			checkIsRendered: () => Boolean(root),
			accessors,
			getCallback,
		};
	};

	return render;
}
