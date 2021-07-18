'use strict'

import Flee from './flee.mjs'

class StayOutOfHarmAction extends Flee {
    get meleeHitsPercentage() {
        return 1
    }

    get rangedHitsPercentage() {
        return 0.75
    }
}

export default StayOutOfHarmAction
