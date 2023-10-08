import type { ComponentProps, ComponentType, ReactElement } from "react";
import type {
	AccessorsType,
	ParamsType,
	QueryType,
} from "react-shallow-search";

export type AccessorParamsType<
	// biome-ignore lint/suspicious/noExplicitAny: supports any component
	Component extends keyof JSX.IntrinsicElements | ComponentType<any>,
> = QueryType<Component> | [QueryType<Component>, ParamsType<Component>];

export type OptionsType<
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

export type EngineType<
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
