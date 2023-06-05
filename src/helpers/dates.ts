export function ISODateWithNextMonth() {
  const currentDate = new Date()
  const nextMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
  )
  return nextMonth.toISOString().slice(0, 10)
}
