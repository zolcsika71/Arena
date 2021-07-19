'use strict'

import Arena from '../getArena.mjs'

class Stats {
    constructor() {
        this.strategy = Arena.strategy
    }

    get refreshTime() {
        return 1
    }

    get timeForOutput() {
        return Arena.time % this.refreshTime === 0
    }

    start() {
        // console.log(`Arena: ${this.strategy.className}`)
        // console.log(`attackers: ${this.strategy.groups.attackers.length}`)
        // console.log(`defenders: ${this.strategy.groups.defenders.length}`)
    }

    displayGroups(group) {
        const members = group.members
        if (members.length > 0)
            console.log(`group: ${group.name} leader: [${group.leader.id}, ${group.leader.role}] members ${members.length}`)
        else
            console.log(`${group.name} is dead`)
    }

    update() {
        if(this.timeForOutput) {

            // for (const group of Strategy.attackers)
            //     this.displayGroups(group)
            //
            // for (const group of Strategy.defenders)
            //     this.displayGroups(group)
            //
            // console.log('friends', Arena.myCreeps.length)
            // console.log('enemies', Arena.enemyCreeps.length)
        }
    }
}

export default new Stats()
