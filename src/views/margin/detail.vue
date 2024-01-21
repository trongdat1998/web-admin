<!--借币，还币，持仓，强平仓查询-->
<template lang="pug">
  Main.page-exchange
    Row.search(:gutter="15")
      Col(span="8")
        Input(v-model="searchForm.userId", placeholder="UserID")
      Col(span="12")
        Input(v-model="searchForm.accountId", placeholder="AccountID")
      Col(span="4")
        Button(type="primary" @click="loadDeatilData" icon="md-search" long) {{$lang("搜索")}}
    div
      Tabs(:value="detailTab" style="margin-top:12px")
        TabPane(:label="$lang('借贷记录')" name="tab1")
          Table(:columns="borrowRecordColumns", :data="borrowRecordData", :loading="loadingDetailTable")
          Row(:gutter="20" style="padding-top:30px")
            Col(span="10")
              ButtonGroup
                Button(@click="getFirstBorrowData" :disabled="searchForm.fromLoanId===''" icon="ios-skip-backward")
                Button(@click="getNextBorrowData" :disabled="borrowRecordData.length<searchForm.limit" icon="ios-arrow-forward")
        TabPane(:label="$lang('还币记录')" name="tab2")
          Table(:columns="repayRecordColumns", :data="repayRecordData", :loading="loadingDetailTable")
          Row(:gutter="20" style="padding-top:30px")
            Col(span="10")
              ButtonGroup
                Button(@click="getFirstRecordData" :disabled="searchForm.fromRepayId===''" icon="ios-skip-backward")
                Button(@click="getNextRecordData" :disabled="repayRecordData.length<searchForm.limit" icon="ios-arrow-forward")
        TabPane(:label="$lang('持仓记录')" name="tab3")
          Table(:columns="positionRecordColumns", :data="positionRecordData", :loading="loadingDetailTable")
