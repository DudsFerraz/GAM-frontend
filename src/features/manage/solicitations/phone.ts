export function toPhoneE164(value: string): string {
  const digits = value.replace(/\D/g, '')
  return value.trim().startsWith('+') ? `+${digits}` : `+55${digits}`
}
