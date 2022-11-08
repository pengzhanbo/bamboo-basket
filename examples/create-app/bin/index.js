import path from 'node:path'
import basket, { getDirname, logger } from '../../../dist/index.js'

basket(
  {
    root: path.resolve(getDirname(import.meta.url), '../'),
    templateDir: 'template',
  },
  ({ pkg, template, answer, argv }) => {
    logger.info(pkg, template, answer, argv)
    pkg.addDependence('vue', 'latest')
    pkg.addDevDependence('vite', 'latest')
  }
)
