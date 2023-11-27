type FlagType = 'string' | 'boolean' | 'number'

/**
 * Callback function to determine if a flag is required during runtime.
 *
 * @param flags - Contains the flags converted to camel-case excluding aliases.
 * @param input - Contains the non-flag arguments.
 *
 *@returns True if the flag is required, otherwise false.
 */
type IsRequiredPredicate = (flags: Readonly<AnyFlags>, input: readonly string[]) => boolean

interface Flag<PrimitiveType extends FlagType, Type, IsMultiple = false> {
  /**
   *Type of value. (Possible values: `string` `boolean` `number`)
   */
  readonly type?: PrimitiveType

  /**
   *Limit valid values to a predefined set of choices.
   * @example
   * ```
   * unicorn: {
   *   isMultiple: true,
   *   choices: ['rainbow', 'cat', 'unicorn']
   * }
   * ```
   */
  readonly choices?: Type extends unknown[] ? Type : Type[]

  /**
   * Default value when the flag is not specified.
   *
   * @example
   * ```
   * unicorn: {
   *   type: 'boolean',
   *   default: true
   * }
   * ```
   */
  readonly default?: Type

  /**
   * A short flag alias.
   *
   * @example
   * ```
   * unicorn: {
   *   shortFlag: 'u'
   * }
   * ```
   */
  readonly shortFlag?: string

  /**
   * Other names for the flag.
   *
   * @example
   * ```
   * unicorn: {
   *   aliases: ['unicorns', 'uni']
   * }
   * ```
   */
  readonly aliases?: string[]

  /**
   * Indicates a flag can be set multiple times. Values are turned into an array.
   *
   * Multiple values are provided by specifying the flag multiple times, for example, `$ foo -u rainbow -u cat`. Space- or comma-separated values [currently *not* supported](https://github.com/sindresorhus/meow/issues/164).
   *
   * @default false
   */
  readonly isMultiple?: IsMultiple

  /**
   * Determine if the flag is required.
   *
   * If it's only known at runtime whether the flag is required or not you can pass a Function instead of a boolean, which based on the given flags and other non-flag arguments should decide if the flag is required.
   *
   * - The first argument is the **flags** object, which contains the flags converted to camel-case excluding aliases.
   * - The second argument is the **input** string array, which contains the non-flag arguments.
   * - The function should return a `boolean`, true if the flag is required, otherwise false.
   *
   * @default false
   *
   * @example
   * ```
   * isRequired: (flags, input) => {
   *   if (flags.otherFlag) {
   *     return true;
   *  }
   *
   *   return false;
   * }
   * ```
   */
  readonly isRequired?: boolean | IsRequiredPredicate
}

type StringFlag = Flag<'string', string> | Flag<'string', string[], true>
type BooleanFlag = Flag<'boolean', boolean> | Flag<'boolean', boolean[], true>
type NumberFlag = Flag<'number', number> | Flag<'number', number[], true>
type AnyFlag = StringFlag | BooleanFlag | NumberFlag
export type AnyFlags = Record<string, AnyFlag>
