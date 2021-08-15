'use strict';

const BLACK = '#000000';
const WHITE = '#FFFFFF';
const RED = '#FF0000';
const GREEN = '#00FF00';
const BLUE = '#0000FF';
const YELLOW = '#FFFF00';
const ORANGE = '#FFA500'
const CYAN = '#00FFFF';

function paintRed(message) {
	return `\x1B[31m${message}\x1B[0m`;
}

function paintGreen(message) {
	return `\x1B[32m${message}\x1B[0m`;
}

function paintYellow(message) {
	return `\x1B[33m${message}\x1B[0m`;
}

function paintBlue(message) {
	return `\x1B[34m${message}\x1B[0m`;
}

function paintMagenta(message) {
	return `\x1B[35m${message}\x1B[0m`;
}

function paintCyan(message) {
	return `\x1B[36m${message}\x1B[0m`;
}


let style = {
	creep: {
		melee: {
			radius: 0.3,
			fill: RED,
			opacity: 1,
		},
		ranged: {
			radius: 0.3,
			fill: BLUE,
			opacity: 1,
		},
		healer: {
			radius: 0.3,
			fill: GREEN,
			opacity: 1,
		},
	},
	traveller: {
		fatigue: {
			radius: 0.3,
			fill: CYAN,
		},
		start: {
			radius: 0.3,
			fill: ORANGE,
			opacity: 1
		},
		destination: {
			radius: 0.3,
			fill: ORANGE,
			opacity: 1
		},
		path : {
			color: ORANGE,
			lineStyle: 'dashed'
		},
		stuck: {
			radius: 0.3,
			fill: BLACK
		}
	},
};


export {
	paintRed as red,
	paintGreen as green,
	paintYellow as yellow,
	paintBlue as blue,
	paintMagenta as magenta,
	paintCyan as cyan,
	style as style
};


