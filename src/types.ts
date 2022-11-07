import type { AnyFlags } from 'meow'
import type { Colors } from 'picocolors/types'
import type { Answers, PromptObject } from 'prompts'
import type PackageManager from './PackageManager'
import type Template from './Template'

export interface TemplateItem {
  name: string
  dir: string
  description?: string
}

export type Templates = TemplateItem[]

export interface BambooBasketOptions {
  root: string
  templateDir?: string
  templateList?: Templates
  helpText?: string
  argv: AnyFlags | (() => AnyFlags)
  cwd?: string
}

export type PackageVersion = 'latest' | 'next' | 'pre' | string

export interface Finish {
  (): void | Promise<void>
}

export interface SetupOptions {
  templateName: string
  template: Template
  pkg: PackageManager
  colors: Colors
  argv: Record<string, any>
  answer: Record<string, any>
  addPrompts: <T extends string = string>(
    schema: PromptObject
  ) => Promise<Answers<T>>
}
export interface Setup {
  (setup: SetupOptions): void | Finish | Promise<void | Finish>
}
