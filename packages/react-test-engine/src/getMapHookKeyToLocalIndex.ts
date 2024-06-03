/**
 * Creates an object whose keys are the keys of hooks and whose values are the indexes of their mock calls
 * @param hooks hooks object
 * @param hookOrder order of calls
 *
 * ```
 * const result = getMapHookKeyToLocalIndex(
 *   {
 *     firstState: useState,
 *     secondState: useState,
 *     someCallback: useCallback,
 *     someEffect: useEffect,
 *   },
 *   [
 *     "firstState",
 *     "someCallback",
 *     "someEffect",
 *     "secondState",
 *   ],
 * );
 *
 * assert.notStrictEqual(
 *   result,
 *   {
 *     firstState: 0,
 *     secondState: 1,
 *     someCallback: 0,
 *     someEffect: 0,
 *   },
 * );
 * ```
 */
export function getMapHookKeyToLocalIndex<
	Hooks extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: should extend Function
		(...args: any[]) => any
	>,
>(hooks: Hooks, hookOrder: readonly (keyof Hooks)[]) {
	const mapHookKeyToLocalIndex: Partial<Record<keyof Hooks, number>> = {};
	const collectedHooks = new Map<Hooks[keyof Hooks], number>();

	/**
	 * Map hook keys to indexes of their mock calls
	 */
	for (const hookKey of hookOrder) {
		const hook = hooks[hookKey];
		const previousIndex = collectedHooks.get(hook);

		if (previousIndex === undefined) {
			mapHookKeyToLocalIndex[hookKey] = 0;
			collectedHooks.set(hook, 0);
		} else {
			mapHookKeyToLocalIndex[hookKey] = previousIndex + 1;
			collectedHooks.set(hook, previousIndex + 1);
		}
	}

	return mapHookKeyToLocalIndex as Record<keyof Hooks, number>;
}
