'use strict';

import RoomPosition from '../roomPosition.mjs';
import Arena from '../getArena.mjs';


import {CostMatrix, searchPath} from '/game/path-finder';
import {getObjectsByPrototype, getTerrainAt} from '/game/utils';
import {ERR_BUSY, ERR_INVALID_ARGS, ERR_NO_PATH, ERR_TIRED, OK, TERRAIN_WALL, TERRAIN_SWAMP} from '/game/constants';
import {ConstructionSite, Creep, Structure, StructureContainer, StructureRampart, StructureRoad} from '/game/prototypes';

const DEFAULT_MAXOPS = 50000;
const DEFAULT_STUCK_VALUE = 2;
const STATE_PREV_X = 0;
const STATE_PREV_Y = 1;
const STATE_STUCK = 2;
const STATE_DEST_X = 3;
const STATE_DEST_Y = 4;

class Traveller {

	static travelTo(creep, destination, options = {}) {

		_.defaults(options = {
			maxOps: DEFAULT_MAXOPS,
			ignoreRoads: false,
			ignoreCreeps: true,
			offRoad: false,
			stuckValue: 2,
			ignoreStructures: false,
			range: 1,
			obstacles: [],
			getMatrix: false,
			returnData: {},
			movingTarget: false,
			rePath: false,
			travelData: [],
			freshMatrix: false
		});

		if (options.getMatrix)
			return Traveller.findTravelPath(origin, destination, options)

		if (!destination)
			return ERR_INVALID_ARGS;

		if (creep.fatigue > 0)
			return ERR_TIRED;

		// if (this.sameCoord(creep, destination))
		// 	return OK;
		destination = Util.getRoomPosition('destination', destination)
		let rangeToDestination = creep.getRangeTo(destination);

		if (options.range && rangeToDestination <= options.range)
			return OK;
		else if (rangeToDestination <= 1) {
			if (rangeToDestination === 1 && !options.range) {
				let direction = creep.position.getDirectionTo(destination);
				if (options.returnData) {
					options.returnData.nextPos = destination;
					options.returnData.path = direction.toString();
				}

				return creep.move(direction);
			}
			return OK;
		}
		// initialize data object
		if (!creep.travel)
			creep.travel = {};

		let travelData = creep.travel;

		let state = this.deserializeState(travelData, destination);

		if (this.isStuck(creep, state))
			state.stuckCount++;
		else
			state.stuckCount = 0;

		// handle case where creep is stuck
		if (!options.stuckValue) {
			options.stuckValue = DEFAULT_STUCK_VALUE;
		}

		if (state.stuckCount >= options.stuckValue && Math.random() > .5) {
			options.ignoreCreeps = false;
			options.freshMatrix = true;
			delete travelData.path;
		}

		// delete path cache if destination is different
		if (!this.sameCoord(state.destination, destination)) {
			if (options.movingTarget && state.destination.isNearTo(destination)) {
				travelData.path += state.destination.getDirectionTo(destination);
				state.destination = destination;
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
				return ERR_BUSY;
			state.destination = destination;

			let ret = this.findTravelPath(creep, destination, options);

			// console.log(`path: ${utils.json(ret)}`)

			if (ret.incomplete) {
				// uncommenting this is a great way to diagnose creep behavior issues
				console.log(`TRAVELER: incomplete path for Creep ${creep.id} target: ${creep.goal}`);
			}
			if (options.returnData) {
				options.returnData.pathfinderReturn = ret;
				options.returnData.costMatrix = ret.costMatrix
			}

			travelData.path = Traveller.serializePath(creep.position, ret.path);

			state.stuckCount = 0;
		}
		this.serializeState(creep, destination, state, travelData);

		if (!travelData.path || travelData.path.length === 0)
			return ERR_NO_PATH;

		if (state.stuckCount === 0 && !newPath)
			travelData.path = travelData.path.substr(1);

		let nextDirection = parseInt(travelData.path[0], 10);

		// console.log(`travelDataPath: ${travelData.path}`)
		// console.log(`nextDirection: ${nextDirection}`)

		if (options.returnData) {
			if (nextDirection) {
				let nextPos = Traveller.positionAtDirection(creep, nextDirection);
				if (nextPos) {
					options.returnData.nextPos = nextPos;
				}
			}
			options.returnData.state = state;
			options.returnData.path = travelData.path;
		}

		return creep.move(nextDirection);

	}

	static callback = (options = {}) => {

		let matrix;

		if (options.ignoreStructures) {
			matrix = new CostMatrix();
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
				console.log(`no MATRIX!!!`)
				matrix = new CostMatrix();
			}
			let outcome = matrix.clone();
			outcome = Traveller.getMapMatrix(outcome)
			return outcome;

		}
		return matrix;
	}

