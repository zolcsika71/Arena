'use strict'

class RangedWeapon {
    constructor(creep) {
        this.creep = creep
        this.massAttackTreshold = 3
    }

    get range() {
        return 3
    }

    // depending on the number of enemies in range, either use a mass attack
    // or a single target attack
    attack(target, numberOfEnemiesInRange) {
        if (numberOfEnemiesInRange >= this.massAttackTreshold) {
            console.log(`massAttack: ${this.creep.id}`)
            return this.creep.rangedMassAttack(target)
        } else {
            console.log(`rangedAttack: ${this.creep.id}`)
            return this.creep.rangedAttack(target)
        }
    }
}

export default RangedWeapon
