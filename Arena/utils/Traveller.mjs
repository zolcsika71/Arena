'use strict';

import RoomPosition from '../roomPosition.mjs';
import {yellow} from './color.mjs';

const DEFAULT_MAXOPS = 50000;
const DEFAULT_STUCK_VALUE = 2;
// const STATE_PREV_X = 0;
// const STATE_PREV_Y = 1;
// const STATE_NEXT_X = 2;
// const STATE_NEXT_Y = 3;
// const STATE_STUCK = 4;
// const STATE_DEST_X = 5;
// const STATE_DEST_Y = 6;

class Traveller {

	static travelTo(creep, destination, options = {}) {

		_.defaults(options, {
			maxOps: DEFAULT_MAXOPS,
			ignoreRoads: false,
			ignoreCreeps: true,
			offRoad: false,
			stuckValue: DEFAULT_STUCK_VALUE,
			ignoreStructures: false,
			range: 1,
			obstacles: [],
			getMatrix: false,
			movingTarget: false,
			rePath: false,
			reversePath: false,
			freshMatrix: false,
		});

		// if (options.getMatrix)
		// 	return Traveller.findTravelPath(origin, destination, options);

		if (!destination)
			return Game.ERR_INVALID_ARGS;

		destination = Util.getRoomPosition('destination', destination);

		let rangeToDestination = Game.getRange(creep, destination);

		// made it in creep.start()
		// initialize data object
		// if (!creep.travel) {
		// 	creep.travel = {
		// 		path: '',
		// 		reversePath: '',
		// 		destination: undefined,
		// 		state: {
		// 			tick: 0,
		// 			stuckCount: 0,
		// 			lastPos: undefined,
		// 			nextPos: undefined,
		// 		},
		// 		searchPath: {
		// 			ops: undefined,
		// 			cost: undefined,
		// 			incomplete: undefined,
		// 			move: undefined,
		// 			options: undefined,
		// 		},
		// 	};
		// }

		let travelData = creep.travel;
		travelData.searchPath.options = options;
		// travelData.destination = destination;
		travelData.state.lastPos = creep;
		travelData.state.tick = Arena.time;

		if (creep.fatigue > 0) {
			travelData.state.tick = Arena.time;
			return Game.ERR_TIRED;
		}

		// manage case where creep is nearby destination
		if (rangeToDestination <= options.range)
			return Game.OK;
		else if (rangeToDestination <= 1) {
			if (rangeToDestination === 1 && !options.range) {

				let direction = creep.pos.getDirectionTo(destination);
				travelData.path += direction;

				let ret = creep.move(direction);
				travelData.searchPath.move = ret;

				// destination.getCellMatrix();
				// console.log(`creep: ${creep.id} destination: ${destination.x}, ${destination.y} destinationCost: ${destination.cost} optionsRange: ${options.range}`);

				// if (creep.id === '10')
				// 	console.log(`destination to 1:  ${destination.x}, ${destination.y}`);



				// console.log(`creep: ${creep.id} : ${travelData.state.nextPos.x}, ${travelData.state.nextPos.y} optionsRange: ${options.range}`);


				// if (destination.cost < 255)
				// 	travelData.state.nextPos = destination;
				// else
				// 	travelData.state.nextPos = creep;

				return ret;

			}
			return Game.OK;
		}


		travelData.destination = destination;

		if (this.isStuck(creep, travelData))
			travelData.state.stuckCount++;
		else {
			travelData.state.stuckCount = 0;
			// travelData.state.lastPos = creep;
		}

		if (travelData.state.stuckCount >= options.stuckValue && Math.random() > .5) {
			options.ignoreCreeps = false;
			options.freshMatrix = true;
			delete travelData.path;
		}

		// delete path cache if destination is different
		if (!Util.sameCoord(travelData.destination, destination)) {
			if (options.movingTarget && travelData.destination.isNearTo(destination)) {
				travelData.path += travelData.destination.getDirectionTo(destination);
				travelData.destination = destination;
			} else
				delete travelData.path;
		}

		if (options.rePath && Math.random() < options.rePath) {
			// add some chance that you will find a new path randomly
			delete travelData.path;
		}

		// pathfinding
		let newPath = false;
		if (!travelData.path) {
			newPath = true;

			if (creep.spawning)
				return Game.ERR_BUSY;

			travelData.destination = destination;

			let ret = this.findTravelPath(creep, destination, options);

			// console.log(`path: ${utils.json(ret)}`)

			// if (ret.incomplete && creep.group.name === 'Attacker_3') {
			// 	// uncommenting this is a great way to diagnose creep behavior issues
			// 	console.log(`${red('TRAVELER:')} [${yellow(creep.id)}] incomplete path for ${creep.toString()}`);
			// 	console.log(`${red('TRAVELER:')} [${yellow(creep.id)}] target: ${destination.toString()}`);
			// 	console.log(`path: ${Util.json(ret.path)}`);
			// 	console.log(`ignoreCreeps: ${options.ignoreCreeps} range: ${options.range}`);
			// }

			travelData.path = Traveller.serializePath(creep.pos, ret.path);


			if (options.reversePath && !travelData.reversePath)
				travelData.reversePath = this.reversePath(travelData.path);

			travelData.searchPath.ops = ret.ops;
			travelData.searchPath.cost = ret.cost;
			travelData.searchPath.incomplete = ret.incomplete;


			travelData.stuckCount = 0;
		}

		// this.serializeState(creep, destination, state, travelData);

		if (!travelData.path || travelData.path.length === 0)
			return Game.ERR_NO_PATH;

		// TODO move already done, nextPos path wrong
		if (travelData.stuckCount === 0 && !newPath)
			travelData.path = travelData.path.substr(1);

		let nextDirection = parseInt(travelData.path[0], 10);
		let nextPos = Traveller.positionAtDirection(creep, nextDirection);


		let ret = creep.move(nextDirection);
		travelData.searchPath.move = ret;

		// if (creep.id === '10')
		// 	console.log(`destination to more:  ${nextPos.x}, ${nextPos.y}`);


		// travelData.state.nextPos = this.getNextPos(travelData, creep, nextPos);
		// console.log(`RANGE more than 1`);
		// console.log(`creep: ${creep.getId} pos: ${travelData.state.nextPos}\n`);


		// if (destination.cost < 255)
		// 	travelData.state.nextPos = destination;
		// else
		// 	travelData.state.nextPos = creep;

		return ret;
	}

