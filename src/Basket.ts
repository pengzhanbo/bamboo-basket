import fs from 'node:fs'
import path from 'path'
import pc from 'picocolors'
import BasketManager from './BasketManager'
import PackageManager from './PackageManager'
import Template from './Template'
import type { BasketManagerOptions, Setup, TemplateItem } from './types'
import { cameDashesCase, createDebug } from './utils'

const debug = createDebug('')

async function basket(options: BasketManagerOptions, setup?: Setup) {
  const manager = new BasketManager(options)
  let templatePath!: TemplateItem['dir']
  if (options.templates.length > 1) {
    const { template } = await manager.prompt({
      name: 'template',
      message: 'Select template',
      type: 'select',
      choices: options.templates.map((template) => ({
        value: template,
        title: template.name,
      })),
    })
    templatePath = template.dir
  } else {
    templatePath = options.templates[0].dir
  }
  debug('template', templatePath)

  const template = new Template(
    path.resolve(options.root, templatePath),
    manager.target
  )
  const packageManager = new PackageManager()

  await manager.prompt<string>({
    name: 'projectName',
    message: `Input your ${pc.cyan('project name')}`,
    type: 'text',
    initial: manager.getDefaultName(),
    format: (value) => cameDashesCase(value),
  })
  let success = () => {}
  if (setup) {
    success =
      (await setup({ template, pkg: packageManager, manager, colors: pc })) ||
      success
  }
  await template.generate()
  const packageJsonFilepath = path.join(manager.target, 'package.json')
  if (fs.existsSync(packageJsonFilepath)) {
    await packageManager.write(packageJsonFilepath)
  }
  success()
}

export default basket
