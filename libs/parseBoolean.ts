export const parseBoolean = (value: any): boolean => {
  if (typeof value === "boolean") return value

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    if (["true", "1", "yes", "on"].includes(normalized)) return true
    if (["false", "0", "no", "off", ""].includes(normalized)) return false
  }

  return Boolean(value)
}
