'use strict'

import Arena from '../getArena.mjs'


class Stats {

    get refreshTime() {
        return 1
    }

    get timeForOutput() {
        return Arena.time % this.refreshTime === 0
    }

    start() {
        console.log(`first tick:`)
        // console.log(`CCP: ${utils.json(Strategy.currentCapturePoint)}`)
        // console.log(`Current Capture Point: ${Strategy.currentCapturePoint.position.toString()}`)
        // console.log(`myArena: ${Strategy.className}`)
        // console.log(`attackers: ${Strategy.attackers.length}`)
        // console.log(`defenders: ${Strategy.defenders.length}`)
    }

    displayGroups(group) {
        const members = group.members
        if (members.length > 0) {
            console.log(`group: ${group.name} leader: [${group.leader.id}, ${group.leader.role}] members: ${members.length}`)
            for (const creep of members) {
                console.log(`creepId: ${creep.id} role: ${creep.role}`)
                console.log(`travelData: ${Util.json(creep.travel)}`)
            }
        }
        else
            console.log(`${group.name} is empty`)
    }

    update() {

        if(this.timeForOutput) {

            console.log(`tick: ${Game.getTicks()}`)

            console.log(`Current Capture Point: ${Strategy.currentCapturePoint.position.toString()}`)

            // for (const group of Strategy.attackers)
            //     this.displayGroups(group)
            //
            // for (const group of Strategy.defenders)
            //     this.displayGroups(group)

            console.log('friends', Arena.myCreeps.length)
            console.log('enemies', Arena.enemyCreeps.length)
        }
    }
}

export default new Stats()
