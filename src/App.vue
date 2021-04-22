<template>
  <div id="app">
    <div class="jtk-demo-main" id="jtk-demo-flowchart">


        <div id="canvas" class="jtk-demo-canvas">
          <Controls surface-id="surface"></Controls>
          <Flowchart surface-id="surface" v-on:node-factory="nodeFactory"></Flowchart>
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
        nodeFactory:function(params) {
          alert("the node factory in the component")
          Dialogs.show({
            id: "dlgText",
            title: "Enter " + params.type + " name:",
            onOK: function (d) {
                params.data.text = d.text;
                // if the user entered a name...
                if (params.data.text) {
                    // and it was at least 2 chars
                    if (params.data.text.length >= 2) {
                        // set an id and continue.
                        params.data.id = jsPlumbUtil.uuid();
                        params.callback(data);
                    }
                    else
                    // else advise the user.
                        alert(params.type + " names must be at least 2 characters!");
                }
                // else...do not proceed.
            }
        });
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

