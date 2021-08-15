'use strict'

import Component from './component.mjs'

class MoveToGoalAction extends Component {
    constructor(creep) {
        super()
        this.creep = creep
    }

    update() {
        const creep = this.creep
        const goal = creep.goal

        if (goal) {
            let ret = creep.travelTo(goal.position, {range: 0})
            return ret
        } else
            return false;
    }
}

export default MoveToGoalAction
