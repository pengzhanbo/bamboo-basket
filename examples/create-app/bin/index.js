import path from 'node:path'
import basket, { getDirname } from '../../../dist/index.js'

basket(
  {
    root: path.resolve(getDirname(import.meta.url), '../'),
    templateDir: 'template',
  },
  ({ pkg, template, answer, argv }) => {
    console.log(pkg, template, answer, argv)
    pkg.addDependence('vue', 'latest')
    pkg.addDevDependence('vite', 'latest')
  }
)
