<template lang="pug">
  Table(:columns="columns", :data="listData" :loading="loading")
</template>
<script>
export default {
  props: {
    searchForm: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      listData: [],
      columns: [
        {
          title: this.$lang("币种"),
          minWidth: 160,
          key: "tokenName"
        },
        {
          title: this.$lang("地址"),
          minWidth: 160,
          key: "address"
        },
        {
          title: this.$lang("备注"),
          minWidth: 160,
          key: "remark"
        }
      ]
    };
  },
  created() {
    this.loading=true
    this.$axios
      .post("/api/v1/brokeruser/get_withdraw_address", this.searchForm)
      .then(result => {
        this.loading = false;
        if (result.code == 0) {
          this.listData = result.data;
        }
      });
  }
};
</script>