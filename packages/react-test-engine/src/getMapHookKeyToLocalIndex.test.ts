import { expect, test, vi } from "vitest";
import { getMapHookKeyToLocalIndex } from "./getMapHookKeyToLocalIndex";

const hook1 = vi.fn();
const hook2 = vi.fn();
const hook3 = vi.fn();

test("should return correct object", () => {
	const result = getMapHookKeyToLocalIndex(
		{
			hook1call1: hook1,
			hook1call2: hook1,
			hook1call3: hook1,
			hook2call1: hook2,
			hook2call2: hook2,
			hook3call1: hook3,
		},
		[
			"hook1call1",
			"hook2call1",
			"hook3call1",
			"hook1call2",
			"hook2call2",
			"hook1call3",
		],
	);

	expect(result).toEqual({
		hook1call1: 0,
		hook1call2: 1,
		hook1call3: 2,
		hook2call1: 0,
		hook2call2: 1,
		hook3call1: 0,
	});
});
