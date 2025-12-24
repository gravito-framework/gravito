export type FilterCallback<T = unknown> = (value: T, ...args: unknown[]) => Promise<T> | T;
export type ActionCallback<TArgs = unknown> = (args: TArgs) => Promise<void> | void;
export declare class HookManager {
    private filters;
    private actions;
    /**
     * Register a filter hook.
     *
     * Filters are used to transform a value (input/output).
     *
     * @template T - The type of value being filtered.
     * @param hook - The name of the hook.
     * @param callback - The callback function to execute.
     *
     * @example
     * ```typescript
     * core.hooks.addFilter('content', async (content: string) => {
     *   return content.toUpperCase();
     * });
     * ```
     */
    addFilter<T = unknown>(hook: string, callback: FilterCallback<T>): void;
    /**
     * Apply all registered filters sequentially.
     *
     * Each callback receives the previous callback's return value.
     *
     * @template T - The type of value being filtered.
     * @param hook - The name of the hook.
     * @param initialValue - The initial value to filter.
     * @param args - Additional arguments to pass to the callbacks.
     * @returns The final filtered value.
     *
     * @example
     * ```typescript
     * const content = await core.hooks.applyFilters('content', 'hello world');
     * ```
     */
    applyFilters<T = unknown>(hook: string, initialValue: T, ...args: unknown[]): Promise<T>;
    /**
     * Register an action hook.
     *
     * Actions are for side effects (no return value).
     *
     * @template TArgs - The type of arguments passed to the action.
     * @param hook - The name of the hook.
     * @param callback - The callback function to execute.
     *
     * @example
     * ```typescript
     * core.hooks.addAction('user_registered', async (user: User) => {
     *   await sendWelcomeEmail(user);
     * });
     * ```
     */
    addAction<TArgs = unknown>(hook: string, callback: ActionCallback<TArgs>): void;
    /**
     * Run all registered actions sequentially.
     *
     * @template TArgs - The type of arguments passed to the action.
     * @param hook - The name of the hook.
     * @param args - The arguments to pass to the callbacks.
     *
     * @example
     * ```typescript
     * await core.hooks.doAction('user_registered', user);
     * ```
     */
    doAction<TArgs = unknown>(hook: string, args: TArgs): Promise<void>;
}
//# sourceMappingURL=HookManager.d.ts.map