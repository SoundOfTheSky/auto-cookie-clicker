export function assignGod(
  slot: number,
  godName: keyof GameTempleMinigame['gods'],
) {
  const minigame = Game.Objects.Temple.minigame
  if (!minigame) return false
  const god = minigame.gods[godName]
  if (minigame.swaps < 3) return false
  if (minigame.slot[slot] !== god.id) {
    minigame.slotHovered = slot
    minigame.dragging = god
    minigame.dropGod()
  }
  return true
}

export function removeGod(
  slot: number,
  godName: keyof GameTempleMinigame['gods'],
) {
  const minigame = Game.Objects.Temple.minigame
  if (!minigame) return
  const god = minigame.gods[godName]
  if (minigame.slot[slot] !== god.id) return
  minigame.slotHovered = -1
  minigame.dragging = god
  minigame.dropGod()
}
