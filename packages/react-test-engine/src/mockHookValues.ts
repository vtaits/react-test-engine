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
		| Partial<{
				[Key in keyof Hooks]: ReturnType<Hooks[Key]>;
		  }>
		| undefined = {},
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

		if (!mockFunctionValue) {
			throw new Error(
				"`mockFunctionValue` should be provided if `hookOrder` defined",
			);
		}

		hookOrder.forEach((hookKey) => {
			const hook = hooks[hookKey];
			const hookValue = hookValues[hookKey];

			if (hookValue !== undefined) {
				mockFunctionValue(hook, hookValue);
				return;
			}

			const hookDefaultValue = hookDefaultValues[hookKey];

			if (hookDefaultValue !== undefined) {
				mockFunctionValue(hook, hookDefaultValue);
				return;
			}
		});
	}
}
