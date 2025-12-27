/**
 * Base Use Case
 *
 * Encapsulates a specific business operation.
 * @template TInput Input DTO type
 * @template TOutput Output DTO type
 */
export abstract class UseCase<TInput, TOutput> {
  /**
   * Execute the use case logic.
   */
  abstract execute(input: TInput): Promise<TOutput> | TOutput
}
