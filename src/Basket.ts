import path from 'node:path'
import _ from 'lodash'
import type { AnyFlags } from 'meow'
import meow from 'meow'
import type { PromptObject } from 'prompts'
import prompts from 'prompts'
import type { Templates } from './types'
import { cameDashesCase, createDebug } from './utils'

const debug = createDebug('basket')

export interface BasketOptions {
  templates: Templates
  helpText?: string
  argv: AnyFlags
  cwd?: string
}
export default class Basket {
  options: BasketOptions
  target: string
  cliOptions: Record<string, any>
  answer: Record<string, any>
  cwd: string
  constructor(options: BasketOptions) {
    this.options = options
    this.cwd = this.options.cwd || process.cwd()
    this.answer = Object.create(null)
    const { target, cliOptions } = this.parseArgv()
    this.target = target
    this.cliOptions = cliOptions
    debug('target', target)
    debug('cliOptions', cliOptions)
  }

  async prompt<T extends string = string>(schema: PromptObject<T>) {
    const answer = await prompts(schema)
    this.answer = _.merge(this.answer, answer)
    return answer
  }

  getDefaultName() {
    this.target = ['.', './', ''].includes(this.target) ? '.' : this.target
    const target = path
      .resolve(this.cwd, this.target)
      .replace(/\/$/, '')
      .split('/')
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
