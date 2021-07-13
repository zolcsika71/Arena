import {move_by_memory} from "./movement.js";
import {creep_attack_plugin, creep_heal_plugin, creep_ranged_attack_plugin} from "./combat.js";
import {tower_plugin} from "./tower.js";
import {app} from "./App.js";
import {career_plugin, group_move_plugin, group_plugin} from "./group.js";

app.add_plugin(career_plugin,1)
    .add_plugin(group_plugin,1)
    .add_plugin(group_move_plugin)
    .add_plugin(move_by_memory)
    .add_plugin(creep_ranged_attack_plugin)
    .add_plugin(creep_attack_plugin)
    .add_plugin(creep_heal_plugin)
    .add_plugin(tower_plugin)
export function loop() {
    app.run();
}
