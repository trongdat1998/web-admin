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
      loading:false,
      listData:[],
      columns: [
        {
          title: this.$lang("币种"),
          minWidth: 160,
          key: "tokenId"
        },
        {
          title: this.$lang("地址"),
          minWidth: 160,
          key: "address"
        },
        {
          title: "TAG",
          minWidth: 160,
          render: (h, p) =>
            h("span", p.row.addressExt ? p.row.addressExt : "----")
        }
      ]
    }
  },
  created(){
    this.loading =  true;
    this.$axios
      .post("/api/v1/brokeruser/query_deposit_address", this.searchForm)
      .then(result => {
        this.loading = false;
        if (result.code == 0) {
          this.listData = result.data;
        }
      });
  }
}
</script>