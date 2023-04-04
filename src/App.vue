<template>
  <div id="app">
    <div class="jtk-demo-main" id="jtk-demo-flowchart">

        <div id="canvas" class="jtk-demo-canvas">
          <Controls surface-id="surface"></Controls>
          <Flowchart surface-id="surface"></Flowchart>
        </div>

        <div class="jtk-demo-rhs">
          <Palette surface-id="surface"
                   selector="[data-node-type]"
                   v-bind:data-generator="dataGenerator">
          </Palette>
          <div class="description">
            <p>
              This sample application is a copy of the Flowchart Builder application, using the Toolkit's
              Vue 2 integration components and Vue CLI 3.
            </p>
            <ul>
              <li>Drag new nodes from the palette on the left onto whitespace to add new disconnected nodes</li>
              <li>Drag new nodes from the palette on the left onto on edge to drop a node between two existing nodes</li>
              <li>Drag from the grey border of any node to any other node to establish a link, then provide a description for the link's label</li>
              <li>Click a link to edit its label.</li>
              <li>Click the 'Pencil' icon to enter 'select' mode, then select several nodes. Click the canvas to exit.</li>
              <li>Click the 'Home' icon to zoom out and see all the nodes.</li>
            </ul>
          </div>
        </div>

    </div>

  </div>
</template>

<style>
  @import "../node_modules/@jsplumbtoolkit/browser-ui/css/jsplumbtoolkit.css";
  @import "../node_modules/@jsplumbtoolkit/browser-ui/css/jsplumbtoolkit-dialogs.css";
  @import "../node_modules/@jsplumbtoolkit/browser-ui/css/jsplumbtoolkit-demo-support.css";
  @import "../node_modules/@jsplumbtoolkit/browser-ui/css/jsplumbtoolkit-connector-editors.css";
  @import "./assets/css/app.css";

</style>

<script>

  import { uuid } from "@jsplumbtoolkit/browser-ui"

  import Flowchart from './components/Flowchart.vue'
  import Palette from './components/Palette.vue'
  import Controls from './components/Controls.vue'

export default {
  name: 'app',
  components: {
    Flowchart, Palette, Controls
  },
    methods:{
        dataGenerator:function(el) {
            return {
                type:el.getAttribute("data-node-type"),
                w:el.getAttribute("data-width"),
                h:el.getAttribute("data-height"),
                id:uuid()
            };
        }
    }
}
</script>

