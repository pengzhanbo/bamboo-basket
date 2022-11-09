import path from 'node:path'
import bambooBasket, { getDirname, logger } from '../../dist/index.js'

bambooBasket(
  {
    root: path.resolve(getDirname(import.meta.url), './'),
    templateDir: 'template',
  },
  async ({ pkg, template, addPrompts, defaultName }) => {
    const { projectName } = await addPrompts({
      name: 'projectName',
      type: 'text',
      initial: defaultName,
      message: 'Input your project name: ',
    })

    template.setData({ projectName })

    logger.log('projectName', projectName)

    pkg.addDependence('vue', 'latest')
    pkg.addDevDependence('vite', 'latest')
  }
)
