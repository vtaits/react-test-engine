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
	Component extends keyof JSX.IntrinsicElements | ComponentType<any>,
> = QueryType<Component> | [QueryType<Component>, ParamsType<Component>];

type Options<
	QueryKey extends string,
	Queries extends Record<
		QueryKey,
		keyof JSX.IntrinsicElements | ComponentType<any>
	>,
> = {
	queries: {
		[key in QueryKey]: AccessorParamsType<Queries[QueryKey]>;
	};
};

type EngineType<
	QueryKey extends string,
	Queries extends Record<
		QueryKey,
		keyof JSX.IntrinsicElements | ComponentType<any>
	>,
> = {
	root: ReactElement | null | undefined;
	checkIsRendered: () => boolean;
	accessors: {
		[key in QueryKey]: AccessorsType<Queries[QueryKey]>;
	};
	getCallback: <Key extends QueryKey>(
		accessorKey: Key,
		propName: keyof ComponentProps<Queries[Key]> & string,
	) => Function & ComponentProps<Queries[QueryKey]>["propName"];
};

export function create<
	Props,
	QueryKey extends string,
	Queries extends Record<
		QueryKey,
		keyof JSX.IntrinsicElements | ComponentType<any>
	>,
>(
	Component: ComponentType<Props>,
	defaultProps: Props,
	options: Options<QueryKey, Queries>,
) {
	const render = (props: Partial<Props>): EngineType<QueryKey, Queries> => {
		const renderer = createRenderer();

		renderer.render(<Component {...defaultProps} {...props} />);

		const root = renderer.getRenderOutput();

		const accessors: {
			[key in QueryKey]: AccessorsType<Queries[QueryKey]>;
		} = mapValues(options.queries, (accessorsParams) => {
			if (Array.isArray(accessorsParams)) {
				return createAccessors(root, accessorsParams[0], accessorsParams[1]);
			}

			return createAccessors(root, accessorsParams);
		});

		const getCallback = <Key extends QueryKey>(
			accessorKey: Key,
			propName: keyof ComponentProps<Queries[Key]> & string,
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
