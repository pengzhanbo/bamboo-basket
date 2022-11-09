import type { BambooBasketOptions, Setup } from './types'

export const defineConfig = (
  options: BambooBasketOptions,
  setup: Setup
): [BambooBasketOptions, Setup] => [options, setup]
