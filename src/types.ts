import type { AnyFlags } from 'meow'
import type { Ora } from 'ora'
import type { Colors } from 'picocolors/types'
import type { Answers, PromptObject } from 'prompts'
import type PackageManager from './PackageManager'
import type Template from './Template'

export interface TemplateItem {
  /**
   * 模板名称
   */
  name: string
  /**
   * 模板所在目录，相对于 `root`
   */
  dir: string
  /**
   * 模板描述信息
   */
  description?: string
}

export type Templates = TemplateItem[]

export interface BambooBasketOptions {
  /**
   * 项目根目录，不同于 `process.cwd()`，
   * root 配置用于能够正确读取模板，是相对于模板目录的父目录
   */
  root: string
  /**
   * 仅使用单个模板时，配置该字段
   *
   * @default 'template'
   */
  templateDir?: string
  /**
   * 提供给用户多个模板进行选择时，配置该字段
   */
  templateList?: Templates
  /**
   * 执行命令行时的帮助信息
   */
  helpText?: string
  /**
   * 配置 命令行参数解析规则
   * @see [meow flags](https://github.com/sindresorhus/meow#flags)
   */
  argv: AnyFlags | (() => AnyFlags)

  cwd?: string
}

export type PackageVersion = 'latest' | 'next' | 'pre' | string

export interface Finish {
  (options?: { spinner: Ora }): void | Promise<void>
}

export interface SetupOptions {
  /**
   * 当前使用的模板名称
   */
  templateName: string
  /**
   * 模板对象实例，可以用于对模板文件进行操作、设置过滤规则，
   * 设置模板数据等
   */
  template: Template
  /**
   * 如果模板中包含 `package.json` 文件
   * 将会创建一个用于操作 `package.json` 的实例。
   *
   * 可以用它进一步更新数据，添加依赖等
   */
  pkg: PackageManager
  /**
   * 颜色，可以用于日志输出设置文本样式
   *
   * @see [picocolors](https://github.com/alexeyraspopov/picocolors#readme)
   */
  colors: Colors
  /**
   * 解析后的命令行参数
   */
  argv: Record<string, any>
  /**
   * 用户通过交互式命令行后，保存的数据
   */
  answer: Record<string, any>
  /**
   * 格式化的目标目录名
   */
  defaultName: string
  /**
   * 添加交互式命令行对话框
   */
  addPrompts: <T extends string = string>(
    schema: PromptObject
  ) => Promise<Answers<T>>
}

export interface Setup {
  (setup: SetupOptions): void | Finish | Promise<void | Finish>
}
