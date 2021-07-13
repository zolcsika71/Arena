export function groupBy(array, f) {
    debugger;
    const groups = {};
    array.forEach(function (o) {
        const group = f(o);
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return groups;
}
export function body_part_count(c){
    return c.body.map(b=>b.type).reduce((pre,cur)=>{
        if (pre[cur])pre[cur]+=1;
        else pre[cur]=1;
        return pre;
    },{})
}