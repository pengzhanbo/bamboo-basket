import fs from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import handlebars from 'handlebars'
import _ from 'lodash'
import { createDebug } from './utils'

const debug = createDebug('template')

export interface TemplateOptions {
  source: string
  target: string
  name: string
}

export default class Template<T = Record<string, any>> {
  source: string
  data: T
  exclude: string[] = []
  target: string
  name: string
  fileList: Record<string, string>
  constructor({ source, target, name }: TemplateOptions) {
    this.source = source
    this.target = target
    this.name = name
    this.data = Object.create(null)
    this.fileList = Object.create(null)
  }

  /**
   * 设置编译模板时使用的数据
   * @param data
   */
  public setData(data: Record<string, any>) {
    _.merge(this.data, data)
  }

  /**
   * 新增生成文件时，需要排除的模板文件
   * @param glob string | string[] 文件路径，或 glob匹配字符串
   */
  public addExclude(glob: string | string[]) {
    if (Array.isArray(glob))
      this.exclude.push(...glob)

    else
      this.exclude.push(glob)
  }

  public async generate() {
    await this.readFileList()
    const fileList = this.fileList
    for (const filepath of Object.keys(fileList)) {
      const content = fileList[filepath]
      const target = path
        .resolve(this.target, filepath)
        .replace(/\.handlebars$/, '')
      debug('write file: ', filepath)
      const dirname = path.dirname(target)
      await fs.mkdir(dirname, { recursive: true })
      await fs.writeFile(target, this.render(content), 'utf-8')
    }
  }

  private async readFileList() {
    const source = path.join(this.source, '**/*')
    const filepaths = await fg(source, {
      cwd: this.source,
      dot: true,
      ignore: this.exclude,
    })
    debug('filepaths', filepaths)
    this.fileList = Object.create(null)
    for (const filepath of filepaths) {
      const relativePath = path.relative(this.source, filepath)
      this.fileList[relativePath] = await fs.readFile(filepath, 'utf-8')
    }
  }

  private render(source: string) {
    const template = handlebars.compile(source)
    return template(this.data)
  }
}
