# vue-hot-typescript-loader

Enable hot module replacement (HMR) on your typescript vue components.

This loader is for Vue components written in `.ts`.  If you are using `.vue` file, you don't need this loader.

This code is a based on [vue-hot-reload-loader](https://github.com/ktsn/vue-hot-reload-loader).


## Installation

```bash
# NPM
$ npm install --save-dev vue-hot-typescript-loader
```

## Usage


### Webpack

Ensure the webpack entry points for your debug build includes HMR code

```js
module.exports = {
  entry: {
    app: [ 'webpack-hot-middleware/client', './src/app.ts']
  }
}
```

Update your webpack config to apply `vue-hot-typescript-loader` after initial compilation has occured

```js
module.exports = {
  module: {
    rules: [{
            test: /\.ts$/,
            use: ['vue-hot-typescript-loader', 'ts-loader'],
            include: path.resolve(__dirname, 'path/to/components')
        }]
  }
}
```

### Source Files

Supports one class per file. As long as the class extends Vue and in turn is exported, it will be created with HMR support at runtime.

#### es6

```ts
import * as Vue from 'vue';

export class MyComponent extends Vue {}
```


```ts
import { default as VueAlias } from 'vue';

export class MyComponent extends VueAlias {}
```

#### commonjs

```ts
let vue = require('vue'); // commonjs import

class MyComponent extends Vue {}

export default MyComponent;
```

## Authors

* [mrellipse](https://github.com/mrellipse)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* [katashin](https://github.com/ktsn) for [vue-hot-reload-loader](https://github.com/ktsn/vue-hot-reload-loader)
