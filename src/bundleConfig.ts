import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import process from 'node:process'
import { performance } from 'node:perf_hooks'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'
import colors from 'picocolors'
import type { BambooBasketOptions, Setup } from './types'
import { createDebug, logger, lookupFile } from './utils'

const debug = createDebug('config')

const DEFAULT_CONFIG_FILES = [
  'basket.config.ts',
  'basket.config.js',
  'basket.config.cjs',
  'basket.config.mjs',
  'basket.config.cts',
  'basket.config.mts',
]

export async function loadConfigFromFile(configFile?: string, configRoot = process.cwd()): Promise<{
  config: [BambooBasketOptions, Setup]
  path: string
} | null> {
  const start = performance.now()
  const getTime = () => `${(performance.now() - start).toFixed(2)}ms`

  let resolvedPath!: string
  if (configFile) {
    resolvedPath = path.resolve(configFile)
  }
  else {
    for (const filename of DEFAULT_CONFIG_FILES) {
      const filepath = path.resolve(configRoot, filename)
      if (!fs.existsSync(filepath))
        continue

      resolvedPath = filepath
      break
    }
  }

  if (!resolvedPath) {
    debug('no config file found')
    return null
  }

  let isESM = false
  if (/\.m[jt]s$/.test(resolvedPath)) {
    isESM = true
  }
  else if (/\.c[jt]s$/.test(resolvedPath)) {
    isESM = false
  }
  else {
    // check package.json for type: "module" and set `isESM` to true
    try {
      const pkg = lookupFile(configRoot, ['package.json'])
      isESM = !!pkg && JSON.parse(pkg).type === 'module'
    }
    catch (e) {}
  }

  try {
    const bundled = await bundleConfigFile(resolvedPath, isESM)
    const config = await loadConfigFromBundledFile(
      resolvedPath,
      bundled.code,
      isESM,
    )

    debug(`bundled config file loaded in ${getTime()}`)

    return {
      config,
      path: resolvedPath,
    }
  }
  catch (e) {
    logger.error(colors.red(`failed to load config from ${resolvedPath}`))
    logger.error(e)
  }
  return null
}

async function bundleConfigFile(
  filename: string,
  isESM: boolean,
): Promise<{ code: string }> {
  const dirnameVarName = '__basket_injected_dirname'
  const filenameVarName = '__basket_injected_filename'
  const importMetaUrlVarName = '__basket_inject_import_meta_url'
  const result = await build({
    entryPoints: [filename],
    absWorkingDir: process.cwd(),
    outfile: 'out.js',
    write: false,
    target: ['node14.18', 'node16'],
    platform: 'node',
    bundle: true,
    format: isESM ? 'esm' : 'cjs',
    metafile: false,
    define: {
      '__dirname': dirnameVarName,
      '__filename': filenameVarName,
      'import.meta.url': importMetaUrlVarName,
    },
    plugins: [
      {
        name: 'externalize-deps',
        setup(build) {
          build.onResolve({ filter: /.*/ }, ({ path: id }) => {
            if (id[0] !== '.' && !path.isAbsolute(id)) {
              return {
                external: true,
              }
            }
          })
        },
      },
      {
        name: 'inject-file-scope-variable',
        setup(build) {
          build.onLoad({ filter: /\.[cm]?[jt]s$/ }, async (args) => {
            const contents = await fs.promises.readFile(args.path, 'utf-8')
            const injectValues
              = `const ${dirnameVarName} = ${JSON.stringify(
                path.dirname(args.path),
              )};`
              + `const ${filenameVarName} = ${JSON.stringify(args.path)};`
              + `const ${importMetaUrlVarName} = ${JSON.stringify(
                pathToFileURL(args.path).href,
              )};`
            return {
              loader: args.path.endsWith('ts') ? 'ts' : 'js',
              contents: injectValues + contents,
            }
          })
        },
      },
    ],
  })
  const { text } = result.outputFiles[0]
  return {
    code: text,
  }
}

interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any
}

const _require = createRequire(import.meta.url)
async function loadConfigFromBundledFile(
  fileName: string,
  bundledCode: string,
  isESM: boolean,
): Promise<any> {
  if (isESM) {
    const fileBase = `${fileName}.timestamp-${Date.now()}`
    const fileNameTmp = `${fileBase}.mjs`
    const fileUrl = `${pathToFileURL(fileBase)}.mjs`
    fs.writeFileSync(fileNameTmp, bundledCode)
    try {
      return (await import(fileUrl)).default
    }
    finally {
      try {
        fs.unlinkSync(fileNameTmp)
      }
      catch {}
    }
  }
  else {
    const extension = path.extname(fileName)
    const realFileName = fs.realpathSync(fileName)
    const loaderExt = extension in _require.extensions ? extension : '.js'
    const defaultLoader = _require.extensions[loaderExt]!
    _require.extensions[loaderExt] = (module: NodeModule, filename: string) => {
      if (filename === realFileName) {
        ;(module as NodeModuleWithCompile)._compile(bundledCode, filename)
      }
      else {
        defaultLoader(module, filename)
      }
    }
    delete _require.cache[_require.resolve(fileName)]
    const raw = _require(fileName)
    _require.extensions[loaderExt] = defaultLoader
    return raw.__esModule ? raw.default : raw
  }
}
