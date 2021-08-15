'use strict'

class HealerWeapon {
    constructor(creep) {
        this.creep = creep
    }

    get range() {
        return 3
    }

    // depending on the range to the target, either use heal or ranged heal
    heal(target) {

        if (this.creep.inRangeTo(target, 1)) {
            return this.creep.heal(target)
        } else {
            return this.creep.rangedHeal(target)
        }
    }
}

export default HealerWeapon
