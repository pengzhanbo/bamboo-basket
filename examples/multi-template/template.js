import path from 'node:path'
import bambooBasket, { getDirname } from '../../dist'

bambooBasket(
  {
    root: path.resolve(getDirname(import.meta.url)),
    templateList: [
      { name: 'template-1', dir: 'template-1' },
      { name: 'template-2', dir: 'template-2' },
    ],
  },
  async ({ template, templateName }) => {
    if (templateName === 'template-1') {
      template.setData({})
    } else if (templateName === 'template-2') {
      template.setData({})
    }
  }
)
