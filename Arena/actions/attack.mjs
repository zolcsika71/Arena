'use strict'

import Component from './component.mjs'

class AttackAction extends Component {
    constructor(creep) {
        super()
        this.name = 'attack'
        this.creep = creep
    }

    update() {
        const creep = this.creep;
        const weapon = creep.weapon;
        const group = creep.group;

        let target = creep.target;

        let enemiesInRange = Arena.enemyCreeps
            .filter(i => creep.inRangeTo(i, weapon.range));

        let numberOfEnemiesInRange = enemiesInRange.length;

        // when no enemies are in range, than the target is not in range either
        // if (enemiesInRange.length === 0)
        //     return

        // if (this.creep.role === 'Ranged'
        //     && numberOfEnemiesInRange >= weapon.massAttackTreshold
        //     && target && getRange(this.creep, target) >= 1) {
        //     this.creep.memory.canMassAttack = true
        //     return
        // }

        // attack the closest enemy in range in case the creep has no target
        // or the target is not in range
        // if (!target || !enemiesInRange.includes(target)) {
        //     enemiesInRange = enemiesInRange
        //         .sort(Util.byRangeTo(creep))
        //
        //     target = enemiesInRange[0]
        // }

        if(_.isUndefined(target)) {

            if (enemiesInRange.length === 0)
                return false

            if (group.leader.target)
                target = group.leader.target;

            // enemiesInRange = enemiesInRange.sort(Util.byHits)
            // target = enemiesInRange[0]

        } else if (!enemiesInRange.includes(target)) {
            return false
        }

        return weapon.attack(target, numberOfEnemiesInRange)

    }
}

export default AttackAction
