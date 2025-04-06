/**
 * This script will automatically buy objects (buildings)
 * based on how profitable will be investmenting in it.
 *
 * Script will simulate cookie gains for up to an hour
 * with and without the building to determine its profitability.
 */

import { formatNumber } from '@softsky/utils'

import { BUY, CLICK, CLICKS_PER_SECOND } from './settings'

function autoBuyLoop() {
  const bestBuy = getBestBuy()
  if (bestBuy?.timeToBuy === 0) bestBuy.object.buy(1)
  // Wait for next tick
  setTimeout(() => {
    const nextBestBuy = getBestBuy()
    const timeForNextBuy = nextBestBuy?.timeToBuy
      ? Math.floor(nextBestBuy.timeToBuy) * 1000 + 1000
      : 0
    if (timeForNextBuy)
      Game.Notify(
        '[AUTO] Auto buy',
        `Waiting ${formatNumber(timeForNextBuy)} to buy ${nextBestBuy!.object.name}`,
        undefined,
        10,
      )
    setTimeout(autoBuyLoop, Math.min(60_000, timeForNextBuy))
  }, 100)
}

function getBestBuy() {
  const pps = calculatePPForObjects()
  let best
  for (let index = 0; index < pps.length; index++) {
    const pp = pps[index]!
    if (pp.pp > (best?.pp ?? 0)) best = pp
  }
  return best
}
/**
 * Calculate PP for every unlocked object.
 * PP is approximation of how profitable will be investing in this object.
 */
function calculatePPForObjects() {
  let cps = Game.cookiesPs * (1 - Game.cpsSucked)
  if (CLICK) cps += CLICKS_PER_SECOND * Game.computedMouseCps
  let lastIndex = Game.ObjectsById.findIndex((x) => x.amount === 0) + 1
  if (lastIndex === 0) lastIndex = Game.ObjectsById.length
  const items = Game.ObjectsById.slice(0, lastIndex).map((object) => ({
    object,
    timeToBuy:
      object.price < Game.cookies ? 0 : (object.price - Game.cookies) / cps,
  }))
  // Cookie gain simulation time in seconds. 900 < [maxTimeToBuy * 2] < 3600
  const calcTime = Math.min(
    Math.max(Math.max(...items.map((x) => x.timeToBuy)) * 2, 900),
    3600,
  )
  return items.map((x) => ({
    ...x,
    pp:
      (x.object.storedCps * Game.globalCpsMult * (calcTime - x.timeToBuy)) /
      x.object.price,
  }))
}

if (BUY) autoBuyLoop()