	// static getNextPos(travelData, creep, destination) {
	// 	let creepStandsOn;
	// 	if (creep.getId === 1) {
	// 		// console.log(`First creep nextPos`);
	// 		creepStandsOn = _.filter(Arena.myCreeps, currentCreep => {
	// 			return Util.sameCoord(currentCreep, destination) && currentCreep.getId !== 1;
	// 		}).length;
	// 	} else {
	// 		console.log(`${creep.getId}. creep nextPos`);
	// 		creepStandsOn = _.filter(Arena.myCreeps, currentCreep => {
	// 			// console.log(`creepId, ${creep.getId} currentId: ${currentCreep.getId}`);
	// 			return currentCreep.getId < creep.getId
	// 				// && (Util.sameCoord(currentCreep, destination)
	// 				&& Util.sameCoord(currentCreep.travel.state.nextPos || currentCreep.pos, destination);
	//
	// 		}).length;
	// 	}
	//
	// 	if (creepStandsOn === 0)
	// 		return destination;
	// 	else
	// 		return creep.pos;
	//
	// }

	// static getNextPos(travelData, creep, destination) {
	// 	// TODO examine travelData.state.nextPos = {};
	// 	// travelData.state.nextPos = {};
	// 	let myCreepNextDestination;
	// 	for (const myCreep of Arena.myCreeps) {
	// 		if (myCreep.getId < creep.getId) {
	// 			if (myCreep.goal)
	// 				myCreepNextDestination = this.positionAtDirection(myCreep.pos, myCreep.travel.path[0])
	//
	// 			if (myCreepNextDestination && Util.sameCoord(myCreepNextDestination, destination)) {
	// 				travelData.state.nextPos = creep.pos;
	// 				break;
	// 			}
	// 		}
	// 	}
	// 	if (!travelData.state.nextPos)
	// 		travelData.state.nextPos = destination;
	//
	// 	if (creep.id === '10') {
	// 		// console.log(`creep.id: ${yellow(creep.getId)} myCreep.id: ${yellow(myCreep.getId)}`);
	// 		// console.log(`myCreepGoal: ${myCreep.getId} ${myCreep.goal}, destination: ${destination}`);
	// 		console.log(`CreepGoal: ${creep.getId} ${creep.goal}, destination: ${destination}`);
	// 		console.log(`travelData.nextPos: ${travelData.state.nextPos}`);
	// 	}
	// }

