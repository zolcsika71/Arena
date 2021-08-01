'use strict';



function paintRed (message) {
	return `\x1B[31m${message}\x1B[0m`
}

function paintGreen (message) {
	return `\x1B[32m${message}\x1B[0m`
}

function paintYellow (message) {
	return `\x1B[33m${message}\x1B[0m`
}

export { paintRed as red, paintGreen as green, paintYellow as yellow};


