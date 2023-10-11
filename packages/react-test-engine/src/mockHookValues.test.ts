import { afterEach, describe, expect, test, vi } from "vitest";
import { mockHookValues } from "./mockHookValues";

const mockFunctionValue = vi.fn();

afterEach(() => {
	vi.resetAllMocks();
});

describe("`hookOrder` is not defined", () => {
	test("should do nothing", () => {
		mockHookValues(undefined, undefined, undefined, undefined, undefined);
	});
});

describe("`hookOrder` is defined", () => {
	test("should throw an error if `hooks` is not defined", () => {
		expect(() => {
			mockHookValues(undefined, [], undefined, undefined, undefined);
		}).toThrow();
	});

	test("should throw an error if `mockFunctionValue` is not defined", () => {
		expect(() => {
			mockHookValues({}, [], undefined, undefined, undefined);
		}).toThrow();
	});

	test("should not provide value if there is no value and no default value", () => {
		const hook = vi.fn();

		mockHookValues(
			{
				test: hook,
			},
			["test"],
			undefined,
			undefined,
			mockFunctionValue,
		);

		expect(mockFunctionValue).toHaveBeenCalledTimes(0);
	});

	test("should provide default value", () => {
		const hook = vi.fn();

		mockHookValues(
			{
				test: hook,
			},
			["test"],
			{
				test: "defaultValue",
			},
			undefined,
			mockFunctionValue,
		);

		expect(mockFunctionValue).toHaveBeenCalledTimes(1);
		expect(mockFunctionValue).toHaveBeenCalledWith(hook, "defaultValue");
	});

	test("should provide redefined value", () => {
		const hook = vi.fn();

		mockHookValues(
			{
				test: hook,
			},
			["test"],
			{
				test: "defaultValue",
			},
			{
				test: "redefinedValue",
			},
			mockFunctionValue,
		);

		expect(mockFunctionValue).toHaveBeenCalledTimes(1);
		expect(mockFunctionValue).toHaveBeenCalledWith(hook, "redefinedValue");
	});

	test("should provide mulitple values", () => {
		const hook1 = vi.fn();
		const hook2 = vi.fn();

		mockHookValues(
			{
				test1_1: hook1,
				test1_2: hook1,
				test2: hook2,
			},
			["test1_1", "test1_2", "test2"],
			{
				test1_1: "defaultValue1",
				test1_2: "defaultValue2",
				test2: "otherValue",
			},
			{
				test1_1: "redefinedValue1",
			},
			mockFunctionValue,
		);

		expect(mockFunctionValue).toHaveBeenCalledTimes(3);
		expect(mockFunctionValue).toHaveBeenCalledWith(hook1, "redefinedValue1");
		expect(mockFunctionValue).toHaveBeenCalledWith(hook1, "defaultValue2");
		expect(mockFunctionValue).toHaveBeenCalledWith(hook2, "otherValue");
	});
});
