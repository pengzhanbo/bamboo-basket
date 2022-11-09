# create-app

这个例子展示了如何使用 `bamboo-basket` 创建一个 create-app 项目。

## Run

```sh
node examples/create-app/index.js ./examples/my-project
```

## 说明

对于一个支持通过 `npm init` 初始化项目的模板项目，一般遵循以下：

- 项目名称为 `create-xxx-app` 其中 `xxx` 为你的自定义模板名
- 在 `package.json` 的 `bin` 字段配置一个与项目同名的字段。

在 `package.json` ：
``` json
{
  "bin": {
    "create-xxx-app": "./bin/cli.js"
  }
}
```
当执行  `npm init xxx-app ./my-project` 时， npm会自动补全 `xxx-app` 为 `create-xxx-app`， 
在 npm 仓库中寻找 `create-xxx-app` 库，然后下载到缓存中，并执行 `npx create-xxx-app` 命令。
这时候就会执行 `./bin/cli.js` 脚本。
