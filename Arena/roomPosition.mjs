'use strict'

import {getDirection} from '/game/utils';
import {getObjectsByPrototype} from '/game/utils';


class RoomPosition {
    constructor(name, position) {
        this.name = name
        // this.pos = position
        this.x = position.x
        this.y = position.y
        this.cost = null
    }


    // standsOn (position) {
    //     // return position.x === this.x && position.y === this.y;
    //     return _.isEqual(this.pos, position);
    // };

    isNearTo(target) {
        let offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1],
            offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
        for (let i = 0; i < 9; i++) {
            if (target.x + offsetX[i] === this.x && target.y + offsetY[i] === this.y)
                return true
        }
        return false
    }

    getDirectionTo(target) {
        return getDirection(target.x - this.x, target.y - this.y)
    }

    get neighbours() {
        let neighbours = [],
            offsetX = [0, 1, 1, 1, 0, -1, -1, -1],
            offsetY = [-1, -1, 0, 1, 1, 1, 0, -1],
            name = {
                0: 'top',
                1: 'topRight',
                2: 'right',
                3: 'bottomRight',
                4: 'bottom',
                5: 'bottomLeft',
                6: 'left',
                7: 'topLeft'
            };

        for (let i = 0; i < 8; i++) {
            neighbours.push(
                new RoomPosition(`neighbour-${name[i]}`, {
                    x: this.x + offsetX[i],
                    y: this.y + offsetY[i]
                })
            )
        }
        return neighbours;
    }

    toString() {
        return `[${this.name}] ${this.x}, ${this.y}`
    }
}

export default RoomPosition
