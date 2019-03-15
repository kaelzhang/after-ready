const assert = require('assert')

// Ref:
// https://github.com/tc39/proposal-decorators/blob/master/METAPROGRAMMING.md

const symbol = s => Symbol(`after-ready:${s}`)

export const SET_READY = symbol('SET_READY')
export const SET_ERROR = symbol('SET_ERROR')

const READY_ERROR = symbol('READY_ERROR')
const READY_CALLBACKS = symbol('READY_CALLBACKS')

const IS_READY = symbol('IS_READY')
const ON_READY = symbol('ON_READY')

const createElementDescriptor = (key, value) => ({
  kind: 'field',
  key,
  placement: 'own',
  descriptor: {
    configurable: false,
    writable: true,
    enumerable: false
  },
  initializer: () => value
})

const createMethodDescriptor = (key, value) => ({
  kind: 'method',
  key,
  placement: 'prototype',
  descriptor: {
    value,
    writable: false,
    configurable: false,
    enumerable: false
  }
})

function runCallbacks (err) {
  const callbacks = this[READY_CALLBACKS]

  callbacks.forEach(({resolve, reject}) => {
    if (err) {
      reject(err)
      return
    }

    resolve()
  })

  callbacks.length = 0
}

function setReady (...args) {
  if (this[IS_READY]) {
    return
  }

  this[IS_READY] = true
  this[ON_READY].call(this, null, ...args)
  runCallbacks.call(this, null)
}

function setError (err) {
  if (this[IS_READY]) {
    return
  }

  this[IS_READY] = true
  this[READY_ERROR] = err
  this[ON_READY].call(this, err)
  runCallbacks.call(this, err)
}

const NOOP = () => {}

const createSetupDecorator = (classDescriptor, onReady) => {
  console.log(classDescriptor, onReady)
  const {elements, kind} = classDescriptor

  assert(kind === 'class', '@setup is a class decorator')
  assert(
    !elements.some(
      descriptor =>
        descriptor.kind === 'method'
        && descriptor.key === IS_READY
    ),
    '@setup has already been applied'
  )

  // own element IS_READY
  const isReadyElementDescriptor = createElementDescriptor(IS_READY, false)
  // own element READY_ERROR
  const readyErrorElementDescriptor = createElementDescriptor(READY_ERROR, null)
  // own element READY_CALLBACKS
  const readyCallbacksElementDescriptor = createElementDescriptor(
    READY_CALLBACKS, [])
  // own element ON_READY
  const onReadyElementDescriptor = createElementDescriptor(ON_READY, onReady)

  // method ready
  const setReadyMethodDescriptor = createMethodDescriptor(SET_READY, setReady)
  const setErrorMethodDescriptor = createMethodDescriptor(SET_ERROR, setError)

  return {
    kind,
    elements: [
      ...elements,
      isReadyElementDescriptor,
      readyErrorElementDescriptor,
      readyCallbacksElementDescriptor,
      onReadyElementDescriptor,
      setReadyMethodDescriptor,
      setErrorMethodDescriptor
    ]
  }
}

export const setup = thing => typeof thing === 'function'
  ? classDescriptor => createSetupDecorator(classDescriptor, thing)
  : createSetupDecorator(thing, NOOP)

function wait () {
  return new Promise((resolve, reject) => {
    this[READY_CALLBACKS].push({resolve, reject})
  })
}

const checkSetup = self => {
  if (!Object.getOwnPropertyDescriptor(self, IS_READY)) {
    throw new Error('@setup should be used first')
  }
}

const createWrapDecorator = (decoratorName, wrapper) => methodDescriptor => {
  assert(
    methodDescriptor.kind === 'method',
    `@${decoratorName} is a method decorator`
  )

  const {descriptor} = methodDescriptor
  const {value} = descriptor
  return {
    ...methodDescriptor,
    descriptor: {
      ...descriptor,
      value: wrapper(value)
    }
  }
}

const wrapAwaitReady = method => async function wrappedAwaitReady (...args) {
  checkSetup(this)

  if (!this[IS_READY]) {
    await wait.call(this)
    return method.apply(this, args)
  }

  const err = this[READY_ERROR]
  return err
    ? Promise.reject(err)
    : Promise.resolve(method.apply(this, args))
}

export const awaitReady = createWrapDecorator('awaitReady', wrapAwaitReady)

const wrapWhenReady = method => function wrappedWhenReady (...args) {
  checkSetup(this)

  if (!this[IS_READY]) {
    return
  }

  method.apply(this, args)
}

export const whenReady = createWrapDecorator('whenReady', wrapWhenReady)
