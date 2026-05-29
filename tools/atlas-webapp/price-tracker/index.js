#!/usr/bin/env node
// CLI entry point for Atlas price tracker.
// Node 24 native fetch — no node-fetch needed.

import { Command } from 'commander'
import { addProduct } from './commands/add-product.js'
import { checkAll } from './commands/check-all.js'
import { checkOne } from './commands/check-one.js'
import { listProducts } from './commands/list.js'
import { setAlert } from './commands/set-alert.js'

const program = new Command()

program
  .name('price-tracker')
  .description('Atlas price tracker — track product prices across stores')
  .version('1.0.0')

program
  .command('add-product')
  .description('Add a product to track')
  .requiredOption('-u, --url <urls...>', 'One or more store URLs for the same product')
  .option('-n, --name <name>', 'Product name (auto-detected if omitted)')
  .option('-c, --category <category>', 'Customs category: electronics|clothing|footwear|general')
  .option('-w, --weight <kg>', 'Product weight in kg (for shipping calculation)', parseFloat)
  .option('-t, --threshold <chf>', 'Alert threshold in CHF', parseFloat)
  .action(addProduct)

program
  .command('check-all')
  .description('Scrape prices for all tracked products and check alerts')
  .option('--no-alerts', 'Skip alert checking after scrape')
  .action(checkAll)

program
  .command('check-one')
  .description('Scrape prices for one product by id or name')
  .argument('<id-or-name>', 'Product id or partial name')
  .option('--no-alerts', 'Skip alert checking after scrape')
  .action(checkOne)

program
  .command('list')
  .description('List all tracked products with latest prices')
  .option('--json', 'Output raw JSON')
  .action(listProducts)

program
  .command('set-alert')
  .description('Set or update the CHF threshold for a product')
  .argument('<id-or-name>', 'Product id or partial name')
  .requiredOption('-t, --threshold <chf>', 'Alert threshold in CHF', parseFloat)
  .action(setAlert)

program.parseAsync(process.argv).catch(err => {
  console.error(`[price-tracker] Fatal: ${err.message}`)
  process.exit(1)
})
