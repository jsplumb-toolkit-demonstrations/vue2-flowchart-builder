<template>
    <div v-bind:style="{left:obj.left + 'px', top:obj.top + 'px', width:obj.w + 'px', height:obj.h + 'px'}" class="flowchart-object flowchart-action" data-jtk-target="true">
        <svg :width="obj.w" :height="obj.h" stroke-linejoin="round">
            <path :d="'M ' + (obj.w/2) + ' 10 L ' + (obj.w-10) + ' ' + (obj.h/2) + ' L ' + (obj.w/2) + ' ' + (obj.h-10) + ' L 10 ' + (obj.h/2) + ' Z'" class="inner"/>
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
