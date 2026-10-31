// Deliberately ephemeral: never persist personal credentials in storage, URLs or chat rows.
let apiKey = ""
const listeners = new Set<() => void>()
export const getUserApiKey = () => apiKey
export const subscribeUserApiKey = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export const setUserApiKey = (value: string) => {
  apiKey = value.trim()
  listeners.forEach(listener => listener())
}
