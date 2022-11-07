import path from 'node:path'
import basket, { getDirname } from '../../../dist/index.js'

basket(
  {
    root: path.resolve(getDirname(import.meta.url), '../'),
    templateList: [
      { name: 'tem1', dir: 'template' },
      { name: 'tem2', dir: 'template' },
    ],
  },
  ({ pkg, template, answer, argv }) => {
    // eslint-disable-next-line no-console
    console.log(pkg, template, answer, argv)
  }
)
