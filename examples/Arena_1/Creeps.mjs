'use strict';

import {getObjectsByPrototype, getTicks} from '/game/utils';
import {Creep} from '/game/prototypes';
import {CARRY, WORK, ATTACK, RANGED_ATTACK, HEAL} from '/game/constants';

import Parameters from './parameters.mjs';
import {guid, json} from './utils.mjs';

import _ from './lib/lodash-es/lodash.js';


class myCreeps extends Creep {
	constructor() {
		super();
		this.ownedCreeps = [];
		this.bodyParts = [CARRY, WORK, ATTACK, RANGED_ATTACK, HEAL];
		this.hauler = [];
		this.worker = [];
		this.melee = [];
		this.ranger = [];
		this.healer = [];
	}

	getOwnedCreeps() {
		this.ownedCreeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
	}

	getMyCreeps() {
		console.log(`getMyCreeps is running`);

		this.getOwnedCreeps();

		_.filter(this.ownedCreeps, creep => {
			if (_.some(creep.body, body => body.type === ATTACK)) {
				creep.role = 'melee';
				creep.spawnTime = 10;
				creep.path = [];
				this.melee.push(creep);
			}
		});

		_.filter(this.ownedCreeps, creep => {
			if (_.some(creep.body, body => body.type === RANGED_ATTACK)) {
				creep.role = 'ranger';
				creep.spawnTime = 10;
				creep.path = [];
				this.ranger.push(creep);
			}
		});

		_.filter(this.ownedCreeps, creep => {
			if (_.some(creep.body, body => body.type === HEAL)) {
				creep.role = 'healer';
				creep.spawnTime = 10;
				creep.path = [];
				this.healer.push(creep);
			}
		});


	}
}


export {myCreeps};