	static reversePath(path) {
		let reversePath = '';
		path = path.reverse();
		let reverseDirection = {
			1: Game.BOTTOM,
			2: Game.BOTTOM_LEFT,
			3: Game.LEFT,
			4: Game.TOP_LEFT,
			5: Game.TOP,
			6: Game.TOP_RIGHT,
			7: Game.RIGHT,
			8: Game.BOTTOM_RIGHT,
		};

		for (const direction of path)
			reversePath += reverseDirection[direction];

		return reversePath;

	}

	static callback = (options = {}) => {

		let matrix;

		if (options.ignoreStructures) {
			matrix = new Game.CostMatrix();
			if (!options.ignoreCreeps) {
				Traveller.addCreepsToMatrix(matrix);
			}
		} else if (options.ignoreCreeps) {
			matrix = Traveller.getStructureMatrix(options.freshMatrix);
		} else {
			matrix = Traveller.getCreepMatrix();
		}
		if (options.obstacles) {
			matrix = matrix.clone();
			for (let obstacle of options.obstacles) {
				matrix.set(obstacle.pos.x, obstacle.pos.y, 0xff);
			}
		}

		if (options.getMatrix) {
			if (!matrix) {
				matrix = new Game.CostMatrix();
			}
			let outcome = matrix.clone(); // TODO is it necessary?
			outcome = Traveller.getMapMatrix(outcome);
			return outcome;

		}
		return matrix;
	};

	static findTravelPath(origin, destination, options = {}) {

		if (options.movingTarget)
			options.range = 0;

		return Game.searchPath(origin, destination, {
			maxOps: options.maxOps,
			plainCost: options.offRoad ? 1 : options.ignoreRoads ? 1 : 2,
			swampCost: options.offRoad ? 1 : options.ignoreRoads ? 5 : 10,
			range: options.range,
			costMatrix: Traveller.callback(options),
		});
	}

	static getStructureMatrix(freshMatrix) {
		if (!this.structureMatrixCache || (freshMatrix && Game.getTicks() !== this.structureMatrixTick)) {
			this.structureMatrixTick = Game.getTicks();
			let matrix = new Game.CostMatrix();
			this.structureMatrixCache = Traveller.addStructuresToMatrix(matrix, 1);
		}
		return this.structureMatrixCache;
	}

	static getCreepMatrix() {
		if (!this.creepMatrixCache || Game.getTicks() !== this.creepMatrixTick) {
			this.creepMatrixTick = Game.getTicks();
			this.creepMatrixCache = Traveller.addCreepsToMatrix(this.getStructureMatrix(true).clone());

		}
		return this.creepMatrixCache;
	}

	static getMapMatrix(matrix) {
		if (!this.mapMatrixCache)
			this.mapMatrixCache = Traveller.addMapToMatrix(matrix);

		return this.mapMatrixCache;
	}

	static addMapToMatrix(matrix) {
		matrix = matrix.clone();
		for (let y = 0; y < 100; y++) {
			for (let x = 0; x < 100; x++) {
				if (matrix.get(x, y) !== 0)
					continue;
				let tile = Game.getTerrainAt({x: x, y: y});
				let weight =
					tile === Game.TERRAIN_WALL ? 255 : tile === Game.TERRAIN_SWAMP ? 5 : 1;
				matrix.set(x, y, weight);
			}
		}

		return matrix;

	}

