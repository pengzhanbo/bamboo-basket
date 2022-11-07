import type { AnyFlags } from 'meow'
import type { Colors } from 'picocolors/types'
import type BasketManager from './BasketManager'
import type PackageManager from './PackageManager'
import type Template from './Template'
export interface TemplateItem {
  name: string
  dir: string
}

export type Templates = TemplateItem[]

export interface BasketManagerOptions {
  root: string
  templates: Templates
  helpText?: string
  argv: AnyFlags
  cwd?: string
}

export type PackageVersion = 'latest' | 'next' | 'pre' | string

export interface SetupCb {
  (): void
}
export interface Setup {
  (setup: {
    template: Template
    pkg: PackageManager
    manager: BasketManager
    colors: Colors
  }): void | SetupCb | Promise<void | SetupCb>
}
