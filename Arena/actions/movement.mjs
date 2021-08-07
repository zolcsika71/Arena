'use strict'

import Component from '../utils/component.mjs'


class MovementAction extends Component {
    constructor(creep) {
        super()
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
                    let data = {}
                    creep.travelTo(target, {returnData: data})
                    console.log(`Creep ${creep.id} => chasing Creep ${target.id}`)
                    if (data.path)
                        console.log(`${data.path.length} more!`);
                }
            } else {
                // target out of range, should creep follow target or move to goal?

                // behaviour: alert range
                if (creep.inRangeTo(goal, creep.alertRange)) {
                    // follow target, because we're in alertRange
                    let data = {}
                    creep.travelTo(goal, {returnData: data, range: 0})
                    // if (data.path)
                    //     console.log(`path.length: ${data.path.length}\n`);
                } else {
                    // move to goal, because we're out of alertRange
                    let data = {}
                    creep.travelTo(target, {returnData: data})
                    // if (data.path)
                    //     console.log(`path.length: ${data.path.length}\n`);
                }
            }
        } else {
            let data = {}
            let ret = creep.travelTo(goal, {returnData: data, range: 1})
            // console.log(`travelTo: ${utils.translateErrorCode(ret)}`)
            // if (data.path) {
            //     console.log(`creepId: ${creep.id} path.length: ${data.path.length}\n`);
            // }

        }
    }
}

export default MovementAction
