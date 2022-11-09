import { defineConfig, logger } from '../../dist'

export default defineConfig(
  {
    root: __dirname,
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
