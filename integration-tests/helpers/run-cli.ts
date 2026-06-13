import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CLI_PATH = resolve(__dirname, '../../lib/index.js')

interface RunResult {
  exitCode: number
  stderr: string
  stdout: string
}

const runCli = (args: string[] = [], cwd = process.cwd()): Promise<RunResult> =>
  new Promise(resolve => {
    const child = spawn('node', [CLI_PATH, ...args], { cwd })

    let stdout = ''
    let stderr = ''

    child.stdout?.on('data', (data: Buffer) => { stdout += data.toString() })
    child.stderr?.on('data', (data: Buffer) => { stderr += data.toString() })

    child.on('close', code => {
      resolve({ exitCode: code ?? 1, stderr, stdout })
    })
  })

export {
  runCli,
}
