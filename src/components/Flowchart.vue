<template>
    <div style="width: 100%;height: 100%;position: relative;">
    <jsplumb-toolkit ref="toolkitComponent" url="data/copyright.json" v-bind:render-params="renderParams" v-bind:view="view" id="toolkit" surface-id="surface" v-bind:toolkit-params="toolkitParams"></jsplumb-toolkit>
    <jsplumb-miniview surface-id="surface"></jsplumb-miniview>
    </div>
</template>

<script>

import { jsPlumb, Dialogs, DrawingTools} from 'jsplumbtoolkit'
import { jsPlumbToolkitVue2 } from 'jsplumbtoolkit-vue2'

import StartNode from './StartNode.vue'
import ActionNode from './ActionNode.vue'
import QuestionNode from './QuestionNode.vue'
import OutputNode from './OutputNode.vue'

let toolkitComponent;
let toolkit;
let surface;
let component;

function editEdge(params) {
    Dialogs.show({
        id: "dlgText",
        data: {
            text: params.edge.data.label || ""
        },
        onOK: function (data) {
            toolkit.updateEdge(params.edge, {label:data.text});
        }
    });
}

/**
 * The nodeFactory is what the Toolkit uses to get the initial data for a new node. This node factory emits a `dialog`
 * event which the parent picks up, but the logic involving the Toolkit is inside this component.
 */
function nodeFactory(type, data, callback) {
    component.$emit("dialog", {
        id: "dlgText",
        title: "Enter " + type + " name:",
        onOK: function (d) {
            data.text = d.text;
            // if the user entered a name...
            if (data.text) {
                // and it was at least 2 chars
                if (data.text.length >= 2) {
                    // set an id and continue.
                    data.id = jsPlumbUtil.uuid();
                    callback(data);
                }
                else
                // else advise the user.
                    alert(type + " names must be at least 2 characters!");
            }
            // else...do not proceed.
        }
    });
}

export default {

    name: 'jsp-toolkit',
    props:["surfaceId"],
    data:() => {
        return {
            toolkitParams:{
                nodeFactory:nodeFactory,
                // eslint-disable-next-line
                beforeStartConnect:function(node, edgeType) {
                    // limit edges from start node to 1. if any other type of node, return
                    return (node.data.type === "start" && node.getEdges().length > 0) ? false : { label:"..." };
                }
            },
            renderParams:{
              layout:{
                  type:"Spring"
              },
              jsPlumb:{
                  Connector:"StateMachine",
                  Endpoint:"Blank"
              },
              events:{
                  modeChanged:function (mode) {
                      let controls = document.querySelector(".controls");
                      jsPlumb.removeClass(controls.querySelectorAll("[mode]"), "selected-mode");
                      jsPlumb.addClass(controls.querySelectorAll("[mode='" + mode + "']"), "selected-mode");
                  },
                  edgeAdded:(params) => {
                      if (params.addedByMouse) {
                          editEdge(params);
                      }
                  },
                  canvasClick:() => {
                      surface.stopEditing();
                  }
              },
              lassoInvert:true,
              consumeRightClick: false,
              dragOptions: {
                  filter: ".jtk-draw-handle, .node-action, .node-action i"
              },
              zoomToFit:true
            },
            view:{
                nodes: {
                    "start": {
                        component:StartNode
                    },
                    "selectable": {
                        events: {
                            tap: (params) => params.toolkit.toggleSelection(params.node)
                        }
                    },
                    "question": {
                        parent: "selectable",
                        component:QuestionNode
                    },
                    "action": {
                        parent: "selectable",
                        component:ActionNode
                    },
                    "output":{
                        parent:"selectable",
                        component:OutputNode
                    }
                },
                // There are two edge types defined - 'yes' and 'no', sharing a common
                // parent.
                edges: {
                    "default": {
                        anchor:"AutoDefault",
                        endpoint:"Blank",
                        connector: ["EditableFlowchart", { cornerRadius: 5 } ],
                        paintStyle: { strokeWidth: 2, stroke: "rgb(132, 172, 179)", outlineWidth: 3, outlineStroke: "transparent" },	//	paint style for this edge type.
                        hoverPaintStyle: { strokeWidth: 2, stroke: "rgb(67,67,67)" }, // hover paint style for this edge type.
                        events: {
                            "click":(p) => {
                                surface.startEditing(p.edge, {
                                    deleteButton:true,
                                    onMaybeDelete:(edge, connection, doDelete) => {
                                        Dialogs.show({
                                            id: "dlgConfirm",
                                            data: {
                                                msg: "Delete Edge"
                                            },
                                            onOK: doDelete
                                        });
                                    }
                                });
                            }
                        },
                        overlays: [
                            [ "Arrow", { location: 1, width: 10, length: 10 }]
                        ]
                    },
                    "connection":{
                        parent:"default",
                        overlays:[
                            [
                                "Label", {
                                    label: "${label}",
                                    events:{
                                        click:editEdge
                                    }
                                }
                            ]
                        ]
                    }
                },

                ports: {
                    "start": {
                        edgeType: "default"
                    },
                    "source": {
                        maxConnections: -1,
                        edgeType: "connection"
                    },
                    "target": {
                        maxConnections: -1,
                        isTarget: true,
                        dropOptions: {
                            hoverClass: "connection-drop"
                        }
                    }
                }
            }
        };
    },
    methods:{
        maybeDelete:function(node) {
            this.$emit("dialog", {
                id:"dlgConfirm",
                data: {
                    msg: "Delete '" + node.data.text + "'"
                },
                onOK:() => {
                    toolkit.removeNode(node);
                }
            })
        },
        editNode:function(node) {
            this.$emit("dialog", {
                id: "dlgText",
                data: node.data,
                title: "Edit " + node.data.type + " name",
                onOK: (data) => {
                    if (data.text && data.text.length > 2) {
                        // if name is at least 2 chars long, update the underlying data and
                        // update the UI.
                        toolkit.updateNode(node, data);
                    }
                }
            });
        }
    },

    mounted() {

        component = this
        toolkitComponent = this.$refs.toolkitComponent;
        toolkit = toolkitComponent.toolkit;

        jsPlumbToolkitVue2.getSurface(this.surfaceId, (s) => {
            surface = s;
            new DrawingTools({
                renderer: s
            });
        });
    }

}

</script>
