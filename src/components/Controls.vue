<template>
    <div class="controls" ref="container">
        <i class="fa fa-arrows selected-mode" mode="pan" title="Pan Mode" v-on:click="panMode()"></i>
        <i class="fa fa-pencil" mode="select" title="Select Mode" v-on:click="selectMode()"></i>
        <i class="fa fa-home" reset title="Zoom To Fit" v-on:click="zoomToFit()"></i>
        <i class="fa fa-undo" undo title="Undo last action" v-on:click="undo()"></i>
        <i class="fa fa-repeat" redo title="Redo last action" v-on:click="redo()"></i>
        <i class="fa fa-times" title="Clear" v-on:click="clear()"></i>
    </div>
</template>

<script lang="ts">

    import { Vue, Component, Prop} from "vue-property-decorator"

    import { getSurface, Surface, SurfaceMode } from "@jsplumbtoolkit/browser-ui-vue2";
    import { EVENT_CANVAS_CLICK } from "@jsplumbtoolkit/browser-ui"
    import { EVENT_UNDOREDO_UPDATE } from "@jsplumbtoolkit/core"

    @Component
export default class ControlsComponent extends Vue {

    container:Element

    // a wrapper around getSurface, which expects a callback, as the surface may or may not have been
    // initialised when calls are made to it.
    _getSurface(cb:(s:Surface) => any) {
        getSurface(this.surfaceId, cb)
    }

    @Prop() surfaceId:string

    panMode() {
        this._getSurface((s) => s.setMode(SurfaceMode.PAN))
    }

    selectMode() {
        this._getSurface((s) => s.setMode(SurfaceMode.SELECT))
    }

    zoomToFit() {
        this._getSurface((s) => s.zoomToFit());
    }

    undo() {
        this._getSurface((s) => s.toolkitInstance.undo())
    }

    redo() {
        this._getSurface((s) => s.toolkitInstance.redo())
    }

    clear() {
        this._getSurface((s) => {
            const t = s.toolkitInstance;
            if (t.getNodeCount() === 0 || confirm("Clear canvas?")) {
                t.clear();
            }
        })
    }

    mounted() {

        this.container = this.$refs.container as any;
        this._getSurface((surface) => {

            surface.toolkitInstance.bind(EVENT_UNDOREDO_UPDATE, (state) => {
                this.container.setAttribute("can-undo", state.undoCount > 0 ? "true" : "false")
                this.container.setAttribute("can-redo", state.redoCount > 0 ? "true" : "false")
            })

            surface.bind(EVENT_CANVAS_CLICK, () => {
                surface.toolkitInstance.clearSelection();
            });
        });
    }
}

</script>
