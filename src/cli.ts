import cac from 'cac'
import { version } from '../package.json'
import bambooBasket from './bambooBasket'
import { loadConfigFromFile } from './bundleConfig'
import { logger } from './utils'

const cli = cac('basket')

interface CliOptions {
  config?: string
  root?: string
  template?: string
}

cli.option('-c, --config <file>', '[string] use specified config file.')

cli
  .command('[target]', 'generate files to target directory.')
  .allowUnknownOptions()
  .option('-r, --root <root>', '[string] template root directory.')
  .option('-t, --template <templateDir>', '[string] use template directory.')
  .action(async (target: string, cliOptions: CliOptions) => {
    target ??= '.'
    const result = await loadConfigFromFile(cliOptions.config)
    if (!result) return
    logger.log('load config: ', result.path)

    const [options, setup] = result.config
    await bambooBasket(
      {
        ...options,
        root: cliOptions.root || options.root,
        templateDir: cliOptions.template || options.templateDir,
      },
      setup
    )
  })

cli.version(version)
cli.parse()
