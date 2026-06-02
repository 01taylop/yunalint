#!/usr/bin/env node
import { ProcessSupervisor } from 'process-supervisor'

import { createProgram } from './program'

const supervisor = new ProcessSupervisor()

const program = createProgram({
  supervisor,
})

await program.parseAsync(process.argv)
