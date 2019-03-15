import test from 'ava'
import {
  setup,
  awaitReady,
  whenReady,
  SET_READY,
  SET_ERROR
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

test.only('error: setup more than once', t => {
  // t.throws(() => {
    @setup
    @setup
    class Foo {
    }
  // }, NO_MORE_SETUP)
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

  t.is(typeof result.then, 'function', 'should be a promise')
  foo.increase()
  foo[SET_READY]()

  t.is(await result, 1)
})
