<template>
  <div id="app">
    <div class="jtk-demo-main" id="jtk-demo-flowchart">


        <div id="canvas" class="jtk-demo-canvas">
          <Controls surface-id="surface"></Controls>
          <Flowchart surface-id="surface" v-on:dialog="showDialog"></Flowchart>
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

<script>

  import  { Dialogs, jsPlumbToolkit, jsPlumbUtil } from "jsplumbtoolkit"
// eslint-disable-next-line
  import { jsPlumbToolkitEditableConnectors } from "jsplumbtoolkit-editable-connectors";

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
                w:120,
                h:80,
                id:jsPlumbUtil.uuid()
            };
        },
        showDialog(options) {
          Dialogs.show(options);
        }
    },
    mounted:function() {
        jsPlumbToolkit.ready(() => {
            Dialogs.initialize({
                selector: ".dlg"
            });
        });
    }
}
</script>

