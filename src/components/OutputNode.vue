<template>
    <div v-bind:style="{left:obj.left + 'px', top:obj.top + 'px', width:obj.w + 'px', height:obj.h + 'px'}" class="flowchart-object flowchart-output" data-jtk-target="true">
        <svg :width="obj.w" :height="obj.h">
            <rect x="0" y="0" :width="obj.w" :height="obj.h" rx="5" ry="5"/>
        </svg>
        <span>{{obj.text}}</span>
        <div class="node-edit node-action" v-on:click="edit"></div>
        <div class="node-delete node-action delete" v-on:click="maybeDelete"></div>
    </div>
</template>

<script lang="ts">
    import BaseEditableNode from './BaseEditableNode.vue'
    export default {
        mixins:[BaseEditableNode]
    }
</script>
