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
> = {
	queries: {
		[Key in keyof Queries]: AccessorParamsType<Queries[Key]>;
	};
};

type EngineType<
	Queries extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: supports any component
		keyof JSX.IntrinsicElements | ComponentType<any>
	>,
> = {
	root: ReactElement | null | undefined;
	checkIsRendered: () => boolean;
	accessors: {
		[Key in keyof Queries]: AccessorsType<Queries[Key]>;
	};
	getCallback: <
		Key extends keyof Queries & string,
		PropName extends keyof ComponentProps<Queries[Key]> & string,
	>(
		accessorKey: Key,
		propName: PropName,
		// biome-ignore lint/complexity/noBannedTypes: should return a function
	) => Function & ComponentProps<Queries[Key]>[PropName];
};

export function create<
	Props,
	Queries extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: supports any component
		keyof JSX.IntrinsicElements | ComponentType<any>
	>,
>(
	Component: ComponentType<Props>,
	defaultProps: Props,
	options: Options<Queries>,
) {
	const render = (props: Partial<Props>): EngineType<Queries> => {
		const renderer = createRenderer();

		renderer.render(<Component {...defaultProps} {...props} />);

		const root = renderer.getRenderOutput();

		const accessors = mapValues(options.queries, (accessorsParams) => {
			if (Array.isArray(accessorsParams)) {
				return createAccessors(root, accessorsParams[0], accessorsParams[1]);
			}

			return createAccessors(root, accessorsParams);
		}) as {
			[Key in keyof Queries]: AccessorsType<Queries[Key]>;
		};

		const getCallback = <
			Key extends keyof Queries & string,
			PropName extends keyof ComponentProps<Queries[Key]> & string,
		>(
			accessorKey: Key,
			propName: PropName,
		) => {
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
