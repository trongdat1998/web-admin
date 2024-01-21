<template lang="pug">
.v-fixed
  .v-fixed-space(:style="style")
  .v-fixed-con(:style="`left:${menuMini?'60px':'260px'}`" ref="fixedCon")
    slot
</template>
<script>
import { mapState } from "vuex";
export default {
  data(){
    return  {
      height: 80
    }
  },
  computed: {
    ...mapState(["menuMini"]),
    style(){
      return {
        height:this.height + "px"
      }
    }
  },
  mounted(){
    this.height = this.$refs.fixedCon.offsetHeight
  }
};
</script>