import { promises } from 'fs' // arghh, this is experimental?
import dot from 'dot'
import { chainable } from './src/chainable.js'
import documentation from 'documentation' // JSDoc to weird Objects, to markdown

// const promises = require('fs').promises;
const log = console.log
const templateFile = 'chainable_examples.md'
const chainableFile = 'chainable.md'
const documentationOptions = {
  extension: 'js',
  shallow: true
}

dot.templateSettings = {
  ...dot.templateSettings,
  strip: false
}

const collectExamples = function * (iterable) {
  let namefinder = /^### ([a-zA-Z0-9]+)/
  let exampleBlock = /```/
  let collectingExample = false
  let example = { name: '', code: [] }
  for (let line of iterable) {
    let nameResult = namefinder.exec(line)
    if (nameResult !== null) {
      example.name = nameResult[1]
    }
    let exampleResult = exampleBlock.exec(line)
    if (collectingExample === false && exampleResult !== null) { // found example block start
      example.code.push(line)
      collectingExample = true
    } else {
      if (collectingExample === true && exampleResult !== null) { // found example block end
        example.code.push(line)
        yield example
        collectingExample = false
        example = { name: '', code: [] }
      } else {
        if (collectingExample === true && exampleResult === null) { // inside example block
          example.code.push(line)
        }
      }
    }
  }
}

const replaceExamples = function * (replacementExamples, iterable) {
  let namefinder = /^## ([a-zA-Z0-9]+)/
  let exampleBlock = /```/
  let collectingExample = false
  let example = { name: '' }
  let isReplacement = false
  for (let line of iterable) {
    let nameResult = namefinder.exec(line)
    if (nameResult !== null) {
      example.name = nameResult[1]
    }
    let exampleResult = exampleBlock.exec(line)
    if (collectingExample === false && exampleResult !== null) { // found example block start
      const replacmentExample = replacementExamples[example.name]
      if (replacmentExample) {
        isReplacement = true
        yield * replacmentExample.code // eat original block start, and replace it with entirety of replacement block
      } else {
        // TODO: throw an exception to make documentation required
        console.log(`no replacement for ==>${example.name}<==`)
        yield line
      }
      collectingExample = true
    } else if (collectingExample === true && exampleResult !== null) { // found example block end
      if (!isReplacement) {
        yield line
      }
      collectingExample = false
      isReplacement = false
      example = { name: '' }
    } else if (collectingExample === true && exampleResult === null) { // inside example block
      if (!isReplacement) {
        yield line
      }
    } else {
      yield line
    }
  }
}

const main = async function () {
  try {
    // Readline class of node has an async line reading capability: https://nodejs.org/api/readline.html
    const chainable_head = await promises.readFile('./chainable_head.md', 'utf-8')
    const template = await promises.readFile(templateFile, 'utf-8')
    const chainableExamples = chainable(template.split('\n'))
      .map(line => dot.template(line)({ ctor: 'chainable', static: 'chainable' }))
      .mapWith(collectExamples)
      .reduce((o, example) => { // build single object keyed by example.name
        o[example.name] = example
        return o
      }, {})
    // log(chainableExamples)
    const sequencesDocumentation = await documentation.build(['./src/sequences.js'], documentationOptions).then(documentation.formats.md)
    const transformsDocumentation = await documentation.build(['./src/transforms.js'], documentationOptions).then(documentation.formats.md)
    const reducersDocumentation = await documentation.build(['./src/reducers.js'], documentationOptions).then(documentation.formats.md)
    const chainableDocumentation = chainable
      .concatenate(
        ['# Sequences'],
        sequencesDocumentation.split('\n'),
        ['# Transforms'],
        transformsDocumentation.split('\n'),
        ['# Reducers'],
        reducersDocumentation.split('\n')
      )
      // TODO: change or add MDN links for types
      .reject(line => /^- {3}`iterable`/.exec(line) !== null) // strip 'iterable' parameter from all method comments
      .mapWith((iterable) => replaceExamples(chainableExamples, iterable))
      .tap(console.log)
      .toArray()

    // TODO: generate TOC
    // add in chainable header
    // create ChainableIterable documentation
  } catch (err) {
    console.error(err)
  }
}

main()
