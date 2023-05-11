import _ from 'lodash'
import type { AnyFlags } from 'meow'
import meow from 'meow'

export const parseArgv = (
  flags: AnyFlags | (() => AnyFlags),
  help: string,
  importMeta: any,
) => {
  const argv = meow({
    importMeta,
    flags: _.isFunction(flags) ? flags() : flags ?? {},
    help,
  })
  return {
    target: argv.input[0] || '.',
    argv: argv.flags,
  }
}
