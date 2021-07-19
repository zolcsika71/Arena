'use strict';

import {getRange} from '/game/utils';

import Arena from '../getArena.mjs';
import Group from '../group.mjs';
import Util from '../utils/utils.mjs';

import AttackAction from '../actions/attack.mjs';
import HealAction from '../actions/heal.mjs';
import LastStandAction from '../actions/lastStand.mjs';
import MovementAction from '../actions/movement.mjs';
import MoveToGoalAction from '../actions/moveToGoal.mjs';
import StayOutOfHarmAction from '../actions/stayOutOfHarm.mjs';
import utils from '../utils/utils.mjs';


class CaptureTheFlagBasic {

	static DELAY = 150


	constructor() {
		this.attackers = [];
		this.defenders = [];
		this.capturePoints = []
	};

	get className() {
		return 'CTF_Basic';
	}

	get currentCapturePoint() {
		return this.capturePoints[0]
	}

	logCreeps(creeps) {

		let melee = 0, ranged = 0, healer = 0;

		for (const creep of creeps) {
			console.log(`Creep: ${creep.id}`);
			if (creep.isMelee) {
				melee += 1;
				console.log(`melee ${Util.json(creep.bodyParts)}`);
			} else if (creep.isRanged) {
				ranged += 1;
				console.log(`ranged: ${Util.json(creep.bodyParts)}`);
			} else if (creep.isHealer) {
				console.log(`healer: ${Util.json(creep.bodyParts)}`);
				healer += 1;
			} else
				console.log(`Unknown creep type`);
		}


		console.log(`melee: ${melee}`);
		console.log(`ranged: ${ranged}`);
		console.log(`healer: ${healer}`);



	}

	findTarget(group) {

		if (group.leader === null)
			return null

		const position = group.leader
		const alertRange = this.alertRange(group)
		const enemies = Arena.enemyCreeps
		.filter(i => i.inRangeTo(position, alertRange))
		.sort((a, b) => a.hits === b.hits ? getRange(a, position) - getRange(b, position) : a.hits - b.hits)

		if (enemies.length === 0)
			return null

		return enemies[0]
	}

	targetDefinition(group) {
		const attackTarget = this.findTarget(group)
		const healTarget = group.wounded[0]

		return {
			'Melee': attackTarget,
			'Ranged': attackTarget,
			'Healer': healTarget,
		}
	}

	goalDefinition(group) {
		const name = group.name
		let goalDefinition

		if (name === 'Defender-1') {
			goalDefinition = {
				'Melee': Arena.myFlag,
				'Ranged': Arena.myFlag,
			}
		}

		if (name === 'Attacker-1' || name === 'Attacker-2' || name === 'Attacker-3') {
				goalDefinition = {
					'Melee': this.currentCapturePoint,
					'Ranged': this.currentCapturePoint,
					'Healer': this.currentCapturePoint,
				}
		}

		return goalDefinition
	}

	alertRange(group) {
		const name = group.name
		let alertRange

		if (name === 'Defender-1') {
			alertRange = 10
		} else if (name === 'Attacker-1' || name === 'Attacker-2' || name === 'Attacker-3') {
			alertRange = Arena.time <= CaptureTheFlagBasic.DELAY ? 10 : 20
		}

		return alertRange
	}

	initGroups() {
		let attackers = ['Attacker-1', 'Attacker-2', 'Attacker-3'],
			defenders = ['Defender-1'];

		let attack_collection = {
				leader: 'Ranged',
				members: {
					ranged: 2,
					healer: 2,
				},
			},
			defend_collection = {
				leader: 'Melee',
				members: {
					melee: 2,
				},
			};

		this.attackers = [];
		for (const team of attackers)
			this.attackers.push(new Group(team, attack_collection));

		this.defenders = [];
		for (const team of defenders)
			this.defenders.push(new Group(team, defend_collection));

		console.log(`CTF_defenders: ${this.defenders.length}`)
		console.log(`CTF_attackers: ${this.attackers.length}`)
	}

	initCreeps() {
		for (const creep of Arena.myCreeps) {

			let actions;

			if (creep.isMelee) {
				creep.role = 'Melee';
				creep.memory = {}
				for (const group of this.defenders) {
					if (group.add(creep))
						break;
				}

				actions = [
					new AttackAction(creep),
					new MovementAction(creep),
					new LastStandAction(creep),
				];

			}

			if (creep.isRanged) {
				creep.role = 'Ranged';
				creep.memory = {}
				for (const group of this.attackers) {
					if (group.add(creep))
						break;
				}

				actions = [
					new AttackAction(creep),
					new MoveToGoalAction(creep),
					new StayOutOfHarmAction(creep),
				];

			}

			if (creep.isHealer) {
				creep.role = 'Healer';
				creep.memory = {}
				for (const group of this.attackers) {
					if (group.add(creep))
						break;
				}

				actions = [
					new HealAction(creep),
					new MovementAction(creep),
					new StayOutOfHarmAction(creep),
				];
			}

			creep.start(actions);
		}
	}

	start() {

		this.capturePoints = [

			Arena.bridges[_.random(Arena.bridges.length - 1)],
			Arena.enemyFlag,
		]

		console.log('Current Capture Point:\n', this.currentCapturePoint.toString())

		this.initGroups()
		this.initCreeps()

		Arena.myTower.start()

	}

	updateGroups(group) {

		if (group.name === 'Attacker-1'
			|| group.name === 'Attacker-2'
			|| group.name === 'Attacker-3') {

			if (group.positionReached(this.currentCapturePoint)) {
				this.capturePoints.shift();
				console.log('Current Capture Point', this.currentCapturePoint)
			}
		}

		group.alertRange = this.alertRange(group)
		group.targetDefinition = this.targetDefinition(group)
		group.goalDefinition = this.goalDefinition(group)

		group.update()
	}

	cleanGroups(array) {
		return _.filter(array, group => group.leader !== null)
	}


	update() {

		let group = this.defenders[0]
		let creep = group.members[0]

		console.log(`creep: ${creep.id}`)
		console.log(`travelMemory: ${utils.json(creep.memory._travel)}`)
		console.log(`destination: ${Arena.myFlag.x} ${Arena.myFlag.y}`)

		let ret = creep.travelTo(Arena.myFlag)

		console.log(`ret: ${ret}`)

		// this.attackers = this.cleanGroups(this.attackers)
		// this.defenders = this.cleanGroups(this.defenders)
		//
		// console.log(`CTF_Basic_UPDATE`);
		// // console.log(`CTF_defenders: ${this.defenders.length}`)
		// // console.log(`CTF_attackers: ${this.attackers.length}`)
		//
		// for (const group of this.attackers)
		// 	this.updateGroups(group)
		//
		// for (const group of this.defenders)
		// 	this.updateGroups(group)
		//
		// const tower = Arena.myTower
		// if (tower)
		// 	tower.update()
	}
}

export default CaptureTheFlagBasic;
