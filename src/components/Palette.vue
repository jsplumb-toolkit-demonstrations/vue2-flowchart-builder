<template>
    <div class="sidebar node-palette">
        <div class="sidebar-item" :data-node-type="entry.type" title="Drag to add new" v-for="entry in data" :key="entry.type" :data-width="entry.w" :data-height="entry.h">
            <i :class="entry.icon"></i>{{entry.label}}
        </div>
    </div>
</template>

<script>

    import { SurfaceDrop } from '@jsplumbtoolkit/browser-ui-vue2'

    export default {
        mixins:[ SurfaceDrop ],
        data:function() {
            return {
                data:[
                    { icon:"icon-tablet", label:"Question", type:"question", w:240, h:220 },
                    { icon:"icon-eye-open", label:"Action", type:"action", w:240, h:160 },
                    { type:"output", icon:"icon-eye-open", label:"Output", w:240, h:160 }
                ]
            };
        }
    }

</script>
