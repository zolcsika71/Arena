'use strict'

import Flee from './flee.mjs'

class LastStandAction extends Flee {
    get meleeHitsPercentage() {
        return 0.25
    }

    get rangedHitsPercentage() {
        return 0
    }
}

export default LastStandAction
