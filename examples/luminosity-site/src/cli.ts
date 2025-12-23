// ANSI Color Codes
const style = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  emerald: '\x1b[38;5;48m', // Approximate Emerald
}

const command = process.argv[2]
const args = process.argv.slice(3)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  switch (command) {
    case 'stats':
      await stats()
      break
    case 'warm':
      await warm()
      break
    case 'compact':
      await compact()
      break
    default:
      console.log(`${style.red}Unknown command: ${command}${style.reset}`)
      console.log(`Available commands: stats, warm, compact`)
      process.exit(1)
  }
}

async function stats() {
  console.log()
  console.log(`${style.dim}┌  ${style.reset}${style.bright}Luminosity Status${style.reset}`)

  // Simulate some realistic looking numbers
  const totalUrls = '1,240,592'
  const indexSize = '45.2 MB'
  const fragments = '12'

  console.log(`${style.dim}│  ${style.reset}Total URLs: ${style.emerald}${totalUrls}${style.reset}`)
  console.log(`${style.dim}│  ${style.reset}Index Size: ${style.emerald}${indexSize}${style.reset}`)
  console.log(`${style.dim}│  ${style.reset}Fragments:  ${style.emerald}${fragments}${style.reset}`)
  console.log(`${style.dim}└  ${style.reset}Ready.`)
  console.log()
}

async function warm() {
  const force = args.includes('--force')

  if (!force) {
    // Imitate a check
    await sleep(300)
  }

  console.log()
  process.stdout.write(`${style.emerald}✔${style.reset} Compaction started...`)
  await sleep(600) // Fake work
  console.log()

  process.stdout.write(
    `${style.emerald}✔${style.reset} Cache warming complete ${style.dim}(142ms)${style.reset}`
  )
  console.log()
  console.log()
}

async function compact() {
  console.log()
  console.log(`${style.yellow}⚡ Initiating Level-0 Compaction...${style.reset}`)
  await sleep(400)

  const steps = [
    'Flushing MemTable to immutable segment...',
    'Merging 4 SSTables...',
    'Rebuilding Bloom Filters...',
    'Optimizing seek table...',
  ]

  for (const step of steps) {
    await sleep(300 + Math.random() * 400)
    console.log(`${style.dim}  › ${step}${style.reset}`)
  }

  await sleep(200)
  console.log(
    `${style.emerald}✔ Compaction finished.${style.reset} ${style.dim}Freed 12.4 MB space.${style.reset}`
  )
  console.log()
}

main().catch(console.error)
