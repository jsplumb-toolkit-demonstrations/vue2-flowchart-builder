<template>
    <div style="width: 100%;height: 100%;position: relative;">
    <jsplumb-toolkit ref="toolkitComponent"
                     url="data/copyright.json"
                     v-bind:render-params="renderParams()"
                     v-bind:view="view()"
                     id="toolkit"
                     surface-id="surface"
                     v-bind:toolkit-params="toolkitParams()">

    </jsplumb-toolkit>
    <jsplumb-miniview surface-id="surface"></jsplumb-miniview>
    </div>
</template>

<script lang="ts">

import { Surface } from "@jsplumbtoolkit/browser-ui"
import {BrowserUIVue2, getSurface, EVENT_CLICK, DEFAULT} from '@jsplumbtoolkit/browser-ui-vue2'
import { uuid, Node, Edge, Base } from "@jsplumbtoolkit/core"
import { AnchorLocations } from "@jsplumb/common"
import { BlankEndpoint, ArrowOverlay, Connection, LabelOverlay} from "@jsplumb/core"
import { ForceDirectedLayout } from "@jsplumbtoolkit/layout-force-directed"

import { LassoPlugin } from "@jsplumbtoolkit/browser-ui-plugin-lasso"
import { DrawingToolsPlugin } from "@jsplumbtoolkit/browser-ui-plugin-drawing-tools"

import { newInstance as newConnectorEditor, EdgePathEditor } from "@jsplumbtoolkit/connector-editors"
import { OrthogonalConnector } from "@jsplumbtoolkit/connector-orthogonal"

// you must do this in order for the orthogonal connector to
// not be thrown away when tree shaking happens.
import * as OrthogonalConnectorEditors from "@jsplumbtoolkit/connector-editors-orthogonal"
OrthogonalConnectorEditors.initialize()

import { ObjectData } from "@jsplumbtoolkit/core"

import StartNode from './StartNode.vue'
import ActionNode from './ActionNode.vue'
import QuestionNode from './QuestionNode.vue'
import OutputNode from './OutputNode.vue'
import {Dialogs, newInstance} from "@jsplumbtoolkit/dialogs"

import {Vue, Component, Prop} from 'vue-property-decorator'
import {
    DIALOG_CONFIRM,
    DIALOG_MESSAGE,
    DIALOG_TEXT, EDGE_TYPE_RESPONSE, NODE_TYPE_ACTION, NODE_TYPE_OUTPUT, NODE_TYPE_QUESTION,
    NODE_TYPE_SELECTABLE,
    NODE_TYPE_START, PORT_TYPE_SOURCE, PORT_TYPE_START, PORT_TYPE_TARGET
} from "./constants"

@Component
export default class Flowchart extends Vue {

    @Prop() surfaceId: string
    toolkit:BrowserUIVue2
    surface:Surface
    dialogs:Dialogs
    edgeEditor:EdgePathEditor

    name = 'jsp-toolkit'

    toolkitParams () {
        return {
            // the node factory is invoked when the user drags a new node onto the canvas. it is responsible for preparing
            // a suitable data payload for the new node. The node factory operates via a callback - if you don't wish to
            // proceed, you simply dont call the callback.
            //
            // you can also invoke the nodeFactory by calling `addFactoryNode` on a toolkit instance - see docs for more information.
            //
            nodeFactory:((type:string, data:ObjectData, callback:(o:ObjectData) => any) => {
                this.dialogs.show({
                    id: DIALOG_TEXT,
                    title: "Enter " + type + " name:",
                    onOK: (d:Record<string, any>) => {
                        data.text = d.text;
                        // if the user entered a name...
                        if (data.text) {
                        // and it was at least 2 chars
                        if (data.text.length >= 2) {
                            // set an id and continue.
                            data.id = uuid()
                            callback(data)
                        }
                        else
                            // else advise the user.
                            alert(type + " names must be at least 2 characters!");
                        }
                        // else...do not proceed.
                    }
                })
            }),
            //
            // factory method to create a new dataset when the user drags a new edge
            //
            edgeFactory:((type:string, data:ObjectData, continueCallback:(o:ObjectData) => any, abortCallback:() => any) => {
                this.showEdgeEditDialog(data, continueCallback, abortCallback)
                return true
            }),
            //
            // interceptor that is called before the user drags a new edge. returning false aborts the drag,
            //
            beforeStartConnect:(node:Node) => {
                // limit edges from start node to 1. if any other type of node, return
                return (node.data.type === "start" && node.getEdges().length > 0) ? false : { label:"..." };
            }
        }
    }

