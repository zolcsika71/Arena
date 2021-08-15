'use strict'

class MeleeWeapon {
    constructor(creep) {
        this.creep = creep
    }

    get range() {
        return 1
    }

    attack(target) {
        return this.creep.attack(target)
    }
}

export default MeleeWeapon
