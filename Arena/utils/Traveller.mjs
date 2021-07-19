'use strict';

import RoomPosition from '../roomPosition.mjs';
import Arena from '../getArena.mjs';
import {searchPath} from '/game/path-finder';
import {CostMatrix} from '/game/path-finder';
import {getObjectsByPrototype} from '/game/utils';
import {Creep, Structure, StructureRampart,  StructureRoad, StructureContainer, ConstructionSite} from '/game/prototypes';
import utils from './utils.mjs';



const REPORT_CPU_THRESHOLD = 1000;
const DEFAULT_MAXOPS = 50000;
const DEFAULT_STUCK_VALUE = 2;
const STATE_PREV_X = 0;
const STATE_PREV_Y = 1;
const STATE_STUCK = 2;
// const STATE_CPU = 3;
const STATE_DEST_X = 4;
const STATE_DEST_Y = 5;
const STATE_DEST_ROOMNAME = 6;

class Traveller {


	static travelTo(creep, destination, options = {}) {
		if (!destination)
			return ERR_INVALID_ARGS;

		if (creep.fatigue > 0)
			return ERR_TIRED;

		let rangeToDestination = creep.getRangeTo(destination);
		console.log(`rangeToDestination: ${rangeToDestination}`)


		if (options.range && rangeToDestination <= options.range)
			return OK;

		else if (rangeToDestination <= 1) {
			if (rangeToDestination === 1 && !options.range) {
				let direction = creep.getDirectionTo(destination);
				if (options.returnData) {
					options.returnData.nextPos = destination;
					options.returnData.path = direction.toString();
				}
				return creep.move(direction);
			}
			return OK;
		}
		// initialize data object
		if (!creep.memory._travel)
			creep.memory._travel = {};

		let travelData = creep.memory._travel;
		let state = this.deserializeState(travelData, destination);

		// TODO destination wrong format
		console.log(`state: ${utils.json(state)}`)

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

		if (options.repath && Math.random() < options.repath) {
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
				console.log(`TRAVELER: incomplete path for ${creep.name}`);
				// color = "red";
			}
			if (options.returnData)
				options.returnData.pathfinderReturn = ret;
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

	static findTravelPath(origin, destination, options = {}) {
		_.defaults(options, {
			ignoreCreeps: true,
			maxOps: DEFAULT_MAXOPS,
			range: 1,
		});
		if (options.movingTarget) {
			options.range = 0;
		}

		let callback = () => {

			let matrix;

			if (options.ignoreStructures) {
				matrix = new CostMatrix();
				if (!options.ignoreCreeps) {
					Traveller.addCreepsToMatrix(matrix);
				}
			} else if (options.ignoreCreeps) {
				matrix = this.getStructureMatrix(options.freshMatrix);
			} else {
				matrix = this.getCreepMatrix();
			}
			if (options.obstacles) {
				matrix = matrix.clone();
				for (let obstacle of options.obstacles) {
					matrix.set(obstacle.pos.x, obstacle.pos.y, 0xff);
				}
			}

			if (options.roomCallback) {
				if (!matrix) {
					matrix = new CostMatrix();
				}
				let outcome = options.roomCallback(matrix.clone());
				if (outcome !== undefined) {
					return outcome;
				}
			}
			return matrix;
		};
		let ret = searchPath(origin, destination, {
			maxOps: options.maxOps,
			plainCost: options.offRoad ? 1 : options.ignoreRoads ? 1 : 2,
			swampCost: options.offRoad ? 1 : options.ignoreRoads ? 5 : 10,
			range: options.range,
			roomCallback: callback,
		});
		// if (ret.incomplete && options.ensurePath) {
		// 	if (options.useFindRoute === undefined) {
		// 		// handle case where pathfinder failed at a short distance due to not using findRoute
		// 		// can happen for situations where the creep would have to take an uncommonly indirect path
		// 		// options.allowedRooms and options.routeCallback can also be used to handle this situation
		// 		if (roomDistance <= 2) {
		// 			console.log(`TRAVELER: path failed without findroute, trying with options.useFindRoute = true`);
		// 			console.log(`from: ${origin}, destination: ${destination}`);
		// 			options.useFindRoute = true;
		// 			ret = this.findTravelPath(origin, destination, options);
		// 			console.log(`TRAVELER: second attempt was ${ret.incomplete ? 'not ' : ''}successful`);
		// 			return ret;
		// 		}
		// 		// TODO: handle case where a wall or some other obstacle is blocking the exit assumed by findRoute
		// 	} else {
		// 	}
		// }
		return ret;
	}

	static getStructureMatrix(freshMatrix) {
		if (!this.structureMatrixCache || (freshMatrix && Arena.time !== this.structureMatrixTick)) {
			this.structureMatrixTick = Arena.time;
			let matrix = new CostMatrix();
			this.structureMatrixCache = Traveller.addStructuresToMatrix(matrix, 1);
		}
		return this.structureMatrixCache;
	}

	static getCreepMatrix(room) {
		if (!this.creepMatrixCache || Arena.time !== this.creepMatrixTick) {
			this.creepMatrixTick = Arena.time;
			this.creepMatrixCache = Traveller.addCreepsToMatrix(this.getStructureMatrix(true).clone());
		}
		return this.creepMatrixCache;
	}

	static addStructuresToMatrix(matrix, roadCost) {
		let impassibleStructures = [];
		let structures = getObjectsByPrototype(Structure)
		for (let structure of structures) {
			if (structure instanceof StructureRampart) {
				if (!structure.my && !structure.isPublic) {
					impassibleStructures.push(structure);
				}
			}
			else if (structure instanceof StructureRoad) {
				matrix.set(structure.pos.x, structure.pos.y, roadCost);
			}
			else if (structure instanceof StructureContainer) {
				matrix.set(structure.pos.x, structure.pos.y, 5);
			}
			else {
				impassibleStructures.push(structure);
			}
		}

		let myConstructionSites = getObjectsByPrototype(ConstructionSite)

		for (let site of myConstructionSites) {
			if (site.structure === StructureContainer || site.structure === StructureRoad
				|| site.structureType === StructureRampart) {
				continue;
			}
			matrix.set(site.pos.x, site.pos.y, 0xff);
		}
		for (let structure of impassibleStructures) {
			matrix.set(structure.pos.x, structure.pos.y, 0xff);
		}
		return matrix;
	}

	static addCreepsToMatrix(matrix) {
		Arena.creeps.forEach((creep) => matrix.set(creep.pos.x, creep.pos.y, 0xff));
		return matrix;
	}

	static serializePath(startPos, path) {
		let serializedPath = '';
		let lastPosition = new RoomPosition('startPos', startPos.x, startPos.y);
		// this.circle(startPos, color);
		for (let position of path) {
			// console.log(`position${path}`)
			serializedPath += lastPosition.getDirectionTo(position);
			lastPosition = new RoomPosition('position', position.x, position.y);
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
			// TODO name is important?
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

}

Traveller.structureMatrixCache = {};
Traveller.creepMatrixCache = {};
Creep.prototype.travelTo = function (destination, options) {
	return Traveller.travelTo(this, destination, options);
};

export default new Traveller();
