export function mockHookValues<
	Hooks extends Record<
		string,
		// biome-ignore lint/suspicious/noExplicitAny: should extend Function
		(...args: any) => any
	>,
>(
	hooks: Hooks | undefined,
	hookOrder: readonly (keyof Hooks)[] | undefined,
	hookDefaultValues:
		| {
				[Key in keyof Hooks]: ReturnType<Hooks[Key]>;
		  }
		| undefined,
	hookValues:
		| Partial<{
				[Key in keyof Hooks]: ReturnType<Hooks[Key]>;
		  }>
		| undefined = {},
	mockFunctionValue: // biome-ignore lint/suspicious/noExplicitAny: should extend Function
		| (<Fn extends (...args: any) => any>(fn: Fn, value: unknown) => void)
		| undefined = undefined,
) {
	if (hookOrder) {
		if (!hooks) {
			throw new Error("`hooks` should be provided if `hookOrder` defined");
		}

		if (!hookDefaultValues) {
			throw new Error(
				"`hookDefaultValues` should be provided if `hookOrder` defined",
			);
		}

		if (!mockFunctionValue) {
			throw new Error(
				"`mockFunctionValue` should be provided if `hookOrder` defined",
			);
		}

		hookOrder.forEach((hookKey) => {
			const hook = hooks[hookKey];

			if (Object.hasOwn(hookValues, hookKey)) {
				mockFunctionValue(hook, hookValues[hookKey]);
				return;
			}

			const hookDefaultValue = hookDefaultValues[hookKey];

			mockFunctionValue(hook, hookDefaultValue);
		});
	}
}
