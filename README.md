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

[TC39 decorators](https://github.com/tc39/proposal-decorators) for making things to support one-time ready event callback handlers.

By using `after-ready`, a babel plugin [`@babel/plugin-proposal-decorators`](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) should be configured with `legacy: false` if the tc39 decorators are not supported natively.

## Install

```sh
$ npm i after-ready
```

## Usage

```js
import {
  setup,
  afterReady,
  whenReady,
  SET_READY,
  SET_ERROR
} from 'after-ready'

@setup
class Foo {
  @afterReady
  doSomething () {
  }


}
```

## License

MIT
