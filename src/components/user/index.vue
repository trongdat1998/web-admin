<template lang="pug">
a.v-user(:href="`/user/detail/${uid}`" target="_blank")
  template(v-if="showSlot")
    slot
  template(v-else) {{uid}}
</template>
<script>
export default {
  data(){
    return{
      showSlot: true
    }
  },
  props: {
    uid: {
      type: String,
      default: ""
    }
  },mounted() {
    this.showSlot = this.$slots.default !== undefined;
  }
};
</script>