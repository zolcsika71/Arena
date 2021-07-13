import {body_part_count, groupBy} from "./utils";
import {getObjectById} from "/game/utils"

/**
 * tag every creep by body part
 *
 */
export function career_plugin(ctx) {
    ctx.my_creeps.forEach(c => {
        let body_part = body_part_count(c);
        for (let tag of ["heal", "ranged_attack", "attack", "tough", "heal"])
            if (body_part[tag]) {
                ctx.creeps_memory[c.id][tag] = true;
            }
    })
}


/**
 * split all creeps into 2 group
 * @param ctx
 */

export function group_plugin(ctx) {
    let group = [{"ranged_attack": [], "heal": []}, {"ranged_attack": [], "heal": []}, {
        "ranged_attack": [],
        "heal": []
    }, {"attack": []}];

    ctx.my_creeps.forEach(c => {
        let tp;
        if (ctx.creeps_memory[c.id].heal) {
            tp = "heal";
        }
        if (ctx.creeps_memory[c.id].ranged_attack) {
            tp = "ranged_attack";
        }
        if (ctx.creeps_memory[c.id].attack) {
            tp = "attack";
        }
        for (let g of group) {
            if (g[tp] && g[tp].length < 2) {
                g[tp].push(c.id);
                return;
            }
        }
    })
    ctx.group = group;
}
//todo
//1.attacker moveto target=>closest
//2.heal moveto target>attacker
//3.wait for group
export function group_move_plugin(ctx) {

    for (let i of [0, 1, 2]) {
        Object.values(ctx.group[i]).flat().forEach(id => {
            let moveto = ctx.enemy_creeps[0];
            if (moveto) {
                ctx.creeps_memory[id].moveTo = moveto;
                ctx.creeps_memory[id].attact_target=moveto;
            }else {
                ctx.creeps_memory[id].moveTo = ctx.enemy_flag;
            }
        })
    }
    Object.values(ctx.group[3]).flat().forEach(id => {
        ctx.creeps_memory[id].moveTo = ctx.my_flag;
    })

}