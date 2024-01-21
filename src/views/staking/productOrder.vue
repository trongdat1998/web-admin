<!--理财订单-->
<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4") &nbsp;
    Col(span="16")
      Input(search :placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')}`", v-model="inputInfo", enter-button="" @on-search="loadData")
  Table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{ row, index }", slot="action")
      router-link(:to="`/staking/productOrderDetail/${row.orderId}/${row.productId}`") {{$lang("详情")}}
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
      inputInfo: "",
      color: {
        0: "primary",
        1: "primary",
        2: "success",
        3: "error",
        4: "primary",
        5: "success"
      },
      searchForm: {
        userId: "",
        phone: "",
        email: "",
        startId: 0,
        limit: 100,
        productId: '',
      },
      dividendTypes: {
        0: this.$lang("分期付息"),
        1: this.$lang("一次性还本付息"),
      }, //派息方式:
      orderType: {
        0: this.$lang("申购"),
        1: this.$lang("赎回"),
        2: this.$lang("赎回还本"),
      },
      //产品状态
      status: {
        0: this.$lang("待认购"),
        1: this.$lang("认购中"),
        2: this.$lang("认购结束"),
        3: this.$lang("已售罄"),
        4: this.$lang("计息中"),
        5: this.$lang("已结束"),
      },
      loading: false,
      loadingTable: false,
      columns: [],
      defaultColumns: [
        {
          title: "#",
          width: 60,
          type:"index"
        },
        {
          title: this.$lang("申购时间"),
          minWidth: 190,
          key: "createdAt",
          render: (h, params) =>
            h("span", this.newDate(params.row.createdAt).format()),
        },
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
          title: this.$lang("订单号"),
          minWidth: 160,
          key: "orderId",
        },
        {
          title: this.$lang("持有金额"),
          minWidth: 100,
          key: "payAmount",
          render: (h, params) =>
            h("span", `${params.row.payAmount}${params.row.tokenName}`),
        },
      ],
      listData: [],
    };
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      let productType = this.$route.params.productType;
      if (productType == 1) { // 1 活期
        this.columns = [
          ...this.defaultColumns,
          {
            title: this.$lang("操作类型"),
            minWidth: 100,
            key: "orderType",
            render: (h, params) =>
              h("span", this.orderType[params.row.orderType]),
          },
        ]
      } else {
        this.columns = [
          ...this.defaultColumns,
          {
            title: this.$lang("还款类型"),
            minWidth: 100,
            key: "dividendType",
            render: (h, params) =>
              h("span", this.dividendTypes[params.row.dividendType]),
          },
          {
            title: this.$lang("期限"),
            minWidth: 100,
            render: (h, params) =>
              h("span", `${params.row.timeLimit}${this.$lang("天")}`),
          },
          {
            title: this.$lang("到期时间"),
            minWidth: 190,
            key: "productEndDate",
            render: (h, params) =>
              h("span", this.newDate(params.row.productEndDate).format()),
          },
          {
            title: this.$lang("状态"),
            minWidth: 160,
            key: "status",
            render: (h, p) =>
              h(
                "Tag",
                {
                  props: {
                    color: this.color[p.row.status]
                  }
                },
                this.$lang(this.status[p.row.status])
              )
          },
          {
            title: this.$lang("操作"),
            fixed: "right",
            align: "center",
            slot: "action",
            width: 120,
          },
        ]
      }
      Object.assign(this.searchForm,{productId: this.$route.params.id});
      Object.assign(this.searchForm, formatParams(this.inputInfo));
      this.$axios
        .post("/api/v1/staking/product/order_list", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    getNextData() {
      this.searchForm.startId = this.listData.slice(-1)[0].orderId;
      this.loadData();
    },
    getFirstData() {
      this.searchForm.startId = 0;
      this.loadData();
    },
  },
  created() {
    this.loadData();
  },
};
</script>
