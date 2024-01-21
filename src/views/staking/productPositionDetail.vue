<!--派息详情-->
<template lang="pug">
Main.page-exchange
  Row.search
    Row(:gutter="24")
      Col(span="6") {{$lang("UID")}}
      Col(span="6") {{$lang("名称")}}
      Col(span="6") {{$lang("持有金额")}}
      Col(span="6") {{$lang("结束时间")}}
    Row(:gutter="24")
      Col(span="6") {{productOrderData.userId}}
      Col(span="6") {{productOrderData.productName}}
      Col(span="6") {{productOrderData.amount}}{{productOrderData.tokenId}}
      Col(span="6") {{productOrderData.productEndDate ? newDate(productOrderData.productEndDate).format() : ''}}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
<!--  Row(:gutter="20" style="padding-top:30px")-->
<!--    Col(span="10")-->
<!--      ButtonGroup-->
<!--        Button(@click="getFirstData" icon="ios-skip-backward" :disabled="searchForm.startId==0")-->
<!--        Button(@click="getNextData" :disabled="listData.length<searchForm.size" icon="ios-arrow-forward")-->
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["lang", "isRead"]),
  },
  data() {
    return {
      productOrderData: {
        userId: '',
        productName: '',
        amount: '',
        productEndDate: '',
      },
      inputInfo: "",
      searchForm: {
        // startId: 0,
        // size: 100,
      },
      loading: false,
      loadingTable: false,
      columns: [
        {
          title: this.$lang("发放时间"),
          minWidth: 190,
          key: "rebateDate",
          render: (h, params) =>
            h("span", this.newDate(params.row.rebateDate).format()),
        },
        {
          title: this.$lang("发放金额"),
          minWidth: 120,
          render: (h, params) =>
            h("span", `${params.row.rebateAmount}${params.row.tokenName}`),
        },
        {
          title: this.$lang("状态"),
          minWidth: 160,
          render: (h, p) =>
            h(
              "Tag",
              this.$lang("已完成")
            )
        },
      ],
      listData: [],
    };
  },
  methods: {
    loadData() {
      this.loadOrder();
      this.loadingTable = true;
      Object.assign(this.searchForm, {userId: this.$route.params.userId}, {productId: this.$route.params.productId});
      this.$axios
        .post("/api/v1/staking/product/current/repayment_schedule", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    getNextData() {
      this.searchForm.startId = this.listData.slice(-1)[0].rebateDate;
      this.loadData();
    },
    getFirstData() {
      this.searchForm.startId = 0;
      this.loadData();
    },
    loadOrder() {
      let data = {
        limit: 10,
      };
      Object.assign(data, {productId: this.$route.params.productId});
      this.$axios
        .post("/api/v1/staking/product/current/asset/list", data)
        .then((result) => {
          if (result.code == 0) {
            Object.assign(this.productOrderData, result.data[0]);
          }
        });
    },
  },
  created() {
    this.loadData();
  },
};
</script>
