'use strict'


import Component from '../utils/component.mjs'

class MoveToGoalAction extends Component {
    constructor(creep) {
        super()

        this.creep = creep
    }

    update() {
        const creep = this.creep
        const goal = creep.goal

        if (goal) {
            creep.travelTo(goal)
        }
    }
}

export default MoveToGoalAction
