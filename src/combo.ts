/**
 * Combo is one of the best way to gain cookies.
 * To execute combo you need:
 * 1. Worship Godzamok in diamond slot.
 * 2. Worship Muridal in ruby slot (1.1x cookies per click).
 * 3. Have click frenzy boost from golden cookie (777x cookies per click).
 * 4. Activate Hand of Fate spell (~10x cookies per click).
 * 5. Sell all Cursors (~2.5x cookies per click).
 * Sum: ~21367x cookies per click
 */

import { CLICK, COMBO } from './settings'
import { assignGod } from './utilities'

if (CLICK && COMBO)
  setInterval(() => {
    const buff = Game.buffs['Click frenzy']
    if (!buff) {
      if (comboStartedCookies) {
        Game.Notify(
          `[AUTO] Combo was successfully executed!`,
          `And we made ${Beautify(Game.cookies - comboStartedCookies)} cookies!`,
        )
        comboStartedCookies = 0
      }
      return
    }
    if (comboStartedCookies) return
    comboStartedCookies = Game.cookies
    const wizardMinigame = Game.Objects['Wizard tower'].minigame
    if (wizardMinigame && wizardMinigame.magic === wizardMinigame.magicM)
      wizardMinigame.castSpell(wizardMinigame.spells['hand of fate'])
    if (assignGod(0, 'ruin'))
      Game.Objects.Cursor.sell(Game.Objects.Cursor.amount)
  }, 1000)
let comboStartedCookies = 0
