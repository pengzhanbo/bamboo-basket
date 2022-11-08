import fs from 'node:fs/promises'
import _ from 'lodash'
import pacote from 'pacote'
import semver from 'semver'
import sortPackage from 'sort-package-json'
import type { PackageVersion } from './types'

interface QueueItem {
  (data: Record<string, any>):
    | Promise<Record<string, any>>
    | Record<string, any>
}

interface DependenceObj {
  [name: string]: string
}
export default class PackageManager {
  private pkg: Record<string, any>
  private queueList: QueueItem[]
  private dependence: DependenceObj
  private devDependence: DependenceObj
  constructor() {
    this.queueList = []
    this.dependence = {}
    this.devDependence = {}
    this.pkg = {}
  }

  private async read(filepath: string) {
    try {
      const content = await fs.readFile(filepath, 'utf-8')
      return JSON.parse(content)
    } catch (e) {}
    return {}
  }

  public async write(filepath: string) {
    const pkg = await this.read(filepath)
    this.pkg.devDependence ??= {}
    this.pkg.dependence ??= {}
    this.pkg = _.merge(pkg, this.pkg)
    await this.runQueue()
    await this.updateDeps(this.pkg.devDependence, this.devDependence)
    await this.updateDeps(this.pkg.dependence, this.dependence)
    const content = sortPackage(JSON.stringify(this.pkg, null, '  '))
    await fs.writeFile(filepath, content, 'utf-8')
  }

  public setPackage(fn: QueueItem) {
    this.queueList.push(fn)
  }

  public addDependence(name: string, version: PackageVersion) {
    this.dependence[name] = version
  }

  public addDevDependence(name: string, version: PackageVersion) {
    this.devDependence[name] = version
  }

  private async runQueue() {
    for (const fn of this.queueList) {
      const data = await fn(this.pkg)
      if (data) {
        this.pkg = _.merge(this.pkg, data)
      }
    }
  }

  private async updateDeps(pkgDeps: DependenceObj, updateDeps: DependenceObj) {
    for (const dependence of Object.keys(updateDeps)) {
      let version = updateDeps[dependence]
      version = await this.getPackageVersion(dependence, version)
      if (pkgDeps[dependence]) {
        version = semver.lte(version, pkgDeps[dependence])
          ? pkgDeps[dependence]
          : version
      }
      pkgDeps[dependence] = version
    }
  }

  private async getPackageVersion(
    packageName: string,
    version: PackageVersion
  ) {
    if (['latest', 'next', 'pre'].includes(version)) {
      const res = await pacote.packument(packageName)
      const distTags = res['dist-tags']
      return `^${distTags[version]}`
    }
    return version
  }
}
