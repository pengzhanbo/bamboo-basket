import type { BasketOptions } from './Basket'
import Basket from './Basket'
// import Template from './Template'
import type { TemplateItem } from './types'
import { cameDashesCase } from './utils'

// eslint-disable-next-line no-new
new Basket({
  templates: [],
  argv: {
    watch: { alias: 'w', type: 'boolean' },
    port: { alias: 'p', type: 'string' },
  },
})

async function basket(options: BasketOptions) {
  const basket = new Basket(options)
  let template!: TemplateItem
  if (options.templates.length > 1) {
    const { templateName } = await basket.prompt({
      name: 'templateName',
      message: 'choose template',
      type: 'select',
      choices: options.templates.map((template) => ({
        value: template,
        title: template.name,
      })),
    })
    template = templateName
  } else {
    template = options.templates[0]
  }
  await basket.prompt<string>({
    name: 'projectName',
    message: 'input your project name',
    type: 'text',
    initial: basket.getDefaultName(),
    format: (value) => cameDashesCase(value),
  })
  console.log(template, basket.answer)
}

export default basket
