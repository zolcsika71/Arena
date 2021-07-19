'use strict'

import Component from '../utils/component.mjs'
import {getRange} from '/game/utils'

class MovementAction extends Component {
    constructor(creep) {
        super()
        this.creep = creep
    }

    update() {
        const creep = this.creep
        const target = creep.target
        const goal = creep.goal

        if (target) {
            // behaviour: distance to target
            if (creep.inRangeTo(target, creep.weapon.range)) {
                // should creep move closer than attackRange to the target?
                // if (this.creep.memory.canMassAttack && getRange(this, target) > 1)
                //     creep.moveTo(target)
            } else {
                // target out of range, should creep follow target or move to goal?

                // behaviour: alert range
                if (creep.inRangeTo(goal, creep.alertRange)) {
                    // follow target, because we're in alertRange
                    creep.moveTo(target)
                } else {
                    // move to goal, because we're out of alertRange
                    creep.moveTo(goal)
                }
            }
        } else {
            creep.moveTo(goal)
        }
    }
}

export default MovementAction
