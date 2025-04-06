import { CLICK, CLICKS_PER_SECOND } from './settings'

if (CLICK)
  setInterval(() => {
    Game.ClickCookie()
  }, 1000 / CLICKS_PER_SECOND)
