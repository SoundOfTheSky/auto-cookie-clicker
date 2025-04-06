type GameObject = {
  id: number
  basePrice: number
  price: number
  storedCps: number
  amount: number
  name: string
  buy: (n?: number) => unknown
  sell: (n?: number) => unknown
}

type GameBuff = {
  time: number
  maxTime: number
  multClick?: number
  multCps?: number
}

type GameSpell = {
  costMin: number
  costPercent: number
}

type GameGod = {
  id: number
}

type GameTempleMinigame = {
  gods: {
    ruin: GameGod
  }
  swaps: number
  slot: [number, number, number]
  slotHovered: number
  dragging?: GameGod
  dropGod: () => unknown
}

type GameWizardMinigame = {
  magic: number
  magicM: number
  spells: {
    'hand of fate': GameSpell
  }
  getSpellCost: (spell: GameSpell) => number
  castSpell: (spell: GameSpell) => boolean
}

declare const Game: {
  cookies: number
  cookiesPs: number
  globalCpsMult: number
  computedMouseCps: number
  cpsSucked: number
  fps: number
  lumpT: number
  lumpMatureAge: number
  clickLump: () => unknown
  canLumps: () => unknown
  Notify: (
    title: string,
    description: string,
    pic?: string,
    quick?: number,
    noLog?: boolean,
  ) => unknown
  ClickCookie: () => unknown
  shimmers: {
    pop: () => unknown
  }[]
  Objects: {
    Cursor: GameObject
    'Wizard tower': GameObject & {
      minigame?: GameWizardMinigame
    }
    Temple: GameObject & {
      minigame?: GameTempleMinigame
    }
  }
  ObjectsById: GameObject[]
  buffs: Record<string, GameBuff>
}

declare const Beautify: (n: number) => string
