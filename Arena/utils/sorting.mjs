'use strict'

import {getRange} from '/game/utils'

class Sorting {

    constructor() {
        this.DESC = -1
        this.ASC = 1
    }

    byRangeTo(position, direction = this.ASC) {
        return (a, b) => (getRange(a, position) - getRange(b, position)) * direction
    }

    byHits(direction = this.ASC) {
        return (a, b) => (a.hits - b.hits) * direction
    }
}

export default new Sorting()
