<script>

    import { BaseNodeComponent } from 'jsplumbtoolkit-vue2'

    export default {
        mixins:[ BaseNodeComponent ],
        methods:{
            edit:function() {
                this.$parent.$parent.editNode(this.getNode());                
            },
            maybeDelete:function() {
                this.$parent.$parent.maybeDelete(this.getNode());
            }
        }
    }

</script>