</template>
<!--TabPane(:label="$lang('强平记录')" name="tab4")-->
<!--Table(:columns="closeRecordColumns", :data="closeRecordData", :loading="loadingDetailTable")-->
<!--Row(:gutter="20" style="padding-top:30px")-->
<!--Col(span="10")-->
<!--ButtonGroup-->
<!--Button(@click="getFirstCloseData" :disabled="searchForm.fromOrderId===''" icon="ios-skip-backward")-->
<!--Button(@click="getNextCloseData" :disabled="closeRecordData.length<searchForm.limit" icon="ios-arrow-forward")-->
<script>
  import { mapState } from "vuex";
  export default {
    computed: {
      ...mapState(["lang"]),
    },
    data() {
      return {
        detailTab: 'tab1',
        searchForm: {
          accountId: '',
          userId: '',
          fromLoanId: '',
          fromRepayId: '',
          fromOrderId: '',
          limit: 10,
        },
        borrowRecordData: [],
        positionRecordData: [],
        repayRecordData: [],
        closeRecordData: [],
        loadingDetailTable: false,
        // 借贷记录
        borrowRecordColumns: [
          {
            title: this.$lang("借贷订单ID"),
            key:"loanOrderId",
            width: 170,
          },
          {
            title: this.$lang("借贷时间"),
            key:"createdAt",
            width: 170,
            render: (h, params) =>
              h("span", this.newDate(params.row.createdAt).format())
          },
          {
            title: this.$lang("币种"),
            key:"tokenId",
          },
          {
            title: this.$lang("借贷数量"),
            key:"loanAmount",
          },
          {
            title: this.$lang("已还数量"),
            key:"repaidAmount",
          },
          {
            title: this.$lang("未还数量"),
            key:"unpaidAmount",
          },
          {
            title: this.$lang("未还利息"),
            key:"interestUnpaid",
          },
          {
            title: this.$lang("已还利息"),
            key:"interestPaid",
          }
        ],
        // 持仓记录
        positionRecordColumns: [
          {
            title: this.$lang("币种"),
            key:"tokenId",
          },
          {
            title: this.$lang("可用"),
            key:"available",
          },
          {
            title: this.$lang("冻结"),
            key:"locked",
          },
          {
            title: this.$lang("已借"),
            key:"borrowed",
          }
        ],
        // 还币记录
        repayRecordColumns: [
          {
            title: this.$lang("还币记录ID"),
            key:"repayOrderId",
          },
          {
            title: this.$lang("还币时间"),
            key:"createdAt",
            render: (h, params) =>
              h("span", this.newDate(params.row.createdAt).format())
          },
          {
            title: this.$lang("币种"),
            key:"tokenId",
          },
          {
            title: this.$lang("还币数量"),
            key:"amount",
          },
          {
            title: this.$lang("还息数量"),
            key:"interest",
          },
          {
            title: this.$lang("借贷订单ID"),
            key:"loanOrderId",
          }
        ],
        // 强平记录
        closeRecordColumns: [
          {
            title: this.$lang("时间"),
            key:"time",
            width: 170,
            render: (h, params) =>
              h("span", this.newDate(params.row.time).format())
          },
          {
            title: this.$lang("交易币对"),
            key:"symbolName",
          },
          {
            title: this.$lang("方向"),
            key:"side",
          },
          {
            title: this.$lang("价格"),
            key:"price",
          },
          {
            title: this.$lang("数量"),
            key:"origQty",
          },
          {
            title: this.$lang("委托总额"),
            key:"price",
            render: (h, params) =>
              h("span", params.row.price * params.row.origQty) // 价格 * 数量
          },
          {
            title: this.$lang("成交数量"),
            key:"executedQty",
          },
          {
            title: this.$lang("成交价格"),
            key:"avgPrice",
          },
          {
            title: this.$lang("状态"),
            key:"status",
          },
        ],
      };
    },
    methods: {
      loadDeatilData() {
        if (this.searchForm.accountId.trim() || this.searchForm.userId.trim()) {
          this.borrowRecord();
          this.repayRecord();
          this.positionRecord();
          // this.closeRecord();
        }
      },
      borrowRecord() {
        this.loadingDetailTable = true;
        this.$axios.get("/api/v1/margin/detail/get/cross_loan_order", {
          params: {
            ...this.searchForm,
          },
        }).then(result => {
          this.loadingDetailTable = false;
          if (result.code == 0 && result.data) {
            this.borrowRecordData = result.data;
          }
        });
      },
      getFirstBorrowData() {
        this.searchForm.fromLoanId = '';
        this.borrowRecord();
      },
      getNextBorrowData() {
        this.searchForm.fromLoanId = this.borrowRecordData.slice(-1)[0].loanOrderId;
        this.borrowRecord();
      },
      repayRecord() {
        this.loading = true;
        this.$axios.get("/api/v1/margin/detail/get/repay_record", {
          params: {
            ...this.searchForm,
          },
        }).then(result => {
          this.loading = false;
          if (result.code == 0 && result.data) {
            this.repayRecordData = result.data;
          }
        });
      },
      getFirstRecordData() {
        this.searchForm.fromRepayId = '';
        this.repayRecord();
      },
      getNextRecordData() {
        this.searchForm.fromRepayId = this.repayRecordData.slice(-1)[0].repayOrderId;
        this.repayRecord();
      },
      positionRecord() {
        this.loading = true;
        this.$axios.get("/api/v1/margin/detail/user_position_detail/query", {
          params: {
            ...this.searchForm,
          },
        }).then(result => {
          this.loading = false;
          if (result.code == 0 && result.data) {
            this.positionRecordData = result.data;
          }
        });
      },
      closeRecord() {
        this.$axios.get("/api/v1/margin/detail/force_close/query", {
          params: {
            ...this.searchForm,
          },
        }).then(result => {
          if (result.code == 0 && result.data) {
            this.closeRecordData = result.data;
          }
        });
      },
      getFirstCloseData() {
        this.searchForm.fromOrderId = '';
        this.repayRecord();
      },
      getNextCloseData() {
        this.searchForm.fromOrderId = this.repayRecordData.slice(-1)[0].orderId;
        this.repayRecord();
      },
    },
    created() {
    }
  };
</script>
