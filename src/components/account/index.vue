<template lang="pug">
span
  Icon.ivu-load-loop(v-if="loading" type="ios-loading")
  a.v-user(@click.prevent="redirect" v-else)
    template(v-if="showSlot")
      slot
    template(v-else) {{id}}
</template>
<script>
export default {
  data() {
    return {
      showSlot: true,
      loading: false
    };
  },
  props: {
    id: {
      type: String,
      default: ""
    }
  },
  methods: {
    async redirect() {
      this.loading = true;
      let result = await this.$axios.post(
        "/api/v1/brokeruser/get_broker_user",
        { accountId: this.id }
      );
      this.loading = false;
      if (result.code == 0 && result.data) {
        window.open("/user/detail/" + result.data.userId);
      }
    }
  },
  mounted() {
    this.showSlot = this.$slots.default !== undefined;
  }
};
</script>