'use strict'

// import Arena from '../getArena.mjs'

import Component from '../utils/component.mjs'

class HealAction extends Component {
    constructor(creep) {
        super()
        this.creep = creep
    }

    update() {
        const creep = this.creep
        const weapon = creep.weapon

        let woundedInRange = Arena.myCreeps
            .filter(i => i.isWounded && creep.inRangeTo(i, weapon.range))

        if (woundedInRange.length === 0)
            return

        let target = creep.target

        // heal the closest friend in range in case the creep has no target
        // or the target is not in range
        if (!target || !woundedInRange.includes(target)) {
            woundedInRange = woundedInRange
                .sort(Util.byHits)

            target = woundedInRange[0]
        }

        weapon.heal(target)
    }
}

export default HealAction
