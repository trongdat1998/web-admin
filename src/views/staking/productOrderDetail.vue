<!--订单详情-->
<template lang="pug">
Main.page-exchange
  Row.search
    Row(:gutter="24")
      Col(span="6") {{$lang("申购时间")}}
      Col(span="6") {{$lang("UID")}}
      Col(span="6") {{$lang("名称")}}
      Col(span="6") {{$lang("还款类型")}}
    Row(:gutter="24")
      Col(span="6") {{productOrderData.createdAt ? newDate(productOrderData.createdAt).format() : ''}}
      Col(span="6") {{productOrderData.userId}}
      Col(span="6") {{productOrderData.productName}}
      Col(span="6") {{dividendTypes[productOrderData.dividendType]}}
    Row(:gutter="24" style="margin-top:12px")
      Col(span="6") {{$lang("订单号")}}
      Col(span="6") {{$lang("持有金额")}}
      Col(span="6") {{$lang("期限")}}
      Col(span="6") {{$lang("到期时间")}}
    Row(:gutter="24")
      Col(span="6") {{productOrderData.orderId}}
      Col(span="6") {{productOrderData.payAmount}}{{productOrderData.tokenName}}
      Col(span="6") {{productOrderData.timeLimit ? `${productOrderData.timeLimit}${$lang("天")}` : ''}}
      Col(span="6") {{productOrderData.productEndDate ? newDate(productOrderData.productEndDate).format() : ''}}
    Row(:gutter="24" style="margin-top:12px")
      Col(span="6") {{$lang("状态")}}
    Row(:gutter="24")
      Col(span="6") {{status[productOrderData.status]}}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
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
        createdAt: '',
        userId: '',
        productName: '',
        dividendType: '',
        orderId: '',
        payAmount: '',
        timeLimit: '',
        productEndDate: '',
        status: '',
      },
      inputInfo: "",
      color: {
        0: "primary",
        1: "success"
      },
      searchForm: {
        orderId: '',
      },
      dividendTypes: {
        0: this.$lang("分期付息"),
        1: this.$lang("一次性还本付息"),
      }, //派息方式:
      //产品状态
      status: {
        0: this.$lang("待认购"),
        1: this.$lang("认购中"),
        2: this.$lang("认购结束"),
        3: this.$lang("已售罄"),
        4: this.$lang("计息中"),
        5: this.$lang("已结束"),
      },
      repaymentStatus: {
        0: this.$lang("未派息"),
        1: this.$lang("已派息"),
      },
      loading: false,
      loadingTable: false,
      columns: [
        {
          title: this.$lang("发放次数"),
          minWidth: 100,
          key: "sort",
        },
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
          key: "rebateAmount",
          render: (h, params) =>
            h("span", params.row.rebateAmount == 0 ? this.$lang("浮动") : `${params.row.rebateAmount}${params.row.tokenName}`),
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
              this.$lang(this.repaymentStatus[p.row.status])
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
      Object.assign(this.searchForm,{orderId: this.$route.params.id});
      this.$axios
        .post("/api/v1/staking/product/order/repayment_schedule", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    loadOrder() {
      let data = {
        limit: 1,
      };
      Object.assign(data, {orderId: this.$route.params.id}, {productId: this.$route.params.productId});
      this.$axios
        .post("/api/v1/staking/product/order_list", data)
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