	static findTravelPath(origin, destination, options = {}) {
		_.defaults(options, {
			ignoreCreeps: true,
			maxOps: DEFAULT_MAXOPS,
			range: 1,
		});
		if (options.movingTarget) {
			options.range = 0;
		}

		return searchPath(origin, destination, {
			maxOps: options.maxOps,
			plainCost: options.offRoad ? 1 : options.ignoreRoads ? 1 : 2,
			swampCost: options.offRoad ? 1 : options.ignoreRoads ? 5 : 10,
			range: options.range,
			costMatrix: Traveller.callback(options)
		});
	}

	static getStructureMatrix(freshMatrix) {
		if (!this.structureMatrixCache || (freshMatrix && Arena.time !== this.structureMatrixTick)) {
			this.structureMatrixTick = Arena.time;
			let matrix = new CostMatrix();
			this.structureMatrixCache = Traveller.addStructuresToMatrix(matrix, 1);
		}
		return this.structureMatrixCache;
	}

	static getCreepMatrix() {
		if (!this.creepMatrixCache || Arena.time !== this.creepMatrixTick) {
			this.creepMatrixTick = Arena.time;
			this.creepMatrixCache = Traveller.addCreepsToMatrix(this.getStructureMatrix(true).clone());

		}
		return this.creepMatrixCache;
	}

	static getMapMatrix(matrix) {
		if (!this.mapMatrixCache)
			this.mapMatrixCache = Traveller.addMapToMatrix(matrix)

		return this.mapMatrixCache;
	}

	static addMapToMatrix(matrix) {
		matrix = matrix.clone()
		for(let y = 0; y < 100; y++) {
			for(let x = 0; x < 100; x++) {
				if (matrix.get(x, y) !== 0)
					continue;
				let tile = getTerrainAt({x: x, y: y});
				let weight =
					tile === TERRAIN_WALL ? 255 : tile === TERRAIN_SWAMP ? 5 : 1;
					matrix.set(x, y, weight);
			}
		}

		return matrix;

	}

	static addStructuresToMatrix(matrix, roadCost) {
		let impassibleStructures = [];
		let structures = getObjectsByPrototype(Structure);
		for (let structure of structures) {
			if (structure instanceof StructureRampart) {
				if (!structure.my)
					impassibleStructures.push(structure);
			} else if (structure instanceof StructureRoad) {
				matrix.set(structure.x, structure.y, roadCost);
			} else if (structure instanceof StructureContainer) {
				matrix.set(structure.x, structure.y, 5);
			} else {
				impassibleStructures.push(structure);
			}
		}

		let myConstructionSites = getObjectsByPrototype(ConstructionSite);

		for (let site of myConstructionSites) {
			if (site.structure === StructureContainer || site.structure === StructureRoad
				|| site.structureType === StructureRampart) {
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
		if (x > 99 || x < 0 || y > 99 || y < 0) {
			return;
		}
		return new RoomPosition(x, y, origin.roomName);
	}

	static deserializeState(travelData, destination) {
		let state = {};
		if (travelData.state) {
			state.lastCoord = {x: travelData.state[STATE_PREV_X], y: travelData.state[STATE_PREV_Y]};
			// state.cpu = travelData.state[STATE_CPU];
			state.stuckCount = travelData.state[STATE_STUCK];
			// console.log(`x: ${travelData.state[STATE_DEST_X]} y: ${travelData.state[STATE_DEST_Y]}`)
			state.destination = new RoomPosition('destination',
				{
					x: travelData.state[STATE_DEST_X],
					y: travelData.state[STATE_DEST_Y],
				},
			);
		} else {
			state.destination = destination;
		}
		return state;
	}

	static serializeState(creep, destination, state, travelData) {
		travelData.state = [creep.x, creep.y, state.stuckCount, destination.x, destination.y];
	}

	static sameCoord(pos1, pos2) {
		return pos1.x === pos2.x && pos1.y === pos2.y;
	}

	static isStuck(creep, state) {
		let stuck = false;
		if (state.lastCoord !== undefined) {
			if (this.sameCoord(creep, state.lastCoord)) {
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

// Traveller.structureMatrixCache = {};
// Traveller.creepMatrixCache = {};
// Traveller.mapMatrixCache = {};

Creep.prototype.travelTo = function (destination, options) {
	return Traveller.travelTo(this, destination, options);
};


RoomPosition.prototype.getAdjacentCells = function () {
	let cells = this.neighbours;
	const costMatrix = Traveller.callback({getMatrix: true})

	for (let cell of cells)
		cell.cost = costMatrix['_bits'][Traveller.posToMatrixKey(cell)];

	return cells;
};

export default new Traveller();
