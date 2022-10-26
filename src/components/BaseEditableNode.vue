<script lang="ts">

   import { BaseNodeComponent } from '@jsplumbtoolkit/browser-ui-vue2'
   import { consume } from "@jsplumbtoolkit/browser-ui"

    export default {
        mixins:[ BaseNodeComponent ],
        methods:{
            edit:function(event:MouseEvent) {
                consume(event);
                this.$parent.$parent.editNode(this.getNode());
            },
            maybeDelete:function(event) {
                consume(event);
                this.$parent.$parent.maybeDelete(this.getNode());
            }
        }
    }

</script>
