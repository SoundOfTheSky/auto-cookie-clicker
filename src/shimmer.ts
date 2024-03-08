import { SHIMMERS } from './settings';

if (SHIMMERS)
  setInterval(() => {
    for (const shimmer of Game.shimmers) shimmer.pop();
  }, 1000);
