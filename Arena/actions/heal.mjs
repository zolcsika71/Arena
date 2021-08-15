'use strict'

// import Arena from '../getArena.mjs'

import Component from './component.mjs'

class HealAction extends Component {
    constructor(creep) {
        super()
        this.name = 'Heal'
        this.creep = creep
    }

    update() {
        const creep = this.creep;
        const weapon = creep.weapon;

        let target = creep.target

        let woundedInRange = Arena.myCreeps
        .filter(i => i.isWounded && creep.inRangeTo(i, weapon.range))

        // heal the closest friend in range in case the creep has no target
        // or the target is not in range

        if(_.isUndefined(target)) {

            if (woundedInRange.length === 0)
                return false

            woundedInRange = woundedInRange.sort(Util.byHits)
            target = woundedInRange[0]

        } else if (!woundedInRange.includes(target)) {
            return false
        }

        return weapon.heal(target)

    }
}

export default HealAction
