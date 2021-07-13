import {context} from "./context";
import {getTime} from"/game/utils";
export let app = {
    ctx: context,
    plugins: [],
    add_plugin: function (plugin, exec_times) {
        if (!exec_times)
            exec_times = -1;

        let idx = this.plugins.indexOf([plugin, exec_times]);
        if (idx === -1) this.plugins.push([plugin, exec_times]);
        return this;
    },
    run: function () {
        this.ctx.refresh();
        console.log("---------------")
        this.plugins.forEach(p => {
            if (p[1] === 0) return;
            if (p[1] > 0) p[1]--;
                p[0](this.ctx);
        });
    }
}
