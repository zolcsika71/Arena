export function move_by_memory(ctx){
    ctx.my_creeps.forEach(c=>{
        let move_target = ctx.creeps_memory[c.id].moveTo;
        if (!move_target)return;
        c.moveTo(move_target);
    })
}