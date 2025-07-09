export function getTodayString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTodayFormattedString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1)
  const day = String(today.getDate())
  return `${year}年${month}月${day}日`
}
