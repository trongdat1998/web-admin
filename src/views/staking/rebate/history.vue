<template lang="pug">
.page-exchange
  Table(:columns="columns", :data="data", :loading="loadingTable")
    template(slot-scope="{ row, index }", slot="tag")
      span.border(:style="objectStyle(row)") {{ tag(row) }}
    template(slot-scope="{ row, index }", slot="show")
      iSwitch(
        v-model="row.isShow",
        :disabled="isRead",
        :false-value="0",
        :true-value="1",
        @on-change="online(row, index)",
        :loading="index === editIndex",
        size="small"
      )
    template(slot-scope="{ row, index }", slot="action")
      a(:href="`/staking/product/${row.productId}/${productType}`") {{ $lang('查看') }}
  div(style="padding-top:30px")
    ButtonGroup
      Button(
        icon="md-skip-backward",
        @click="first",
        :disabled="searchForm.pageNo == 1 || loadingTable"
      )
      Button(
        icon="ios-arrow-forward",
        @click="next",
        :disabled="data.length < searchForm.size || loadingTable"
      )
</template>
<script>
import { mapState } from "vuex";
import {Decimal} from 'decimal.js';
export default {
  props: {
    loadingTable: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    productType: {
      type: Number,
      default() {
        return 0;
      },
    },
  },
  computed: {
    ...mapState(["lang", "isRead"]),
  },
  data() {
    return {
      editIndex: null,
      searchForm: {
        productType: "",
        pageNo: 1,
        size: 100,
      },
      types: {
        0: this.$lang("定期"),
        2: this.$lang("定期锁仓"),
        1: this.$lang("活期"),
      },

      dividendTypes: {
        0: this.$lang("分期付息"),
        1: this.$lang("一次性还本付息"),
      }, //派息方式:

      calcTypes: {
        0: this.$lang("利率"),
        1: this.$lang("金额"),
      }, //类型

      loading: false,
      columns: [],
      defaultColumns: [
        {
          title: this.$lang("发行币种"),
          minWidth: 100,
          key: "tokenName",
        },
        {
          title: this.$lang("本金额度"),
          minWidth: 160,
          key: "principalAmount",
          render: (h, params) =>
            h("span", params.row.principalAmount + params.row.tokenName),
        },
        {
          title: this.$lang("开始计息时间"),
          minWidth: 190,
          key: "rebateDate",
          render: (h, params) =>
            h("span", this.newDate(params.row.rebateDate).format()),
        },
        {
          title: this.$lang("利率"),
          minWidth: 120,
          key: "rebateRate",
          render: (h, params) =>
            h(
              "span",
              new Decimal(params.row.rebateRate).mul(new Decimal(100)) + "%"
            ),
        },
        {
          title: this.$lang("期数"),
          width: 100,
          key: "numberOfPeriods",
          //slot: "show",
        },
        {
          title: this.$lang("派息额度"),
          width: 160,
          fixed: "right",
          align: "center",
          render: (h, params) =>
            h("span", params.row.interestAmount + params.row.tokenName),
        },

        {
          title: this.$lang("操作"),
          fixed: "right",
          align: "center",
          slot: "action",
          width: 160,
        },
      ],
    };
  },
  methods: {
    first() {
      this.searchForm.pageNo = 1;
      this.loadData();
    },
    next() {
      this.searchForm.pageNo = this.searchForm.pageNo + 1;
      this.loadData();
    },
    loadData() {
      this.loadingTable = true;
      Object.assign(this.searchForm, {productType: this.productType});
      this.$axios
        .post("/api/v1/staking/product/rebate/history_list", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.data = result.data;
          }
        });
    },
  },
  mounted() {
    if (this.productType == 1) {
      this.columns = [
        {
          title: this.$lang("名称"),
          minWidth: 160,
          key: "productName",
        },
        {
          title: this.$lang("类型"),
          minWidth: 100,
          key: "rebateCalcWay",
          render: (h, params) =>
            h("span", this.calcTypes[params.row.rebateCalcWay]),
        },
        ...this.defaultColumns,
      ]
    } else {
      this.columns = [
        {
          title: this.$lang("名称"),
          minWidth: 160,
          key: "productName",
        },
        {
          title: this.$lang("类型"),
          minWidth: 100,
          key: "rebateCalcWay",
          render: (h, params) =>
            h("span", this.calcTypes[params.row.rebateCalcWay]),
        },
        {
          title: this.$lang("付息方式"),
          minWidth: 100,
          key: "dividendType",
          render: (h, params) =>
            h("span", this.dividendTypes[params.row.dividendType]),
        },
        ...this.defaultColumns,
      ]
    }
  },
};
</script>
