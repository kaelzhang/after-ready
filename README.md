[![Build Status](https://travis-ci.org/kaelzhang/after-ready.svg?branch=master)](https://travis-ci.org/kaelzhang/after-ready)
[![Coverage](https://codecov.io/gh/kaelzhang/after-ready/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/after-ready)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/after-ready?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/after-ready)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/after-ready.svg)](http://badge.fury.io/js/after-ready)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/after-ready.svg)](https://www.npmjs.org/package/after-ready)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/after-ready.svg)](https://david-dm.org/kaelzhang/after-ready)
-->

# after-ready

[TC39 decorators](https://github.com/tc39/proposal-decorators/blob/7fa580b40f2c19c561511ea2c978e307ae689a1b/METAPROGRAMMING.md) for making classes to support one-time ready event callback handlers.

If using `after-ready`, a babel plugin [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) (`^7.3.0`) should be configured with `legacy: false` if the tc39 decorators are not supported natively.

## Install

```sh
$ npm i after-ready
```

## Usage

```js
import {
  setup,
  awaitReady,
  whenReady,
  SET_READY,
  SET_ERROR,
  RESET_READY
} from 'after-ready'

@setup
class Foo {
  constructor () {
    this.init()
  }

  // `doSomething` will not resolve before `this[SET_READY]()`
  @awaitReady
  doSomething () {
    return 1
  }

  init () {
    setTimeout(() => {
      this[SET_READY]()
    }, 500)
  }
}

const result = await new Foo().doSomething()
console.log(result) // 1
```

## `@setup`
## `@setup(onReady)`

- **onReady** `Function(err, ...args)` The function to be called when the instance of the class is set as ready or errored.

Setup the class. A class must be setup with the `@setup` decorator then use the `@awaitReady` or `@whenReady`

After the class is `@setup`d, **THREE** methods are added to the prototype of the class.

### `[SET_READY](...args)`

Set the class instance as ready.

If `onReady` function is set, it will be invoked as `onReady.call(this, null, ...args)`.

And the methods which applied with `@awaitReady` and have been called before ready will resume to execute.

### `[SET_ERROR](error)`

Set the class instance as error encountered.

If `onReady` function is set, it will be invoked as `onReady.call(this, error)`.

And the methods which applied with `@awaitReady` and have been called before ready will be rejected.

### `[RESET_READY]()`

Reset the ready status, or reset the error status.

## `@awaitReady`

The method which applied this decorator will always returns a `Promise`.

If `this[SET_READY]()` has been invoked, the original method will be executed immediately.

If `this[SET_ERROR](error)` has been invoked, then the method will returns `Promise.reject(error)`

Otherwise, the original method will be paused, waiting for `this[SET_READY]()` or `this[SET_ERROR](error)` to be called.

```js
@setup
class Foo {
  constructor () {
    this.init()
  }

  // `doSomething` will not resolve before `this[SET_READY]()`
  @awaitReady
  doSomething () {
    return 1
  }

  init () {
    setTimeout(() => {
      this[SET_ERROR](new Error('Boooooom!!'))
    }, 500)
  }
}

new Foo().doSomething().then(n => {
  console.log('the result is', n, 'but it will never reach here')
}).catch(err => {
  console.log(err.message, 'it will log "Boooooom!!"')
})
```

## `@whenReady`

If no `this[SET_READY]()` or `this[SET_ERROR](error)` has been called, the original method will never be invoked.

## License

MIT
