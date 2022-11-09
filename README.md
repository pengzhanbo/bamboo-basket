# bamboo-basket

快速创建一个模板仓库

## 特性

- 支持 handlebars
- 支持 多模板选择
  - 模板选择对话框
- 支持 模板文件过滤
- 支持 自定义命令式交互终端
- 支持 向 `package.json` 添加 动态版本依赖
  - 查询依赖的版本信息，根据 `latest`、`next`、`pre`动态获取版本或指定某一版本
- 支持自定义命令行参数


## 使用

### 安装

``` sh
# npm
npm i bamboo-basket
# yarn
yarn add bamboo-basket
# pnpm
pnpm add bamboo-basket
```

### 使用

```ts
import path from 'path'
import bambooBasket, { colors, execa, getDirname, logger } from 'bamboo-basket'

bambooBasket({
  // 配置 template 所在目录的父级
  root: path.resolve(getDirname(), './'),
  // 相对于 root 的目录  单模板时配置这个即可
  templateDir: 'template',
  // 如果使用 多模板，由用户选择模板
  templateList: [
    { name: 'template1', dir: 'template1', description: '描述信息' }
  ],
  // 配置 命令行参数解析规则
  argv: {
    // --name,-n
    // 命令行 --name=project 或  -n=project 会被解析为  { name: 'project' }
    name: { alias: 'n', type: 'string' }
  }
}, async ({ addPrompts, template, pkg, argv, answer, templateName }) => {
  // 通过 argv 可以获取命令行参数对象
  console.log(argv) // { name: 'project' }

  // templateName 当前模板名称
  // 可以用 templateName 字段判断当前使用的是哪个模板，根据不同模板进行不同的配置

  // colors 是一个颜色库  picocolors
  // 用于 格式化 输出内容的样式

  // 通过 addPrompts 新增 交互终端对话，获取配置
  const { author } = await addPrompts({
    name: 'author',
    type: 'text',
  })
  // 你也可以直接 通过 answer.author 获取 值
  console.log(author, answer.author)

  // template 是模板实例
  // 可以通过 template.addExclude(glob) 方法，根据需求，排除掉模板目录中不需要的文件
  template.addExclude('exclude.js')
  // 通过 template.setData(data) 设置 handlebars 模板数据
  template.setData({ author: answer.author })

  // pkg 是 当前使用的模板的 package.json 实例
  // 由于 package.json 文件是在 模板生成到 目标目录后，才可能被创建
  // (模板可能没有包含 package.json 那么 pkg 是一个空实例，不会产生其他影响，不生成文件)
  // 所以更新字段的方式，需要通过回调的方式实现
  pkg.setPackage((pkgJson) => {
    pkgJson.name = 'my-project'
  })
  // 通过 pkg.addDependence(dependenceName, version) 
  // 或 pkg.addDevDependence(dependenceName, version)  动态添加依赖
  // 你可以通过指定  version 值 为 latest / next / prev 等依赖设置的 dist-tags，来获取最新的版本号
  pkg.addDevDependence('foo', '^1.0.0')

  // 返回一个回调函数， 当通过模板生成到目标目录成功后，执行回调
  return ({ spinner }) => {
    // 可以继续在这里执行一些必要的命令
    // 比如 用 execa 执行 `git init` 或 `npm install` 操作等
  }
})
```

### Cli

支持通过 cli 命令执行模板生成
```sh
npx basket [target-dir]
```
命令读取项目根目录下的 `basket.config.{ts,js}` 文件，获取配置信息，
然后执行模板生成

`basket.config.ts`
```ts
import { defineConfig } from 'bamboo-basket'

export default defineConfig({
  root: __dirname,
  template: 'template',
}, async ({ addPrompts }) => {
  await addPrompts({
    name: 'projectName',
    type: 'text',
    message: 'Input Your Project Name:'
  })
})
```

也可以通过 命令行参数 `--config,-c` 指定配置文件路径
```sh
npx basket ./my-project -c ./scripts/basket.config.ts
```

## 示例

请查看 [examples](/examples/)

- [create-app](/examples/create-app/) 创建一个支持 `npm init` 的模板仓库
- [multi-template](/examples/multi-template/) 多模板支持
- [use-config-file](/examples/use-config-file/) 使用CLI 命令加载配置文件
## Todo List

- [X] 模板创建，多模板支持
- [X] 依赖版本管理， 通过 `dist-tags` 获取对应版本
- [X] 提供 cli 以及 config文件 配套
- [X] `npm init xxx-app` 说明文档

## Why ?

在我日常的开发任务中，经常需要重复创建一系列文件，或者想把某个项目抽象为一个模板，发布到 npm或者私有npm上，通过
`npm init xxx-app ./my-project` 创建项目。

而这个过程在大多数情况下需要编写很多重复的代码，再包括一部分模板个性化的配置。

所以我将这个过程抽象为一个独立的库，通过这个库，可以很方便的定义一个模板，以及通过这个库快速生成。
