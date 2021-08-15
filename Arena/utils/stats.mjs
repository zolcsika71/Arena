'use strict'




import {yellow} from './color.mjs';

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

    displayTravelData(group) {
        const members = group.members;
        const leader = group.leader;

        if (members.length > 0) {
            for (const creep of members) {
                let travelData = creep.travel;
                let options = travelData.searchPath.options;

                if(travelData.searchPath.incomplete) {
                    console.log(`${red('TRAVELLER:')} [${yellow(creep.id)}] incomplete path for ${creep.toString()}`);
                    console.log(`${red('TRAVELLER:')} [${yellow(creep.id)}] destination: ${travelData.destination.toString()}`);
                    // console.log(`path: ${Util.json(travelData.path)}`);

                }

                console.log(`${cyan(`TRAVELLER:`)} [${yellow(creep.id)}]`);

                console.log(`   creep: ${creep.toString()}`);
                if (creep.goal)
                    console.log(`   creepGoal: ${creep.goal.toString()}`);
                else
                    console.log(`   creepGoal: undefined`);

                console.log(`   leader: ${leader.toString()}`);
                if (leader.goal)
                    console.log(`   leaderGoal: ${leader.goal.toString()}`);
                else
                    console.log(`   leaderGoal: undefined`);

                console.log(`   path: ${Util.json(creep.travel.path)}`);
                console.log(`   lastPos: ${travelData.state.lastPos}`);
                console.log(`   nextPos: ${travelData.state.nextPos}`);
                console.log(`   move: ${Util.translateErrorCode(travelData.searchPath.move)}`);
                console.log(`   ignoreCreeps: ${options.ignoreCreeps} range: ${options.range}`);
            }
        }
        else
            console.log(`${group.name} is empty`)

    }

    displayGroups(group) {
        const members = group.members
        if (members.length > 0) {
            console.log(`group: ${group.name} leader: [${group.leader.id}, ${group.leader.role}] members: ${members.length}`)
            for (const creep of members) {
                console.log(`creepId: ${creep.id} role: ${creep.role}`)
                console.log(`goal: ${creep.goal}`);
                console.log(`target: ${creep.target}`);
                console.log(`executedActions: ${creep.executedActions.name}`);
                console.log(`fatigue: ${creep.fatigue}`);
                console.log(`travelData: ${Util.json(creep.travel)}`)
            }
        }
        else
            console.log(`${group.name} is empty`)
    }

    update() {

        if(this.timeForOutput) {

            // console.log(`tick: ${Game.getTicks()}`)

            // console.log(`Current Capture Point: ${Strategy.currentCapturePoint.position.toString()}`)

            // this.displayGroups(Strategy.attackers[0])

            this.displayTravelData(Strategy.attackers[2])

            // for (const group of Strategy.attackers)
            //     this.displayGroups(group)
            //
            // for (const group of Strategy.defenders)
            //     this.displayGroups(group)

            // console.log('friends', Arena.myCreeps.length)
            // console.log('enemies', Arena.enemyCreeps.length)
        }
    }
}

export default new Stats()
