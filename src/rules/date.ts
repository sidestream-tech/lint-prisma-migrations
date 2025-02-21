export function isDateValid(name: string) {
  const year = Number.parseFloat(name.slice(0, 4))
  const month = Number.parseFloat(name.slice(5, 6))
  const day = Number.parseFloat(name.slice(7, 8))

  const date = new Date(year, month, day)

  return Date.now() > date.getTime()
}
