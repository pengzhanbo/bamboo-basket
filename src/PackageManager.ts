import fs from 'node:fs/promises'
import _ from 'lodash'

export default class PackageManager {
  filepath: string
  pkg: Record<string, any>
  constructor(filepath: string) {
    this.filepath = filepath
    this.pkg = {}
  }

  async load() {
    try {
      const content = await fs.readFile(this.filepath, 'utf-8')
      this.pkg = JSON.parse(content)
    } catch (e) {
      this.pkg = {}
    }
  }

  merge(data: Record<string, any>) {
    _.merge(this.pkg, data)
  }
}
