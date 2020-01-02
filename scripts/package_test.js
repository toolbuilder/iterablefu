import { promises } from 'fs'
import { chainable } from '../src/chainable.js'
import path from 'path'
import os from 'os'
import shell from 'shelljs'

const exec = async (cmd) => {
  return new Promise((resolve, reject) => {
    shell.exec(cmd, (code, stdout, stderr) => {
      if (code !== 0) reject(new Error(stderr))
      resolve(code)
    })
  })
}

const testSrcDir = 'temp/test/'

const transformTestsToUsePackage = async () => {
  await promises.mkdir('temp', { recursive: true })
  await promises.mkdir(testSrcDir, { recursive: true })
  const filenames = (await promises.readdir('test/')).filter(filename => filename.endsWith('.js'))
  for (const filename of filenames) {
    const lines = (await promises.readFile('test/' + filename, 'utf-8')).split('\n') // inefficient, but easy
    const browserSource = chainable(lines)
      .map(line => {
        return line
          .replace(
            "import * as generators from '../src/generators.js'",
            "import { generators } from 'iterablefu'")
          .replace(
            "import * as transforms from '../src/transforms.js'",
            "import { transforms } from 'iterablefu'")
          .replace(
            "import * as reducers from '../src/reducers.js'",
            "import { reducers } from 'iterablefu'")
          .replace(
            "import { makeChainableIterable } from '../src/makechainable.js'",
            "import { makeChainableIterable } from 'iterablefu'")
          .replace(
            "} from '../src/chainable.js'",
            "} from 'iterablefu'")
      })
      .toArray()
      .join('\n')
    await promises.writeFile(testSrcDir + filename, browserSource + '\n', 'utf-8')
  }
}

const main = async () => {
  let exitCode = 0
  await transformTestsToUsePackage()
  const tempDir = await promises.mkdtemp(path.join(os.tmpdir(), 'iterablefu-'))
  try {
    shell.cp('scripts/package.test.json', tempDir + '/package.json')
    await promises.mkdir(`${tempDir}/test`, { recursive: true })
    shell.cp('-R', testSrcDir, `${tempDir}`)
    await exec('npm pack', {})
    shell.mv('*.tgz', tempDir + '/iterablefu.tgz')
    shell.pushd(tempDir)
    await exec('npm install')
    await exec('npm run test')
  } catch (e) {
    console.log(e)
    exitCode = 1
  } finally {
    shell.popd()
    shell.rm('-rf', tempDir)
  }
  process.exit(exitCode)
}

main()
