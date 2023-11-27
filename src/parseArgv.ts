import _ from 'lodash'
import meow from 'meow'
import type { AnyFlags } from './types'

export function parseArgv(flags: AnyFlags | (() => AnyFlags), help: string, importMeta: any) {
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
