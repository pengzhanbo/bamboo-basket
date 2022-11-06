import debug from 'debug'

export const createDebug = (name: string) => debug(`basket:${name}`)
