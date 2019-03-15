import test from 'ava'
import {
  setup,
  awaitReady,
  whenReady,
  SET_READY,
  SET_ERROR,
  RESET_READY
} from '../src'

const NOT_SETUP = '@setup should be used first'
const NO_MORE_SETUP = '@setup has already been applied'

test('error: not setup', async t => {
  let i = 0

  class Foo {
    @awaitReady
    bar () {
      return 1
    }

    @whenReady
    baz () {
      i ++
    }
  }

  const foo = new Foo()

  await t.throwsAsync(() => foo.bar(), NOT_SETUP)
  t.throws(() => foo.baz(), NOT_SETUP)
})

test('error: setup more than once', t => {
  t.throws(() => {
    @setup
    @setup
    class Foo {
    }
  }, NO_MORE_SETUP)
})

test('mixed', async t => {
  let i = 0

  @setup
  class Foo {
    x = 1

    @awaitReady
    bar () {
      return i
    }

    increase () {
      i ++
    }
  }

  const foo = new Foo()
  const result = foo.bar()
  const result2 = foo.bar()

  t.is(typeof result.then, 'function', 'should be a promise')
  foo.increase()
  foo[SET_READY]()

  t.is(await result, 1)
  t.is(await result2, 1)
})

test('whenReady', t => {
  let i = 0

  @setup
  class Foo {
    @whenReady
    increase () {
      i ++
    }
  }

  const foo = new Foo()
  foo.increase()
  t.is(i, 0)

  foo[SET_READY]()
  foo.increase()
  t.is(i, 1)
})

test('set error', async t => {
  @setup
  class Foo {
    @awaitReady
    bar () {
      return 1
    }
  }

  const message = 'baz'
  const err = new Error(message)
  const foo = new Foo()

  const result = foo.bar()

  await t.throwsAsync(() => {
    foo[SET_ERROR](err)
    foo[SET_READY]()
    foo[SET_ERROR](new Error('booooom!'))
    return result
  }, message)

  await t.throwsAsync(() => foo.bar(), message)
  foo[RESET_READY]()
  foo[SET_READY]()

  t.is(await foo.bar(), 1)
})

test('onReady', async t => {
  @setup(function (err, a) {
    this.err = err
    this.a = a
  })
  class Foo {
    @awaitReady
    getA () {
      return this.a
    }

    getErr () {
      return this.err
    }
  }

  const foo = new Foo()
  foo[SET_READY](1)
  t.is(await foo.getA(), 1)

  const bar = new Foo()
  const message = 'baz'
  bar[SET_ERROR](new Error(message))

  t.is(bar.getErr().message, message)
})
