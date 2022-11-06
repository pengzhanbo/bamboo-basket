import fs from 'node:fs/promises'
import path from 'node:path'
import fg from 'fast-glob'
import handlebars from 'handlebars'
import _ from 'lodash'

export default class Template<T = Record<string, any>> {
  source: string
  data: T
  exclude: string[] = []
  target: string
  constructor(source: string, target: string) {
    this.source = source
    this.target = target
    this.data = Object.create(null)
  }

  public setData(data: Record<string, any>) {
    _.merge(this.data, data)
  }

  public addExclude(glob: string | string[]) {
    if (Array.isArray(glob)) {
      this.exclude.push(...glob)
    } else {
      this.exclude.push(glob)
    }
  }

  public async generate() {
    const fileList = await this.readFileList()
    Object.keys(fileList).forEach(async (filepath: string) => {
      const content = fileList[filepath]
      const target = path.resolve(this.target, filepath)
      const dirname = path.dirname(target)
      await fs.mkdir(dirname, { recursive: true })
      await fs.writeFile(target, this.render(content), 'utf-8')
    })
  }

  private async readFileList() {
    const filepaths = await fg(this.source, {
      cwd: this.source,
      dot: true,
      ignore: this.exclude,
    })
    const fileList: Record<string, string> = {}
    filepaths.forEach(async (filepath: string) => {
      fileList[filepath] = await fs.readFile(
        path.join(this.source, filepath),
        'utf-8'
      )
    })
    return fileList
  }

  private render(source: string) {
    const template = handlebars.compile(source)
    return template(this.data)
  }
}
