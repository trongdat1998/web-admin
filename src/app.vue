<template lang="pug">
div(id="main")
  router-view
</template>
<script>
import { mapActions } from "vuex";
let fn = null;
export default {
  methods: {
    ...mapActions(["setHeight", "setMenu"]),
    resize() {
      clearTimeout(fn)
      fn = setTimeout(() => {
        this.setHeight();
        if (typeof sessionStorage.menuMini === "undefined") {
          this.setMenu(document.documentElement.clientWidth <= 1440);
        }
      }, 50);
    }
  },
  mounted() {
    window.addEventListener("resize", this.resize);
    this.resize();
  }
};
</script>