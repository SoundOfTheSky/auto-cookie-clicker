import { SEC_MS } from '@softsky/utils'

import { SHIMMERS } from './settings'

if (SHIMMERS)
  setInterval(() => {
    for (const shimmer of Game.shimmers) shimmer.pop()
  }, SEC_MS)
