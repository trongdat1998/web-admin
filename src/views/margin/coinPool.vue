<!--币池管理-->
<template lang="pug">
  Main.page-exchange
    Table(:columns="columns", :data="listData", :loading="loadingTable")
</template>
<script>
  import { mapState } from "vuex";
  export default {
    computed: {
      ...mapState(["lang"]),
    },
    data() {
      return {
        // accountId: '',
        // accountName: '',
        // accountType: '',
        showType: '',
        showModal: false,
        formData: {
        },
        searchForm: {
          endId: 0,
          fromId: 0,
          limit: 100
        },
        locale: this.$i18n.locale,
        localeDetail: [],
        loading: false,

        loadingTable: false,

        columns: [
          {
            title: this.$lang("币种"),
            minWidth: 120,
            key:"tokenId",
          },
          {
            title: this.$lang("可借"),
            minWidth: 120,
            key:"loanable",
          },
          /*{
            title: this.$lang("已借"),
            minWidth: 120,
            key:"borrowed",
          },*/
        ],
        listData: []
      };
    },
    methods: {
      loadData() {
        this.loadingTable = true;
        this.$axios
          .get("/api/v1/margin/get/pool_account", {})
          .then(result => {
            this.loadingTable = false;
            if (result.code == 0 && result.data) {
              // this.accountId = result.data.accountId;
              // this.accountName = result.data.accountName;
              // this.accountType = result.data.accountType == 1 ? this.$lang('币池账户') : this.$lang('非币池账户');
              this.listData = result.data.tokenList;
            }
          });
      },
    },
    created() {
      this.loadData();
    }
  };
</script>
