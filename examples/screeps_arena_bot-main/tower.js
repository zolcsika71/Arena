export function tower_plugin(ctx){
    let towers = ctx.my_towers;
    for (let t of towers){
        let enemies = t.findInRange(ctx.enemy_creeps,3);
        if (enemies.length>0){
            t.attack(enemies[0]);
        }
    }

}