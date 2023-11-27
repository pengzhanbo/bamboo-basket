import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function getDirname(importMetaUrl: string) {
  return path.dirname(fileURLToPath(importMetaUrl))
}
