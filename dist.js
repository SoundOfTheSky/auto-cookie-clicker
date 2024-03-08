// src/settings.ts
var BUY = true;
var CLICK = true;
var COMBO = true;
var SHIMMERS = true;
var LUMPS = true;
var CLICKS_PER_SECOND = 14;

// src/click.ts
if (CLICK)
  setInterval(() => {
    Game.ClickCookie();
  }, 1000 / CLICKS_PER_SECOND);

// src/shimmer.ts
if (SHIMMERS)
  setInterval(() => {
    for (const shimmer of Game.shimmers)
      shimmer.pop();
  }, 1000);

// src/utils.ts
function formatTime(time, min = 1) {
  const ranges = [
    [31536000000, "y"],
    [86400000, "d"],
    [3600000, "h"],
    [60000, "m"],
    [1000, "s"],
    [1, "ms"]
  ];
  let output = "";
  for (const [ms, title] of ranges) {
    if (time < min)
      break;
    if (time < ms)
      continue;
    const val = Math.floor(time / ms);
    if (val !== 0)
      output += ` ${val}${title}`;
    time %= ms;
  }
  return output;
}

// src/buy.ts
var autoBuyLoop = function() {
  const bestBuy = calculatePPForObjects().reduce((acc, x) => acc && acc.pp > x.pp ? acc : x);
  if (bestBuy.timeToBuy === 0)
    bestBuy.object.buy(1);
  setTimeout(() => {
    const nextBestBuy = calculatePPForObjects().reduce((acc, x) => acc && acc.pp > x.pp ? acc : x);
    const timeForNextBuy = nextBestBuy.timeToBuy ? Math.floor(nextBestBuy.timeToBuy) * 1000 + 1000 : 0;
    if (timeForNextBuy)
      Game.Notify("[AUTO] Auto buy", `Waiting ${formatTime(timeForNextBuy)} to buy ${nextBestBuy.object.name}`, undefined, 10);
    setTimeout(autoBuyLoop, Math.min(60000, timeForNextBuy));
  }, 100);
};
var calculatePPForObjects = function() {
  let cps = Game.cookiesPs * (1 - Game.cpsSucked);
  if (CLICK)
    cps += CLICKS_PER_SECOND * Game.computedMouseCps;
  let lastIndex = Game.ObjectsById.findIndex((x) => x.amount === 0) + 1;
  if (lastIndex === 0)
    lastIndex = Game.ObjectsById.length;
  const items = Game.ObjectsById.slice(0, lastIndex).map((object) => ({
    object,
    timeToBuy: object.price < Game.cookies ? 0 : (object.price - Game.cookies) / cps
  }));
  const calcTime = Math.min(Math.max(Math.max(...items.map((x) => x.timeToBuy)) * 2, 900), 3600);
  return items.map((x) => ({
    ...x,
    pp: x.object.storedCps * Game.globalCpsMult * (calcTime - x.timeToBuy) / x.object.price
  }));
};
if (BUY)
  autoBuyLoop();

// src/combo.ts
if (CLICK && COMBO)
  setInterval(() => {
    const buff = Game.buffs["Click frenzy"];
    if (!buff) {
      if (comboStartedCookies) {
        Game.Notify(`[AUTO] Combo was successfully executed!`, `And we made ${Beautify(Game.cookies - comboStartedCookies)} cookies!`);
        comboStartedCookies = 0;
      }
      return;
    }
    if (comboStartedCookies)
      return;
    comboStartedCookies = Game.cookies;
    const wizardMinigame = Game.Objects["Wizard tower"].minigame;
    if (wizardMinigame.magic === wizardMinigame.magicM)
      wizardMinigame.castSpell(wizardMinigame.spells["hand of fate"]);
    Game.Objects["Cursor"].sell(Game.Objects["Cursor"].amount);
  }, 1000);
var comboStartedCookies = 0;

// src/lumps.ts
var lumpLoop = function() {
  if (!Game.canLumps()) {
    setTimeout(lumpLoop, 3600000);
    return;
  }
  const timeLeft = Game.lumpMatureAge - (Date.now() - Game.lumpT) + 1000;
  if (timeLeft > 0) {
    Game.Notify("[AUTO] Lumps collecting", `Collecting in ${formatTime(timeLeft)}`, undefined, 10);
    setTimeout(lumpLoop, timeLeft);
  } else {
    Game.clickLump();
    setTimeout(lumpLoop, 1000);
  }
};
if (LUMPS)
  lumpLoop();
