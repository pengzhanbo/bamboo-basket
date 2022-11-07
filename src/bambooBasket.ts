import fs from 'node:fs'
import path from 'path'
import _ from 'lodash'
import colors from 'picocolors'
import type { PromptObject } from 'prompts'
import prompts from 'prompts'
import PackageManager from './PackageManager'
import { parseArgv } from './parseArgv'
import Template from './Template'
import type {
  BambooBasketOptions,
  Finish,
  Setup,
  SetupOptions,
  TemplateItem,
  Templates,
} from './types'
import { cameDashesCase, createDebug } from './utils'

const debug = createDebug('')

async function getTemplate(
  templateDir?: string,
  templateList?: Templates
): Promise<TemplateItem> {
  if (templateDir) {
    return { name: 'default', dir: templateDir }
  }
  if (!templateList || templateList.length === 0) {
    return { name: 'default', dir: 'template' }
  }
  if (templateList.length === 1) {
    return templateList[0]
  }
  const { template } = await prompts({
    name: 'template',
    message: 'Select template',
    type: 'select',
    choices: templateList.map((template) => ({
      value: template,
      title: template.name,
      description: template.description,
    })),
  })
  return template
}

function getTarget(target: string, cwd?: string) {
  target = ['.', './', ''].includes(target) ? '.' : target
  return path.resolve(cwd || process.cwd(), target)
}

async function bambooBasket(options: BambooBasketOptions, setup?: Setup) {
  if (!options.root) {
    throw new Error(`${colors.cyan('options.root')} is empty`)
  }
  if (
    !options.templateDir &&
    (!options.templateList || options.templateList.length === 0)
  ) {
    throw new Error(
      `One of ${colors.cyan('options.templateDir')} or ${colors.cyan(
        'options.templateList'
      )} must not be undefined and null`
    )
  }
  let answer: Record<string, any> = Object.create(null)
  const { target: _target, argv } = parseArgv(
    options.argv,
    options.helpText || '',
    import.meta
  )
  const target = getTarget(_target, options.cwd)

  const getDefaultName = () => {
    const dirs = target.replace(/\/$/, '').split('/')
    return cameDashesCase(dirs[dirs.length - 1])
  }
  const defaultName = getDefaultName()

  const currentTemplate = await getTemplate(
    options.templateDir,
    options.templateList
  )
  answer.templateName = currentTemplate.name

  debug('template', currentTemplate)

  const addPrompts = async <T extends string = string>(
    schema: PromptObject<T>
  ) => {
    const _answer = await prompts(schema)
    answer = _.merge(answer, _answer)
    return _answer
  }

  const template = new Template({
    name: currentTemplate.name,
    source: path.resolve(options.root, currentTemplate.dir),
    target,
  })
  const packageManager = new PackageManager()

  const setupOptions: SetupOptions = {
    templateName: currentTemplate.name,
    template,
    pkg: packageManager,
    colors,
    argv,
    answer,
    defaultName,
    addPrompts,
  }

  let finish: Finish = () => {}
  if (setup) {
    finish = (await setup(setupOptions)) || finish
  }
  await template.generate()
  const packageJsonFilepath = path.join(target, 'package.json')
  if (fs.existsSync(packageJsonFilepath)) {
    await packageManager.write(packageJsonFilepath)
  }
  await finish()
}

export default bambooBasket
