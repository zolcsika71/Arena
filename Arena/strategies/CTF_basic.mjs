'use strict';

import Group from '../group.mjs';
import CapturePoint from '../CapturePoints.mjs';

import AttackAction from '../actions/attack.mjs';
import HealAction from '../actions/heal.mjs';
import LastStandAction from '../actions/lastStand.mjs';
import MovementAction from '../actions/movement.mjs';
import MoveToGoalAction from '../actions/moveToGoal.mjs';
import StayOutOfHarmAction from '../actions/stayOutOfHarm.mjs';
import IdleAction from '../actions/idle.mjs';

class CaptureTheFlagBasic {

	static DELAY = 0;

	constructor() {
		this.groups = {
			attackers: ['Attacker_1', 'Attacker_2', 'Attacker_3'],
			defenders: ['Defender_1'],
		};
		this.collections = {
			attackers: {
				leader: 'Ranged',
				members: {
					ranged: 2,
					healer: 2,
				},
			},
			defenders: {
				leader: 'Melee',
				members: {
					melee: 2,
				},
			},
		};
		this.attackers = [];
		this.defenders = [];
		this.capturePoints = [];
	};

	get className() {
		return 'CTF_Basic';
	}

	get currentCapturePoint() {

		const capturePoint = this.capturePoints[0];

		if (Arena.time > 1) {
			// console.log(`capturePoint: ${capturePoint.x} ${capturePoint.y}`);

			// let neighbours = capturePoint.position.getAdjacentCells();
			// 	let message = []
			// 	let costColor
			//
			// 	for (const neighbour of neighbours) {
			// 		if (neighbour.cost > 1)
			// 			costColor = 'red'
			// 		else
			// 			costColor = 'white'
			//
			// 		message.push(
			// 			{
			// 			text: `${neighbour.toString()}`,
			// 			style: ['yellow']
			// 			},
			// 			{
			// 				text: `cost: ${neighbour.cost}`,
			// 				style: [costColor]
			// 			}
			// 		)
			//
			// 		Util.log(`neighbour:`, message)
			//
			// 		message = [];
			// 	}
			// }
			// for (const neighbour of neighbours)
			// 	console.log(`neighbour: ${red(neighbour.toString())}`)

			return capturePoint;


		}

	}

	findMeleeTarget(group) {

		if (group.leader === null)
			return null;

		const enemyCreeps = Arena.enemyCreeps;
		const position = group.leader;
		const alertRange = this.alertRange(group);
		const flag = Arena.myFlag;

		let targets = enemyCreeps
		.filter(i => i.inRangeTo(position, alertRange))
		.sort(Util.byRangeTo(flag));

		if (targets.length === 0)
			return null;

		return targets[0];
	}

	findRangedTarget(group) {

		const position = group.leader;
		const alertRange = this.alertRange(group);
		const targets = Arena.enemyCreeps
		.filter(i => i.inRangeTo(position, alertRange))
		.sort((a, b) => a.hits === b.hits ? Game.getRange(a, position) - Game.getRange(b, position) : a.hits - b.hits);

		if (targets.length === 0)
			return null;

		return targets[0];
	}

	targetDefinition(group) {
		const meleeTarget = this.findMeleeTarget(group);
		const rangedTarget = this.findRangedTarget(group);
		const healTarget = group.wounded[0];

		return {
			'Melee': meleeTarget,
			'Ranged': rangedTarget,
			'Healer': healTarget,
		};
	}

	goalDefinition(group) {
		const name = group.name;
		let goalDefinition = {};

		if (name === 'Defender_1') {
			goalDefinition = {
				'Melee': new CapturePoint(Util.getRoomPosition('myFlag', Arena.myFlag)),
				'Ranged': new CapturePoint(Util.getRoomPosition('myFlag', Arena.myFlag)),
			};
		}

		if (name === 'Attacker_1' || name === 'Attacker_2' || name === 'Attacker_3') {
			goalDefinition = {
				'Melee': this.currentCapturePoint,
				'Ranged': this.currentCapturePoint,
				'Healer': this.currentCapturePoint,
			};
		}

		return goalDefinition;

	}

	alertRange(group) {
		const name = group.name;
		let alertRange;

		if (name === 'Defender_1') {
			alertRange = 5;
		} else if (name === 'Attacker_1' || name === 'Attacker_2' || name === 'Attacker_3') {
			alertRange = Arena.time <= CaptureTheFlagBasic.DELAY ? 10 : 20;
		}

		return alertRange;
	}

	initGroups() {

		this.attackers = [];

		for (const team of this.groups.attackers)
			this.attackers.push(new Group(team, this.collections.attackers));

		this.defenders = [];

		for (const team of this.groups.defenders)
			this.defenders.push(new Group(team, this.collections.defenders));
	}

	initCreeps() {
		for (let creep of Arena.myCreeps) {

			let actions;

			if (creep.isMelee) {
				creep.role = 'Melee';
				// creep.travel = {};
				for (const group of this.defenders) {
					if (group.add(creep))
						break;
				}

				actions = [
					new AttackAction(creep),
					new MovementAction(creep),
					new LastStandAction(creep),
					new IdleAction(creep)
				];

			}

			if (creep.isRanged) {
				creep.role = 'Ranged';
				// creep.travel = {};
				for (const group of this.attackers) {
					if (group.add(creep))
						break;
				}

				actions = [
					new AttackAction(creep),
					new MovementAction(creep),
					// new MoveToGoalAction(creep),
					new StayOutOfHarmAction(creep),
					new IdleAction(creep)
				];

			}

			if (creep.isHealer) {
				creep.role = 'Healer';
				// creep.travel = {};
				for (const group of this.attackers) {
					if (group.add(creep))
						break;
				}

				actions = [
					new HealAction(creep),
					new MovementAction(creep),
					new StayOutOfHarmAction(creep),
					new IdleAction(creep)
				];
			}

			creep.start(actions);
		}
	}

	start() {

		this.capturePoints = [

			new CapturePoint(Arena.bridges[_.random(Arena.bridges.length - 1)]),
			new CapturePoint(Util.getRoomPosition('enemyFlag', Arena.enemyFlag)),

			// myArena.bridges[_.random(myArena.bridges.length - 1)],
			// utils.getRoomPosition('enemyFlag', myArena.enemyFlag),
		];

		this.initGroups();
		this.initCreeps();

		Arena.myTower.start();

	}

	update() {

		this.attackers = this.cleanGroups(this.attackers);
		this.defenders = this.cleanGroups(this.defenders);

		for (const group of this.attackers)
			this.updateGroups(group);

		for (const group of this.defenders)
			this.updateGroups(group);

		const tower = Arena.myTower;
		if (tower)
			tower.update();
	}

	cleanGroups(array) {
		return _.filter(array, group => group.leader !== null);
	}

	updateGroups(group) {

		group.alertRange = this.alertRange(group);
		group.targetDefinition = this.targetDefinition(group);
		group.goalDefinition = this.goalDefinition(group);

		if (group.positionReached(this.currentCapturePoint.position)) {
			console.log(`Current Capture Point Reached: ${this.currentCapturePoint.position.toString()}`);
			if (this.capturePoints.length > 1)
				this.capturePoints.shift();
			else
				console.log(`last capture point reached`);
		}


		// console.log(`goal_0: ${utils.json(group.goalDefinition)}`)

		group.update();
	}
}

export default CaptureTheFlagBasic;
