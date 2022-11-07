import path from 'node:path'
import _ from 'lodash'
import meow from 'meow'
import type { PromptObject } from 'prompts'
import prompts from 'prompts'
import type { BasketManagerOptions } from './types'
import { cameDashesCase, createDebug } from './utils'

const debug = createDebug('manager')

export default class BasketManager {
  options: BasketManagerOptions
  target: string
  cliOptions: Record<string, any>
  answer: Record<string, any>
  cwd: string
  constructor(options: BasketManagerOptions) {
    this.options = options
    this.cwd = this.options.cwd || process.cwd()
    this.answer = Object.create(null)
    const { target, cliOptions } = this.parseArgv()
    this.target = this.getTarget(target)
    this.cliOptions = cliOptions
    debug('target', target)
    debug('cliOptions', cliOptions)
  }

  async prompt<T extends string = string>(schema: PromptObject<T>) {
    const answer = await prompts(schema)
    this.answer = _.merge(this.answer, answer)
    return answer
  }

  getTarget(target: string) {
    target = ['.', './', ''].includes(target) ? '.' : target
    return path.resolve(this.cwd, target)
  }

  getDefaultName() {
    const target = this.target.replace(/\/$/, '').split('/')
    return cameDashesCase(target[target.length - 1])
  }

  private parseArgv() {
    const argv = meow({
      importMeta: import.meta,
      flags: this.options.argv || {},
      help: this.options.helpText,
    })
    return {
      target: argv.input[0] || '.',
      cliOptions: argv.flags,
    }
  }
}