    //
    // behaviour of the surface - its layout type, canvac click events, plugins.
    //
    renderParams() {
        return {
            layout:{
                type: ForceDirectedLayout.type
            },
            events:{
                modeChanged:(mode:string) => {
                    let controls = document.querySelector(".controls")
                    if (controls != null) {
                        this.surface.removeClass(controls.querySelectorAll("[mode]"), "selected-mode");
                        this.surface.addClass(controls.querySelectorAll("[mode='" + mode + "']"), "selected-mode");
                    }
                },
                canvasClick:() => {
                    this.toolkit.clearSelection()
                    this.edgeEditor.stopEditing()
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
        }
    }

    //
    // the view provides a mapping of node/edge/port types to their representation and behaviour.
    view() {
        return {
            // four concrete node types, each mapped to a vue component. the `selectable` node type
            // is "abstract", ie. it has no mapping to a component and acts only to provide some common
            // functionality for action, output and question nodes.
            nodes: {
                [NODE_TYPE_START]: {
                    component:StartNode
                },
                [NODE_TYPE_SELECTABLE]: {
                    events: {
                        tap: (params:{toolkit:BrowserUIVue2, obj:Base}) => {
                            params.toolkit.toggleSelection(params.obj)
                        }
                    }
                },
                [NODE_TYPE_QUESTION]: {
                    parent: NODE_TYPE_SELECTABLE,
                    component:QuestionNode
                },
                [NODE_TYPE_ACTION]: {
                    parent: NODE_TYPE_SELECTABLE,
                    component:ActionNode
                },
                [NODE_TYPE_OUTPUT]:{
                    parent:NODE_TYPE_SELECTABLE,
                    component:OutputNode
                }
            },
            // There are two edge types defined - 'default' and 'response', which has `default` as its parent.
            edges: {
                [DEFAULT]: {
                    anchor:AnchorLocations.AutoDefault,
                    endpoint:BlankEndpoint.type,
                    connector: {type:OrthogonalConnector.type, options:{ cornerRadius: 5 } },
                    paintStyle: { strokeWidth: 2, stroke: "rgb(132, 172, 179)", outlineWidth: 3, outlineStroke: "transparent" },	//	paint style for this edge type.
                    hoverPaintStyle: { strokeWidth: 2, stroke: "rgb(67,67,67)" }, // hover paint style for this edge type.
                    events: {
                        [EVENT_CLICK]:(p:{edge:Edge}) => {
                            this.edgeEditor.startEditing(p.edge, {
                                deleteButton:true,
                                onMaybeDelete:(edge:Edge, connection:Connection, doDelete:(data:Record<string, any>) => any) => {
                                    this.dialogs.show({
                                        id: DIALOG_CONFIRM,
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
                        { type:ArrowOverlay.type, options:{ location: 1, width: 10, length: 10 } }
                    ]
                },
                // `response` edge has a label on it, that can be edited via click.
                [EDGE_TYPE_RESPONSE]:{
                    parent:DEFAULT,
                    overlays:[
                        {
                            type: LabelOverlay.type,
                            options: {
                                label: "${label}",
                                events: {
                                    [EVENT_CLICK]: (p:{edge:Edge}) => {
                                        this.showEdgeEditDialog(p.edge.data, (data:ObjectData) => {
                                            this.toolkit.updateEdge(p.edge, data);
                                        }, () => null)
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            ports: {
                [PORT_TYPE_START]: {
                    edgeType: DEFAULT
                },
                [PORT_TYPE_SOURCE]: {
                    maxConnections: -1,
                    edgeType: EDGE_TYPE_RESPONSE
                },
                [PORT_TYPE_TARGET]: {
                    maxConnections: -1,
                    isTarget: true
                }
            }
        }
    }

    /**
     * Show the edge edit dialog - this is called on click of a label, and also when a new edge is established via drag
     * and drop
     * @param data Edge's backing data.
     * @param continueFunction The function to call if we should commit the edit.
     * @param abortFunction The function to call if the edit should be aborted.
     */
    showEdgeEditDialog(data:ObjectData, continueFunction:(o:ObjectData) => any, abortFunction:() => any) {
        this.dialogs.show({
            id: DIALOG_TEXT,
            data: {
                text: data.label || ""
            },
            onOK: function (data) {
                continueFunction({label:data.text || ""})
            },
            onCancel:abortFunction
        });
    }

    /**
     * Edit the label of some node.
     * @param node
     */
    editNode(node:Node) {
        this.dialogs.show({
            id: DIALOG_TEXT,
            data: node.data,
            title: "Edit " + node.data.type + " name",
            onOK: (data) => {
                if (data.text && data.text.length > 2) {
                    // if name is at least 2 chars long, update the underlying data and
                    // update the UI.
                    this.toolkit.updateNode(node, data);
                }
            }
        });
    }

    /**
     * prompt the user to see if they want to confirm deletion of the node, and delete it if they confirm.
     * @param node
     */
    maybeDelete(node:Node) {
        this.dialogs.show({
            id: DIALOG_CONFIRM,
            data: {
                msg: "Delete '" + node.data.text + "'"
            },
            onOK:() => {
                this.toolkit.removeNode(node);
            }
        });
    }

    mounted() {

        // instantiate the dialogs to use for various user facing operations
        this.dialogs = newInstance({
            dialogs: {
                [DIALOG_TEXT]: {
                    template:'<input type="text" size="50" jtk-focus jtk-att="text" value="${text}" jtk-commit="true"/>',
                    title:'Enter Text',
                    cancelable:true
                },
                [DIALOG_CONFIRM]: {
                    template:'${msg}',
                    title:'Please Confirm',
                    cancelable:true
                },
                [DIALOG_MESSAGE]: {
                    template:'${msg}',
                    title:"Message",
                    cancelable:false
                }
            }
        });

        // get a ref to the toolkit component and store the Toolkit for use in various places
        const t = this.$refs.toolkitComponent;
        this.toolkit = (t as any).toolkit;

        // load the surface via the async `getSurface` method, then stash it on the class and
        // create a new edge path editor that is tied to it.
        getSurface(this.surfaceId, (s:Surface) => {
            this.surface = s
            this.edgeEditor = newConnectorEditor(s)
        });

    }
}

</script>
