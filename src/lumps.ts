import { LUMPS } from './settings';
import { formatTime } from './utils';

function lumpLoop() {
  if (!Game.canLumps()) {
    setTimeout(lumpLoop, 3600000);
    return;
  }
  const timeLeft = Game.lumpMatureAge - (Date.now() - Game.lumpT) + 1000;
  if (timeLeft > 0) {
    Game.Notify('[AUTO] Lumps collecting', `Collecting in ${formatTime(timeLeft)}`, undefined, 10);
    setTimeout(lumpLoop, timeLeft);
  } else {
    Game.clickLump();
    setTimeout(lumpLoop, 1000);
  }
}
if (LUMPS) lumpLoop();
