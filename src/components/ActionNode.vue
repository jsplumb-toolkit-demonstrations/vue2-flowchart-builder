<template>
    <div v-bind:style="{left:obj.left + 'px', top:obj.top + 'px', width:obj.w + 'px', height:obj.h + 'px'}" class="flowchart-object flowchart-action" data-jtk-target="true">
        <svg :width="obj.w" :height="obj.h">
            <rect x="10" y="10" :width="obj.w-20" :height="obj.h-20" class="inner" rx="5" ry="5"/>
        </svg>

        <span>{{obj.text}}</span>

        <div class="node-edit node-action" v-on:click="edit"></div>
        <div class="node-delete node-action delete" v-on:click="maybeDelete"></div>
        <div class="drag-start connect" data-jtk-source="true" data-jtk-port-type="source"></div>
    </div>
</template>

<script lang="ts">
    import BaseEditableNode from './BaseEditableNode.vue'
    export default {
        mixins:[BaseEditableNode]
    }
</script>
