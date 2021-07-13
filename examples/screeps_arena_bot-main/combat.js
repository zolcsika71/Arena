import {MOVE, ATTACK, TOUGH, HEAL, RANGED_ATTACK} from '/game/constants';
import {getRange} from '/game/utils';

export function creep_ranged_attack_plugin(ctx) {
    ctx.my_creeps.filter(c => c.body.some(b => b.type === RANGED_ATTACK)).forEach(c => {
        let attack_target = ctx.creeps_memory[c.id].attact_target;
        if (attack_target) {
            let gap = getRange(c, attack_target)
            switch (gap){
                case 1:
                case 2:
                    c.rangedMassAttack();
                    break;
                case 3:
                    c.rangedAttack(attack_target);
                    break;
            }
        }

    })
}

export function creep_attack_plugin(ctx) {
    ctx.my_creeps.filter(c => c.body.some(b => b.type === ATTACK)).forEach(c => {
        let attack_target = ctx.creeps_memory[c.id].attact_target;
        if (attack_target && getRange(c, attack_target) === 1) {
            c.attack(attack_target);
        } else {
            let closest_attack_target = c.findClosestByRange(ctx.enemy_creeps);
            if (closest_attack_target && getRange(c, closest_attack_target) === 1) {
                c.attack(closest_attack_target);
            }
        }
    })
}

export function creep_heal_plugin(ctx) {
    ctx.my_creeps.filter(c => c.body.some(b => b.type === HEAL)).forEach(c => {
        let heal_target = ctx.creeps_memory[c.id].heal_target;
        if (!heal_target || heal_target.hits === heal_target.hitsMax) {
            let heal_targets = c.findInRange(ctx.my_creeps, 3).filter(c => c.hits < c.hitsMax).sort((a, b) => a.hits - b.hits);
            if (heal_targets.length > 0) heal_target = heal_targets[0];
        }
        if (heal_target)
            heal(c, heal_target);

    })
}

function heal(c, heal_target) {
    let gap = getRange(c, heal_target);
    if (gap === 1) {
        c.heal(heal_target);
    } else c.rangedHeal(heal_target);
}