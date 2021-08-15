'use strict'

import Component from './component.mjs'


class MovementAction extends Component {
    constructor(creep) {
        super()
        this.name = 'move'
        this.creep = creep
    }

    update() {
        const creep = this.creep
        const target = creep.target
        const goal = creep.goal

        // console.log(`target: ${utils.json(target)}`)
        // console.log(`goal: ${utils.json(goal)}`)

        if (target) {
            // behaviour: distance to target
            if (creep.inRangeTo(target, creep.weapon.range)) {
                // should creep move closer than attackRange to the target?
                if (this.creep.role === 'Ranged' && Game.getRange(this, target) > 2) {
                    // TODO check if target is moving -> movingTarget: true
                    let ret = creep.travelTo(target)
                    return ret
                }
            } else {
                // behaviour: alert range
                if (creep.inRangeTo(target, creep.alertRange)) {
                    // follow target, because we're in alertRange
                    let ret = creep.travelTo(target)
                    return ret;
                } else {
                    // move to goal, because we're out of alertRange
                    let ret = creep.travelTo(goal.position, {range: 0, ignoreCreeps: goal.ignoreCreeps})
                    return ret;
                }
            }
        } else {
            let ret = creep.travelTo(goal.position, {range: 0, ignoreCreeps: goal.ignoreCreeps})
            return ret;
        }
    }
}

export default MovementAction
