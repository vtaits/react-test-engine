import type { ReactElement } from "react";
import { type AccessorsType, createAccessors } from "react-shallow-search";
import { createRenderer } from "react-test-renderer/shallow";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { create } from "./create";

type TestComponentProps = Readonly<{
	foo?: number;
	bar: string;
}>;

function TestComponent({
	foo = undefined,
	bar,
}: TestComponentProps): ReactElement {
	return <div data-foo={foo} data-bar={bar} />;
}

const defaultProps: TestComponentProps = { bar: "testBar" };

vi.mock("react-shallow-search");
const mockedCreateAccessors = vi.mocked(createAccessors);

const accessors: AccessorsType<"div"> = {
	get: vi.fn(),
	getProps: vi.fn(),
	getAll: vi.fn(),
	query: vi.fn(),
	queryAll: vi.fn(),
};

vi.mock("react-test-renderer/shallow", () => ({
	createRenderer: vi.fn(),
}));
const mockedCreateRenderer = vi.mocked(createRenderer);

const output = <main />;

const getRenderOutput = vi.fn();
const render = vi.fn();

const renderer = {
	getRenderOutput,
	render,
} as unknown as ReturnType<typeof createRenderer>;

beforeEach(() => {
	mockedCreateAccessors.mockReturnValue(accessors);
	mockedCreateRenderer.mockReturnValue(renderer);
	getRenderOutput.mockReturnValue(output);
});

afterEach(() => {
	vi.resetAllMocks();
});

describe("createRenderer", () => {
	function getComponentProps() {
		expect(render).toHaveBeenCalledTimes(1);
		const node = render.mock.calls[0][0];

		expect(node.type).toBe(TestComponent);
		return node.props;
	}

	test.each([
		[
			{ foo: 3, bar: "redefinedBar" },
			{ foo: 3, bar: "redefinedBar" },
		],
		[{}, { bar: "testBar" }],
	])("provide correct props for %s", (props, expectedProps) => {
		const engine = create(TestComponent, defaultProps, {
			queries: {},
		});

		engine(props);

		expect(getComponentProps()).toEqual(expectedProps);
	});

	test("init root correctly", () => {
		const engine = create(TestComponent, defaultProps, {
			queries: {},
		});

		expect(mockedCreateRenderer).toHaveBeenCalledTimes(0);
		expect(render).toHaveBeenCalledTimes(0);
		expect(getRenderOutput).toHaveBeenCalledTimes(0);

		const result = engine({});

		expect(result.root).toBe(output);

		expect(mockedCreateRenderer).toHaveBeenCalledTimes(1);
		expect(render).toHaveBeenCalledTimes(1);
		expect(getRenderOutput).toHaveBeenCalledTimes(1);
	});
});

describe("accessors", () => {
	test("should provide accessors by query", () => {
		const query = {
			className: "test",
		};

		const engine = create(TestComponent, defaultProps, {
			queries: {
				accessorKey: query,
			},
		});

		const result = engine({});

		expect(result.accessors.accessorKey).toBe(accessors);

		expect(mockedCreateAccessors).toHaveBeenCalledTimes(1);
		expect(mockedCreateAccessors).toHaveBeenCalledWith(output, query);
	});

	test("should provide accessors by query and params", () => {
		const query = {
			className: "test",
		};

		const params = {
			getChildren: vi.fn(),
		};

		const engine = create(TestComponent, defaultProps, {
			queries: {
				accessorKey: [query, params],
			},
		});

		const result = engine({});

		expect(result.accessors.accessorKey).toBe(accessors);

		expect(mockedCreateAccessors).toHaveBeenCalledTimes(1);
		expect(mockedCreateAccessors).toHaveBeenCalledWith(output, query, params);
	});

	test("should provide multiple accessors", () => {
		const query1 = {
			className: "test1",
		};

		const query2 = {
			className: "test2",
		};

		const accessors1: AccessorsType<"div"> = {
			get: vi.fn(),
			getProps: vi.fn(),
			getAll: vi.fn(),
			query: vi.fn(),
			queryAll: vi.fn(),
		};

		const accessors2: AccessorsType<"div"> = {
			get: vi.fn(),
			getProps: vi.fn(),
			getAll: vi.fn(),
			query: vi.fn(),
			queryAll: vi.fn(),
		};

		mockedCreateAccessors
			.mockReturnValueOnce(accessors1)
			.mockReturnValueOnce(accessors2);

		const engine = create(TestComponent, defaultProps, {
			queries: {
				accessorKey1: query1,
				accessorKey2: query2,
			},
		});

		const result = engine({});

		expect(result.accessors.accessorKey1).toBe(accessors1);
		expect(result.accessors.accessorKey2).toBe(accessors2);

		expect(mockedCreateAccessors).toHaveBeenCalledTimes(2);
		expect(mockedCreateAccessors).toHaveBeenNthCalledWith(1, output, query1);
		expect(mockedCreateAccessors).toHaveBeenNthCalledWith(2, output, query2);
	});
});

describe("getCallback", () => {
	test("should return callback", () => {
		const callback = vi.fn();

		vi.mocked(accessors.getProps).mockReturnValue({
			onMouseOver: callback,
		});

		const engine = create(TestComponent, defaultProps, {
			queries: {
				accessorKey: {},
			},
			callbacks: {
				callbackKey: ["accessorKey", "onMouseOver"],
			},
		});

		const result = engine({});

		expect(result.getCallback("callbackKey")).toBe(callback);
	});

	test("should throw an error if `callbacks` is not provided", () => {
		const callback = vi.fn();

		vi.mocked(accessors.getProps).mockReturnValue({
			onMouseOver: callback,
		});

		const engine = create(TestComponent, defaultProps, {
			queries: {
				accessorKey: {},
			},
		});

		const result = engine({});

		expect(() => {
			result.getCallback("callbackKey");
		}).toThrow();
	});

	test("should throw an error if `callbacks` is not a function", () => {
		vi.mocked(accessors.getProps).mockReturnValue({
			onMouseOver: undefined,
		});

		const engine = create(TestComponent, defaultProps, {
			queries: {
				accessorKey: {},
			},
			callbacks: {
				callbackKey: ["accessorKey", "onMouseOver"],
			},
		});

		const result = engine({});

		expect(() => {
			result.getCallback("callbackKey");
		}).toThrow();
	});
});
