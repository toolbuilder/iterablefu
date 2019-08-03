import { promises } from 'fs'
import dot from 'dot'
import { chainable } from '../src/chainable.js'
import documentation from 'documentation'
import markedpp from 'markedpp'

const documentationOptions = {
  extension: 'js',
  shallow: true,
  'markdown-toc': false
}

dot.templateSettings = {
  ...dot.templateSettings,
  strip: false
}

const collectExamples = function * (iterable) {
  const namefinder = /^### ([a-zA-Z0-9]+)/
  const exampleBlock = /```/
  let collectingExample = false
  let example = { name: '', code: [] }
  for (const line of iterable) {
    const nameResult = namefinder.exec(line)
    if (nameResult !== null) {
      example.name = nameResult[1]
    }
    const exampleResult = exampleBlock.exec(line)
    if (collectingExample === false && exampleResult !== null) { // found example block start
      if (example.name !== '') {
        example.code.push(line)
        collectingExample = true
      }
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
  const namefinder = /^### ([a-zA-Z0-9]+)/
  const exampleBlock = /```/
  let collectingExample = false
  let example = { name: '' }
  let isReplacement = false
  for (const line of iterable) {
    const nameResult = namefinder.exec(line)
    if (nameResult !== null) {
      example.name = nameResult[1]
    }
    const exampleResult = exampleBlock.exec(line)
    if (collectingExample === false && exampleResult !== null) { // found example block start
      const replacmentExample = replacementExamples[example.name]
      if (replacmentExample) {
        isReplacement = true
        yield * replacmentExample.code // eat original block start, and replace it with entirety of replacement block
      } else {
        // It is ok if there is no match because the *_head.md fragments also have examples
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

const indentHeadingsOneMoreLevel = line => {
  if (line.startsWith('#')) {
    return '#' + line
  }
  return line
}

const processExamplesTemplateWith = (template, context) => {
  return chainable(template.split('\n'))
    .map(line => dot.template(line)(context))
    .mapWith(collectExamples)
    // build single object keyed by example.name
    .reduce((o, example) => {
      o[example.name] = example
      return o
    }, {})
}

const loadHeader = async function (filename) {
  const header = await promises.readFile(filename, 'utf-8')
  return header.split('\n')
}

const docGenFor = async function (filename) {
  const docs = await documentation.build([filename], documentationOptions).then(documentation.formats.md)
  return docs.split('\n') // .map(line => line.replace(/^- /, '* '))
}

const addToc = async function (withoutToc) {
  return new Promise((resolve, reject) => {
    markedpp(withoutToc, (err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })
}

async function generateChainableIterableDocumentation (head, sequencesDocumentation, transformsDocumentation, reducersDocumentation, examples) {
  const chainableIterableWithoutToc =
    chainable
      .concatenate(
        head,
        // need empty lines before and after !toc statement for markedpp to pick it up
        ['', '!toc (minlevel=2 level=3 omit="Table of Contents")', ''],
        ['## Generators', ' ', 'Static methods for creating ChainableIterables.'],
        sequencesDocumentation.map(indentHeadingsOneMoreLevel),
        ['## Transforms', ' ', 'Methods for transforming a sequence.'],
        transformsDocumentation.map(indentHeadingsOneMoreLevel),
        ['## Reducers', ' ', 'Methods for reducing a sequence to a single value.'],
        reducersDocumentation.map(indentHeadingsOneMoreLevel)
      )
      .reject(line => /^- {3}`iterable`/.exec(line) !== null) // strip 'iterable' parameter from all method comments
      .map(line => line.replace('Returns **Generator**', 'Returns **ChainableIterable**'))
      .mapWith((line) => replaceExamples(examples, line))
      .toArray()
      .join('\n')
  const chainableIterableDoc = await addToc(chainableIterableWithoutToc)
  await promises.writeFile('docs/ChainableIterable.md', chainableIterableDoc, 'utf-8')
}

async function generateChainableDocs (head, sequencesDocumentation, examples) {
  const chainableWithoutToc =
    chainable
      .concatenate(
        head,
        ['', '!toc (minlevel=2 level=3 omit="Table of Contents;Chainable As Function")', ''],
        ['## Generators', ' ', 'Static methods for creating ChainableIterables.'],
        sequencesDocumentation.map(indentHeadingsOneMoreLevel)
      )
      .reject(line => /^- {3}`iterable`/.exec(line) !== null) // strip 'iterable' parameter from all method comments
      .map(line => line.replace('Returns **Generator**', 'Returns [ChainableIterable](ChainableIterable.md)'))
      .mapWith((line) => replaceExamples(examples, line))
      .toArray()
      .join('\n')
  const chainableDoc = await addToc(chainableWithoutToc)
  await promises.writeFile('docs/chainable.md', chainableDoc, 'utf-8')
}

async function generateFunctionalDocs (headerFile, coreDocs, outputFile) {
  const header = await loadHeader(headerFile)

  const withoutToc =
    chainable
      .concatenate(
        header,
        ['', '!toc (minlevel=2 level=2 omit="Usage;Table of Contents")', ''],
        coreDocs
      )
      .map(line => {
        return line.replace(
          'Returns **Generator**',
          `Returns [Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)`)
      })
      .toArray()
      .join('\n')
  const doc = await addToc(withoutToc)
  await promises.writeFile(outputFile, doc, 'utf-8')
}

async function generateReadme (readmeFile) {
  const readme = await promises.readFile(readmeFile, 'utf-8')
  const doc = await addToc(readme)
  await promises.writeFile(readmeFile, doc, 'utf-8')
}

const main = async function () {
  try {
    await promises.mkdir('docs', { recursive: true })
    const chainableIterableHead = await loadHeader('docparts/ChainableIterable_head.md')
    const chainableHead = await loadHeader('docparts/chainable_head.md')
    const template = await promises.readFile('docparts/chainable_examples.md', 'utf-8')

    const chainableIterableExamples = processExamplesTemplateWith(template, { ctor: 'ChainableIterable.from', static: 'ChainableIterable' })
    const chainableExamples = processExamplesTemplateWith(template, { ctor: 'chainable', static: 'chainable' })

    const generatorDocumentation = await docGenFor('src/generators.js')
    const transformsDocumentation = await docGenFor('src/transforms.js')
    const reducersDocumentation = await docGenFor('src/reducers.js')
    const makeChainableDocumentation = await docGenFor('src/makechainable.js')

    await generateChainableIterableDocumentation(chainableIterableHead, generatorDocumentation, transformsDocumentation, reducersDocumentation, chainableIterableExamples)
    await generateChainableDocs(chainableHead, generatorDocumentation, chainableExamples)
    await generateFunctionalDocs('docparts/generators_head.md', generatorDocumentation, 'docs/generators.md')
    await generateFunctionalDocs('docparts/transforms_head.md', transformsDocumentation, 'docs/transforms.md')
    await generateFunctionalDocs('docparts/reducers_head.md', reducersDocumentation, 'docs/reducers.md')
    await generateFunctionalDocs('docparts/makechainable_head.md', makeChainableDocumentation, 'docs/makechainable.md')
    await generateReadme('README.md')
  } catch (err) {
    console.error(err)
  }
}

main()
