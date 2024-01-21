<!--报表查询-->
<template lang="pug">
	.page-exchange
		div(v-if="showList")
			Row.search(:gutter="15")
				Col(span="24")
					Input(search, :placeholder="$lang('币种')", v-model="searchForm.tokenId", enter-button="" @on-search="loadData()")

			Table(:columns="columns", :data="listData", :loading="loading")
				template(slot-scope="{ row, index }" slot="action")
					a(@click.prevent="detail(row)") {{$lang("详情")}}
		div(v-else)
			Row(:gutter="15" style="margin-bottom: 12px")
				Col(span="20")
					Button(@click="showList = true") {{$lang('返回')}}
			Row.search(:gutter="15")
				Col(span="6")
					Input(v-model="searchDetailForm.userId", placeholder="UID")
				Col(span="6")
					Input(placeholder="AccountID", v-model="searchDetailForm.accountId")
				Col(span="12")
					Input(search, :placeholder="$lang('借币订单ID')", v-model="searchDetailForm.loanId", enter-button="" @on-search="loadDetailData()")
			Table(:columns="detailColumns", :data="detailListData", :loading="loading")
			ButtonGroup(style="margin-top:12px")
				Button(@click="getFirstData" :disabled="searchDetailForm.fromLoanId===''" icon="ios-skip-backward")
				Button(@click="getNextData" :disabled="listData.length<searchDetailForm.limit" icon="ios-arrow-forward")
</template>
<script>
  import { mapState } from "vuex";
  export default {
    computed: {
      ...mapState(["lang"]),
    },
    data() {
      return {
        currentRow: null,
        showList: true,
        formData: {},
        searchForm: {
          tokenId: "",
        },
        searchDetailForm: {
          userId: "",
          accountId: "",
          loanId: "",
          limit: 100,
        },
        loading: false,
        columns: [
          {
            title: this.$lang("币种"),
            minWidth: 80,
            key: "tokenId",
          },
          {
            title: this.$lang('期初数量'),
            minWidth: 150,
	          key: "beginAmount",
          },
          {
            title: this.$lang("可用数量"),
            minWidth: 150,
            key: "available",
          },
          {
            title: this.$lang("未还数量"),
            minWidth: 150,
            key: "unpaidAmount",
            sortable: true,
            sortType: "desc",
          },
          {
            title: this.$lang("累计利息"),
            minWidth: 150,
            key: "totalInterest",
          },
          {
            title: this.$lang("已还利息"),
            minWidth: 150,
            key: "interestPaid",
          },
          {
            title: this.$lang("未还利息"),
            minWidth: 150,
            key: "interestUnpaid",
          },
          {
            title: this.$lang("创建时间"),
            minWidth: 100,
            key: "created",
            render: (h, params) =>
              h("span", this.newDate(params.row.created).format('yyyy/MM/dd hh:mm:ss')),
          },
          {
            title: this.$lang("更新时间"),
            minWidth: 100,
            key: "updated",
            render: (h, params) =>
              h("span", this.newDate(params.row.updated).format('yyyy/MM/dd hh:mm:ss')),
          },
          {
            title: this.$lang("操作"),
            fixed: "right",
            align: "center",
            slot: "action",
            width: 80,
          },
        ],
        listData: [],
        detailListData: [],
        detailColumns: [

          {
            title: this.$lang("AccountId"),
            minWidth: 120,
            key: "accountId",
          },
          {
            title: this.$lang("借币订单ID"),
            minWidth: 120,
            key: "loanOrderId",
          },
          {
            title: this.$lang("客户订单ID"),
            minWidth: 120,
            key: "clientId",
          },
          {
            title: this.$lang("币种"),
            minWidth: 120,
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
            title: this.$lang("秒利率"),
            minWidth: 120,
            key: "interestRate1",
          },
          {
            title: this.$lang("状态"),
            minWidth: 120,
            key: "status",
            render: (h, params) => {
              if (params.row.status == 1) {
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
            minWidth: 190,
            key: "createdAt",
            render: (h, params) =>
              h("span", this.newDate(params.row.createdAt).format()),
          },
          {
            title: this.$lang("更新时间"),
            minWidth: 190,
            key: "updatedAt",
            render: (h, params) =>
              h("span", this.newDate(params.row.updatedAt).format()),
          },
          {
            title: this.$lang("记息时间"),
            minWidth: 190,
            key: "interestStart",
            render: (h, params) =>
              h("span", this.newDate(params.row.interestStart).format()),
          },
        ],
      };
    },
    methods: {
      loadData() {
        this.loading = true;
        this.$axios
          .get("/api/v1/margin/rpt/margin_pool", {
            params: {
              ...this.searchForm,
            },
          })
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              this.listData = result.data;
            }
          });
      },
      getFirstData() {
        this.searchDetailForm.fromLoanId = "";
        this.loadDetailData();
      },
      getNextData() {
        this.searchDetailForm.fromLoanId = this.detailListData.slice(
          -1
        )[0].loanOrderId;
        this.loadDetailData();
      },
      detail(row) {
        this.currentRow = row;
        this.showList = false;
        this.loadDetailData();
      },
      loadDetailData() {
        this.loading = true;
        this.$axios
          .get("/api/v1/margin/rpt/margin_pool/cross_loan_order", {
            params: {
              status: 1,
              tokenId: this.currentRow.tokenId,
              ...this.searchDetailForm,
            },
          })
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              this.detailListData = result.data;
            }
          });
      },
    },
    created() {
      this.loadData();
    },
  };
</script>
