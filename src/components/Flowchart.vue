<template>
    <div style="width: 100%;height: 100%;position: relative;">
    <jsplumb-toolkit ref="toolkitComponent" url="data/copyright.json" v-bind:render-params="renderParams" v-bind:view="view" id="toolkit" surface-id="surface" v-bind:toolkit-params="toolkitParams"></jsplumb-toolkit>
    <jsplumb-miniview surface-id="surface"></jsplumb-miniview>
    </div>
</template>

<script>

// jsplumb imports
import { getSurface } from '@jsplumbtoolkit/browser-ui-vue2'

import { ForceDirectedLayout,
    LassoPlugin,
    DrawingToolsPlugin,
    EdgePathEditor,
    Dialogs,
    uuid
} from "@jsplumbtoolkit/browser-ui"

// local imports
import StartNode from './StartNode.vue'
import ActionNode from './ActionNode.vue'
import QuestionNode from './QuestionNode.vue'
import OutputNode from './OutputNode.vue'

let toolkitComponent
let toolkit
let surface
let dialogs
let edgeEditor

function showEdgeEditDialog(data, continueFunction, abortFunction) {
    dialogs.show({
        id: "dlgText",
        data: {
            text: data.label || ""
        },
        onOK: function (data) {
            continueFunction({label:data.text || ""})
        },
        onCancel:abortFunction
    });
}

function nodeFactory(type, data, callback)  {
    dialogs.show({
        id: "dlgText",
        title: "Enter " + type + " name:",
        onOK: function (d) {
            data.text = d.text;
            // if the user entered a name...
            if (data.text) {
                // and it was at least 2 chars
                if (data.text.length >= 2) {
                    // set an id and continue.
                    data.id = uuid();
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

function edgeFactory(type, data, continueCallback, abortCallback) {
    showEdgeEditDialog(data, continueCallback, abortCallback)
    return true
}

export default {

    name: 'jsp-toolkit',
    props:["surfaceId"],
    data:() => {
        return {
            toolkitParams:{
                nodeFactory:nodeFactory,
                edgeFactory:edgeFactory,
                beforeStartConnect:function(node) {
                    // limit edges from start node to 1. if any other type of node, return
                    return (node.data.type === "start" && node.getEdges().length > 0) ? false : { label:"..." };
                }
            },
            renderParams:{
                layout:{
                    type: ForceDirectedLayout.type
                },
                events:{
                    modeChanged:function (mode) {
                        let controls = document.querySelector(".controls");
                        surface.removeClass(controls.querySelectorAll("[mode]"), "selected-mode");
                        surface.addClass(controls.querySelectorAll("[mode='" + mode + "']"), "selected-mode");
                    },
                    canvasClick:() => {
                        toolkit.clearSelection();
                        edgeEditor.stopEditing();
                    }
                },
                consumeRightClick: false,
                dragOptions: {
                    filter: ".jtk-draw-handle, .node-action, .node-action i"
                },
                zoomToFit:true,
                plugins: [
                    DrawingToolsPlugin.type,
                    {
                        type:LassoPlugin.type,
                        options:{
                            invert:true
                        }
                    }
                ],
                grid:{
                    size:{
                        w:20,
                        h:20
                    }
                },
                magnetize:{
                    afterDrag:true
                }
            },
            view:{
                nodes: {
                    "start": {
                        component:StartNode
                    },
                    "selectable": {
                        events: {
                            tap: (params) => {
                                params.toolkit.toggleSelection(params.obj)
                            }
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
                        connector: {type:"Orthogonal", options:{ cornerRadius: 5 } },
                        paintStyle: { strokeWidth: 2, stroke: "rgb(132, 172, 179)", outlineWidth: 3, outlineStroke: "transparent" },	//	paint style for this edge type.
                        hoverPaintStyle: { strokeWidth: 2, stroke: "rgb(67,67,67)" }, // hover paint style for this edge type.
                        events: {
                            "click":(p) => {
                                edgeEditor.startEditing(p.edge, {
                                    deleteButton:true,
                                    onMaybeDelete:(edge, connection, doDelete) => {
                                        dialogs.show({
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
                            { type:"Arrow", options:{ location: 1, width: 10, length: 10 } }
                        ]
                    },
                    "response":{
                        parent:"default",
                        overlays:[
                            {
                                type: "Label",
                                options: {
                                    label: "${label}",
                                    events: {
                                        click: (p) => {
                                            showEdgeEditDialog(p.edge.data, (data) => {
                                                toolkit.updateEdge(p.edge, data);
                                            }, () => null)
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },

                ports: {
                    "start": {
                        edgeType: "default"
                    },
                    "source": {
                        maxConnections: -1,
                        edgeType: "response"
                    },
                    "target": {
                        maxConnections: -1,
                        isTarget: true
                    }
                }
            }
        };
    },

    methods:{
        editNode:function(node) {
            dialogs.show({
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
        },
        maybeDelete:function(node) {
            dialogs.show({
                id: "dlgConfirm",
                data: {
                    msg: "Delete '" + node.data.text + "'"
                },
                onOK:() => {
                    toolkit.removeNode(node);
                }
            });
        }
    },

    mounted() {

        toolkitComponent = this.$refs.toolkitComponent;
        toolkit = toolkitComponent.toolkit;

        dialogs = new Dialogs({
            dialogs: {
                "dlgText": {
                    template:'<input type="text" size="50" jtk-focus jtk-att="text" value="${text}" jtk-commit="true"/>',
                    title:'Enter Text',
                    cancelable:true

                },
                "dlgConfirm": {
                    template:'${msg}',
                    title:'Please Confirm',
                    cancelable:true
                },
                "dlgMessage": {
                    template:'${msg}',
                    title:"Message",
                    cancelable:false
                }
            }
        });

        getSurface(this.surfaceId, (s) => {
            surface = s;
            edgeEditor = new EdgePathEditor(s)
        });

    }

}

</script>