	static addStructuresToMatrix(matrix, roadCost) {
		let impassibleStructures = [];
		let structures = Game.getObjectsByPrototype(Game.Structure);
		for (let structure of structures) {
			if (structure instanceof Game.StructureRampart) {
				if (!structure.my)
					impassibleStructures.push(structure);
			} else if (structure instanceof Game.StructureRoad) {
				matrix.set(structure.x, structure.y, roadCost);
			} else if (structure instanceof Game.StructureContainer) {
				matrix.set(structure.x, structure.y, 5);
			} else {
				impassibleStructures.push(structure);
			}
		}

		let myConstructionSites = Game.getAll('ConstructionSite');

		for (let site of myConstructionSites) {
			if (site.structure === Game.StructureContainer || site.structure === Game.StructureRoad
				|| site.structure === Game.StructureRampart) {
				continue;
			}
			matrix.set(site.x, site.y, 0xff);
		}
		for (let structure of impassibleStructures) {
			matrix.set(structure.x, structure.y, 0xff);
		}
		return matrix;
	}

	static addCreepsToMatrix(matrix) {
		Arena.creeps.forEach((creep) => matrix.set(creep.x, creep.y, 0xff));
		return matrix;
	}

	static serializePath(startPos, path) {
		let serializedPath = '';
		let lastPosition = Util.getRoomPosition('startPos', startPos);
		for (let position of path) {
			serializedPath += lastPosition.getDirectionTo(position);
			lastPosition = Util.getRoomPosition('position', position);
		}
		return serializedPath;
	}

	static positionAtDirection(origin, direction) {
		let offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
		let offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
		let x = origin.x + offsetX[direction];
		let y = origin.y + offsetY[direction];
		if (x > 98 || x < 1 || y > 98 || y < 1) {
			return Arena.myCornerPosition;
		}
		return new RoomPosition(`direction: ${Util.directionToString(direction)}`, {x: x, y: y});
	}

	// static deserializeState(travelData, destination) {
	// 	let state = {};
	// 	if (travelData.state) {
	// 		state.lastPos = {
	// 			x: travelData.state[STATE_PREV_X],
	// 			y: travelData.state[STATE_PREV_Y]
	// 		};
	// 		// state.nextCoord = {
	// 		// x: travelData.state[STATE_NEXT_X],
	// 		// y: travelData.state[STATE_NEXT_Y]
	// 		// };
	// 		state.stuckCount = travelData.state[STATE_STUCK];
	// 		state.destination = new RoomPosition('destination',
	// 			{
	// 				x: travelData.state[STATE_DEST_X],
	// 				y: travelData.state[STATE_DEST_Y],
	// 			},
	// 		);
	// 	} else {
	// 		state.destination = destination;
	// 	}
	// 	return state;
	// }
	//
	// static serializeState(creep, destination, state, travelData) {
	// 	travelData.state = [creep.x, creep.y, state.stuckCount, destination.x, destination.y];
	// }

	static isStuck(creep, travelData) {
		let stuck = false;
		if (!_.isUndefined(travelData.state.lastPos)) {
			if (Util.sameCoord(creep, travelData.state.lastPos)) {
				// didn't move
				stuck = true;
			}
		}
		return stuck;
	}

	static posToMatrixKey(pos) {
		let x = pos.x,
			y = pos.y;
		return y * 100 + x;
	}

}


Game.Creep.prototype.travelTo = function (destination, options) {
	return Traveller.travelTo(this, destination, options);
};

Game.Creep.prototype.positionAtDirection = function (direction) {
	return Traveller.positionAtDirection(this, direction)
}


RoomPosition.prototype.getCellMatrix = function () {

	const costMatrix = Traveller.callback({getMatrix: true, ignoreCreeps: false});
	console.log(`pos: ${this.x}, ${this.y} key: ${Traveller.posToMatrixKey(this.pos)}`);
	this.cost = costMatrix['_bits'][Traveller.posToMatrixKey(this.pos)];

	// return cells;
};

export default new Traveller();
