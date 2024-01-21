<template lang="pug">
Main.page-exchange
  Row.search(:grtter="15")
    Col(span="24")
      Input(search :placeholder="`${$lang('用户手机')} / ${$lang('用户邮箱')}`" v-model="searchForm.receiver", enter-button="" @on-search="loadData")
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
</template>
<script>
export default {
  data() {
    return {
      loading: false,
      loadingTable: false,

      searchForm: {
        receiver: this.$route.query.userId || ""
      },
      listData: [],

      columns: [
        {
          minWidth: 160,
          title: this.$lang("接收号码"),
          key: "receiver"
        },
        {
          minWidth: 160,
          title: this.$lang("接收状态"),
          key: "deliveryStatus"
        },
        {
          minWidth: 160,
          title: this.$lang("状态描述"),
          key: "description"
        },
        {
          minWidth: 160,
          title: this.$lang("内容简述"),
          key: "content"
        },
        {
          minWidth: 190,
          title: this.$lang("发送时间"),
          render: (h, p) => {
            return h(
              "span",
              this.newDate(p.row.created).format("yyyy/MM/dd hh:mm:ss")
            );
          }
        },
        {
          minWidth: 190,
          title: this.$lang("接收时间"),
          render: (h, p) => {
            return h(
              "span",
              p.row.deliveriedAt > 0
                ? this.newDate(p.row.deliveriedAt).format("yyyy/MM/dd hh:mm:ss")
                : "---"
            );
          }
        }
      ]
    };
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/message_record/list_devlivery_records", this.searchForm)
        .then(result => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data ? result.data : [];
          }
        });
    }
  }
};
</script>