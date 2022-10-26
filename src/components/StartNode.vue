<template>
    <div v-bind:style="{left:obj.left + 'px', top:obj.top + 'px', width:obj.w + 'px', height:obj.h + 'px'}" class="flowchart-object flowchart-start">
        <svg :width="obj.w" :height="obj.h">
            <ellipse :cx="obj.w/2" :cy="obj.h/2" :rx="(obj.w/2) - 10" :ry="(obj.h/2) - 10" class="inner"/>
        </svg>
        <span>{{obj.text}}</span>
        <div class="drag-start connect" data-jtk-source="true" data-jtk-port-type="start"></div>
    </div>
</template>

<script lang="ts">
    export default { }
</script>
