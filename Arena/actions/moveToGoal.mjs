// 'use strict'


import Component from '../utils/component.mjs'
import utils from '../utils/utils.mjs';




class MoveToGoalAction extends Component {
    constructor(creep) {
        super()
        this.creep = creep
    }

    update() {
        const creep = this.creep
        const goal = creep.goal

        if (goal) {
            let data = {}
            let ret = creep.travelTo(goal, {returnData: data, range: 1})
            // console.log(`travelTo: ${utils.translateErrorCode(ret)}`)
            // if (data.path) {
            //     console.log(`path.length: ${data.path.length}\n`);
            // }
        }
    }
}

export default MoveToGoalAction
