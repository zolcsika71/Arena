import {MOVE, WORK, RANGED_ATTACK, HEAL, ATTACK} from '/game/constants';

let Parameters = {
	creepsQueued: ['worker', 'healer', 'meleeAttacker', 'rangedAttacker'],
	creepsDefaultBody: {
		worker: [MOVE, WORK],
		healer: [MOVE, HEAL],
		melee: [MOVE, ATTACK],
		ranger: [MOVE, RANGED_ATTACK]
	},
	creepsNumber: {
		worker: 1,
		meleeAttacker: 1,
		rangedAttacker: 1,
		healer: 1
	}
};

export default Parameters

