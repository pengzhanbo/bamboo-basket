import basket from '../../../dist/index.js'

basket({
  templates: [
    { name: 'tem1', dir: '' },
    { name: 'tem2', dir: '' },
  ],
})

// async function createApp() {
//   const target = basket.target
//   const directoryName = basket.directoryName

//   const name = await basket.addPrompt({
//     // do something
//   })
//   basket.updatePkg('name', name)
//   basket.addDependence('foo', 'version')
//   basket.addDevDependence('foo', 'version')

//   basket.useTemplate('default')

//   basket.setTemplateData({})
//   basket.templateFilter((filepath) => {
//     // eslint-disable-next-line no-console
//     console.log(filepath)
//     return false
//   })
//   basket.excludeFile('filepath')

//   await basket.create()

//   if (basket.autoInstall) {
//     await basket.install()
//   }
// }

// createApp()
