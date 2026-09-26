export function formatPlayerName(name: string, nickname: string | null): string {
  if (!nickname) return name

  // Check if name has first and last name
  const nameParts = name.split(" ")
  if (nameParts.length < 2) return `${name} '${nickname}'`

  // Insert nickname between first and last name
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(" ")
  return `${firstName} '${nickname}' ${lastName}`
}

// Nickname, or surname when there is none, for places too small for the full name.
export function formatShortPlayerName(name: string, nickname: string | null): string {
  return nickname || name.split(" ").slice(-1)[0]
}
