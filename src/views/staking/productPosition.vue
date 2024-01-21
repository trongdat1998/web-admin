<!--产品持仓-->
<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4") &nbsp;
    Col(span="16")
      Input(search :placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')}`", v-model="inputInfo", enter-button="" @on-search="loadData")
  Table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{ row, index }", slot="repay")
      router-link(:to="`/staking/rateDetail/${row.productId}/${actualApr}`") {{$lang("查看")}}
    template(slot-scope="{ row, index }", slot="action")
      router-link(:to="`/staking/productPositionDetail/${row.userId}/${row.productId}`") {{$lang("查看")}}
  Row(:gutter="20" style="padding-top:30px")
    Col(span="10")
      ButtonGroup
        Button(@click="getFirstData" icon="ios-skip-backward" :disabled="searchForm.startId==0")
        Button(@click="getNextData" :disabled="listData.length<searchForm.limit" icon="ios-arrow-forward")
</template>
<script>
import { mapState } from "vuex";
import { formatParams } from "@/libs/common.js";
export default {
  computed: {
    ...mapState(["lang", "isRead"]),
  },
  data() {
    return {
      actualApr: '',
      inputInfo: "",
      searchForm: {
        userId: "",
        phone: "",
        email: "",
        startId: 0,
        limit: 100,
        productId: '',
      },
      loading: false,
      loadingTable: false,
      columns: [
        {
          title: "UID",
          minWidth: 190,
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId
              }
            })
        },
        {
          title: this.$lang("名称"),
          minWidth: 160,
          key: "productName",
        },
        {
          title: this.$lang("持有金额"),
          minWidth: 100,
          key: "amount",
          render: (h, params) =>
            h("span", `${params.row.amount}${params.row.tokenName}`),
        },
        {
          title: this.$lang("结束时间"),
          minWidth: 190,
          render: (h, params) =>
            h("span", this.newDate(params.row.productEndDate).format()),
        },
        {
          title: this.$lang("还款详情"),
          align: "center",
          slot: "repay",
          width: 120,
        },
        {
          title: this.$lang("派息详情"),
          align: "center",
          slot: "action",
          width: 120,
        },
      ],
      listData: [],
    };
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      Object.assign(this.searchForm,{productId: this.$route.params.id});
      Object.assign(this.searchForm, formatParams(this.inputInfo));
      this.$axios
        .post("/api/v1/staking/product/current/asset/list", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    getNextData() {
      this.searchForm.startId = this.listData.slice(-1)[0].id;
      this.loadData();
    },
    getFirstData() {
      this.searchForm.startId = 0;
      this.loadData();
    },
  },
  created() {
    let id = this.$route.params.id;
    if (id) {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/staking/product/get", { id })
        .then((result) => {
          this.loadData();
          if (result.code == 0) {
            this.actualApr = result.data.actualApr;
          }
        });
    }
  },
};
</script>
