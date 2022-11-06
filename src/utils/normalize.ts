export const cameDashesCase = (name: string): string => {
  return name.replace(/[A-Z]/g, (match) => {
    return `-${match.toLowerCase()}`
  })
}
