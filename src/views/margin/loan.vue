<!--借贷查询-->
<template lang="pug">
  Main.page-exchange
    Row.search(:gutter="15")
      Col(span="4")
        Input(v-model="searchForm.userId", placeholder="UserID")
      Col(span="4")
        Input(placeholder="AccountID", v-model="searchForm.accountId")
      Col(span="4")
        Input(:placeholder="$lang('借币订单ID')", v-model="searchForm.loanId")
      Col(span="4")
        Select(:placeholder="$lang('状态')", v-model="searchForm.status", filterable, clearable)
          Option(:value="2") {{$lang("已还币")}}
          Option(:value="1") {{$lang("借款中")}}
      Col(span="8")
        Input(search, :placeholder="$lang('币种')", v-model="searchForm.tokenId", enter-button="" @on-search="loadData()")
    Table(:columns="columns", :data="listData", :loading="loadingTable")
      template(slot-scope="{ row, index }" slot="action")
        a(@click.prevent="detail(row)") {{$lang("还币详情")}}
    Row(:gutter="20" style="padding-top:30px")
      Col(span="10")
        ButtonGroup
          Button(@click="getFirstData" :disabled="searchForm.fromLoanId===''" icon="ios-skip-backward")
          Button(@click="getNextData" :disabled="listData.length<searchForm.limit" icon="ios-arrow-forward")
    Modal(v-model="showModal", :title="$lang('标识')" width="80")
      Table(:columns="dialogColumns", :data="dialogListData", :loading="loadingTable")
</template>
<script>
import { Decimal } from "decimal.js";
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["lang"]),
  },
  data() {
    return {
      showModal: false,
      formData: {},
      searchForm: {
        limit: 10,
        accountId: "",
        userId: "",
        tokenId: "",
        loanId: "",
        status: "",
        fromLoanId: "",
      },
      loading: false,
      loadingTable: false,
      columns: [
        {
          title: this.$lang("借币订单ID"),
          minWidth: 130,
          key: "loanOrderId",
        },
        {
          title: this.$lang("账户ID"),
          minWidth: 130,
          key: "accountId",
        },
        {
          title: this.$lang("币种"),
          minWidth: 80,
          key: "tokenId",
        },
        {
          title: this.$lang("借币数量"),
          minWidth: 120,
          key: "loanAmount",
        },
        {
          title: this.$lang("还币数量"),
          minWidth: 120,
          key: "repaidAmount",
        },
        {
          title: this.$lang("未还数量"),
          minWidth: 120,
          key: "unpaidAmount",
        },
        {
          title: this.$lang("状态"),
          minWidth: 80,
          key: "status",
          render: (h, params) => {
            if (params.row.status == 2) {
              return h(
                "Tag",
                {
                  attrs: { color: "primary" },
                },
                this.$lang("已还币")
              );
            } else if (params.row.status == 1) {
              return h(
                "Tag",
                {
                  attrs: { color: "warning" },
                },
                this.$lang("借款中")
              );
            }
            return h("span", "");
          },
        },
        {
          title: this.$lang("秒利率"),
          minWidth: 120,
          key: "interestRate1",
        },
        {
          title: this.$lang("已还利息"),
          minWidth: 120,
          key: "interestPaid",

        },
        {
          title: this.$lang("未还利息"),
          minWidth: 120,
          key: "interestUnpaid",
        },
        {
          title: this.$lang("创建时间"),
          minWidth: 100,
          key: "createdAt",
          render: (h, params) =>
            h("span", this.newDate(params.row.createdAt).format()),
        },
        {
          title: this.$lang("更新时间"),
          minWidth: 100,
          key: "updatedAt",
          render: (h, params) =>
            h("span", this.newDate(params.row.updatedAt).format()),
        },
        {
          title: this.$lang("记息时间"),
          minWidth: 100,
          key: "interestStart",
          render: (h, params) =>
            h("span", this.newDate(params.row.interestStart).format()),
        },
        {
          title: this.$lang("操作"),
          fixed: "right",
          align: "center",
          slot: "action",
          width: 120,
        },
      ],
      listData: [],
      dialogListData: [],
      dialogColumns: [
        {
          title: this.$lang("还币订单ID"),
          minWidth: 120,
          key: "repayOrderId",
        },
        {
          title: this.$lang("借币订单ID"),
          minWidth: 120,
          key: "loanOrderId",
        },
        {
          title: this.$lang("账户ID"),
          minWidth: 190,
          key: "accountId",
        },
        {
          title: this.$lang("clientOrderId"),
          minWidth: 190,
          key: "clientId",
        },
        {
          title: this.$lang("币种"),
          minWidth: 120,
          key: "tokenId",
        },
        {
          title: this.$lang("还币数量"),
          minWidth: 120,
          key: "amount",
        },
        {
          title: this.$lang("利息"),
          minWidth: 120,
          key: "interest",
        },
      ],
    };
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      this.$axios
        .get("/api/v1/margin/order/get/cross_loan_order", {
          params: {
            ...this.searchForm,
          },
        })
        .then((result) => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    getFirstData() {
      this.searchForm.fromLoanId = "";
      this.loadData();
    },
    getNextData() {
      this.searchForm.fromLoanId = this.listData.slice(-1)[0].loanOrderId;
      this.loadData();
    },
    detail(row) {
      this.$axios
        .get("/api/v1/margin/order/get/repay_record", {
          params: {
            accountId: row.accountId,
            loanOrderId: row.loanOrderId,
          },
        })
        .then((result) => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.dialogListData = result.data;
          }
        });
      this.showModal = true;
    },
  },
  created() {
    // this.loadData();
  },
};
</script>
