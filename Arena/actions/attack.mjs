'use strict'

import {getRange} from '/game/utils'

import Arena from '../getArena.mjs'

import Component from '../utils/component.mjs'

class AttackAction extends Component {
    constructor(creep) {
        super()
        this.creep = creep
    }

    update() {
        const creep = this.creep
        const weapon = creep.weapon

        let target = creep.target

        let enemiesInRange = Arena.enemyCreeps
            .filter(i => creep.inRangeTo(i, weapon.range))

        const numberOfEnemiesInRange = enemiesInRange.length

        // when no enemies are in range, than the target is not in range either
        if (numberOfEnemiesInRange === 0)
            return

        // if (this.creep.role === 'Ranged'
        //     && numberOfEnemiesInRange >= weapon.massAttackTreshold
        //     && target && getRange(this.creep, target) >= 1) {
        //     this.creep.memory.canMassAttack = true
        //     return
        // }




        // attack the closest enemy in range in case the creep has no target
        // or the target is not in range
        if (!target || !enemiesInRange.includes(target)) {
            enemiesInRange = enemiesInRange
                .sort(Util.byRangeTo(creep))

            target = enemiesInRange[0]
        }

        weapon.attack(target, numberOfEnemiesInRange)
    }
}

export default AttackAction
