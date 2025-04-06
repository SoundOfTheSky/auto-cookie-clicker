import { formatNumber } from '@softsky/utils'

import { LUMPS } from './settings'

function lumpLoop() {
  if (!Game.canLumps()) {
    setTimeout(lumpLoop, 3_600_000)
    return
  }
  const timeLeft = Game.lumpMatureAge - (Date.now() - Game.lumpT) + 1000
  if (timeLeft > 0) {
    Game.Notify(
      '[AUTO] Lumps collecting',
      `Collecting in ${formatNumber(timeLeft)}`,
      undefined,
      10,
    )
    setTimeout(lumpLoop, timeLeft)
  } else {
    Game.clickLump()
    setTimeout(lumpLoop, 1000)
  }
}
if (LUMPS) lumpLoop()
