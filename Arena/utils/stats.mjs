'use strict'

import Arena from '../getArena.mjs'
import utils from './utils.mjs'
import RoomPosition from '../roomPosition.mjs';

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
        console.log(`Current Capture Point: ${Strategy.currentCapturePoint.position.toString()}`)
        console.log(`Arena: ${Strategy.className}`)
        console.log(`attackers: ${Strategy.attackers.length}`)
        console.log(`defenders: ${Strategy.defenders.length}`)
    }

    displayGroups(group) {
        // console.log(`CCP: ${utils.json(Strategy.currentCapturePoint)}`)
        console.log(`Current Capture Point: ${Strategy.currentCapturePoint.position.toString()}`)
        const members = group.members
        if (members.length > 0) {
            console.log(`group: ${group.name} leader: [${group.leader.id}, ${group.leader.role}] members: ${members.length}`)
            for (const creep of members) {
                console.log(`creepId: ${creep.id} role: ${creep.role}`)
                console.log(`travelData: ${utils.json(creep.travel)}`)
            }
        }
        else
            console.log(`${group.name} is empty`)
    }

    update() {

        if(this.timeForOutput) {

            for (const group of Strategy.attackers)
                this.displayGroups(group)

            for (const group of Strategy.defenders)
                this.displayGroups(group)

            console.log('friends', Arena.myCreeps.length)
            console.log('enemies', Arena.enemyCreeps.length)
        }
    }
}

export default new Stats()
