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
// node_modules/@softsky/utils/dist/consts.js
var SEC_MS = 1000;
// node_modules/@softsky/utils/dist/control.js
var _uuid = Date.now() * 1000;
// node_modules/@softsky/utils/dist/formatting.js
var FORMAT_NUMBER_RANGES = [
  {
    start: 31536000000,
    title: "y"
  },
  {
    start: 86400000,
    title: "d"
  },
  {
    start: 3600000,
    title: "h"
  },
  {
    start: 60000,
    title: "m"
  },
  {
    start: 1000,
    title: "s"
  },
  {
    start: 1,
    title: "ms"
  }
];
function formatNumber(time, min = 0, ranges = FORMAT_NUMBER_RANGES) {
  let output = "";
  for (const { start, delimiter, pad, title } of ranges) {
    if (start < min)
      break;
    if (time < start && !pad)
      continue;
    let value = (time / start | 0).toString();
    time %= start;
    if (pad)
      value = value.padStart(pad, "0");
    if (output)
      output += delimiter ?? " ";
    output += value;
    if (title)
      output += title;
  }
  return output;
}
function formatBytes(bytes) {
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0)
    return `0B`;
  const pow = Math.trunc(Math.log(bytes) / Math.log(1024));
  const maxPow = Math.min(pow, sizes.length - 1);
  return `${Number.parseFloat((bytes / Math.pow(1024, maxPow)).toFixed(2))}${sizes[maxPow]}`;
}
function log(...agrs) {
  console.log(new Date().toLocaleString("ru"), ...agrs);
}
class ProgressLoggerTransform extends TransformStream {
  constructor(string_, logInterval, maxSize) {
    let bytes = 0;
    const start = Date.now();
    let lastBytes = 0;
    super({
      transform(chunk, controller) {
        controller.enqueue(chunk);
        bytes += chunk.length;
      },
      flush() {
        clearInterval(interval);
        log("Done!");
      }
    });
    const interval = setInterval(() => {
      let message = string_;
      const speed = (bytes - lastBytes) / logInterval;
      message = message.replace("%b", formatBytes(bytes)).replace("%t", formatNumber(Date.now() - start, 1000)).replace("%s", formatBytes(speed));
      if (maxSize)
        message = message.replace("%lt", formatNumber(Math.trunc((maxSize - bytes) / speed) * 1000)).replace("%p", Math.trunc(bytes / maxSize * 100).toString()).replace("%s", formatBytes(maxSize));
      log(message);
      lastBytes = bytes;
    }, logInterval * 1000);
  }
}
// src/shimmer.ts
if (SHIMMERS)
  setInterval(() => {
    for (const shimmer of Game.shimmers)
      shimmer.pop();
  }, SEC_MS);

// src/buy.ts
function autoBuyLoop() {
  const bestBuy = getBestBuy();
  if (bestBuy?.timeToBuy === 0)
    bestBuy.object.buy(1);
  setTimeout(() => {
    const nextBestBuy = getBestBuy();
    const timeForNextBuy = nextBestBuy?.timeToBuy ? Math.floor(nextBestBuy.timeToBuy) * 1000 + 1000 : 0;
    if (timeForNextBuy)
      Game.Notify("[AUTO] Auto buy", `Waiting ${formatNumber(timeForNextBuy)} to buy ${nextBestBuy.object.name}`, undefined, 10);
    setTimeout(autoBuyLoop, Math.min(60000, timeForNextBuy));
  }, 100);
}
function getBestBuy() {
  const pps = calculatePPForObjects();
  let best;
  for (let index = 0;index < pps.length; index++) {
    const pp = pps[index];
    if (pp.pp > (best?.pp ?? 0))
      best = pp;
  }
  return best;
}
function calculatePPForObjects() {
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
}
if (BUY)
  autoBuyLoop();

// src/utils.ts
function assignGod(slot, godName) {
  const minigame = Game.Objects.Temple.minigame;
  if (!minigame)
    return false;
  const god = minigame.gods[godName];
  if (minigame.swaps < 3)
    return false;
  if (minigame.slot[slot] !== god.id) {
    minigame.slotHovered = slot;
    minigame.dragging = god;
    minigame.dropGod();
  }
  return true;
}

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
    if (wizardMinigame && wizardMinigame.magic === wizardMinigame.magicM)
      wizardMinigame.castSpell(wizardMinigame.spells["hand of fate"]);
    if (assignGod(0, "ruin"))
      Game.Objects.Cursor.sell(Game.Objects.Cursor.amount);
  }, 1000);
var comboStartedCookies = 0;

// src/lumps.ts
function lumpLoop() {
  if (!Game.canLumps()) {
    setTimeout(lumpLoop, 3600000);
    return;
  }
  const timeLeft = Game.lumpMatureAge - (Date.now() - Game.lumpT) + 1000;
  if (timeLeft > 0) {
    Game.Notify("[AUTO] Lumps collecting", `Collecting in ${formatNumber(timeLeft)}`, undefined, 10);
    setTimeout(lumpLoop, timeLeft);
  } else {
    Game.clickLump();
    setTimeout(lumpLoop, 1000);
  }
}
if (LUMPS)
  lumpLoop();
