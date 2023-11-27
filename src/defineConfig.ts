import type { BambooBasketOptions, Setup } from './types'

export function defineConfig(options: BambooBasketOptions, setup: Setup): [BambooBasketOptions, Setup] {
  return [options, setup]
}
