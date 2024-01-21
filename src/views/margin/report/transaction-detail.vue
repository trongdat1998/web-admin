<template lang="pug">
	Table(:columns="columns", :data="listData", :loading="loading")
</template>
<script>
import { thousandFormatNumber } from "@/libs/common.js";
export default {
  props: {
    rid: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      columns: [
        {
          title: this.$lang("币对"),
          minWidth: 80,
          key: "symbolId",
        },
        {
          title: this.$lang("交易人数"),
          minWidth: 80,
          key: "tradePeopleNum",
        },
        {
          title: this.$lang("买入人数"),
          minWidth: 80,
          key: "buyPeopleNum",
        },
        {
          title: this.$lang("卖出人数"),
          minWidth: 80,
          key: "sellPeopleNum",
        },
        {
          title: this.$lang("交易总笔数"),
          minWidth: 80,
          key: "tradeNum",
        },
        {
          title: this.$lang("买入笔数"),
          minWidth: 80,
          key: "buyTradeNum",
        },
        {
          title: this.$lang("卖出笔数"),
          minWidth: 80,
          key: "sellTradeNum",
        },
        {
          title: `${this.$lang("交易额")}(USDT)`,
          minWidth: 120,
          key: "amount",
          render: (h, { row }) => {
            return h('span', thousandFormatNumber(row.amount, 2));
          }
        },

        {
          title: `${this.$lang("手续费折合")}(USDT)`,
          minWidth: 130,
          key: "fee",
          render: (h, { row }) => {
            return h('span', thousandFormatNumber(row.fee, 2));
          }
        },
      ],
      listData: [{}],
      loading: true,
    };
  },
  mounted() {
    this.queryData();
  },
  watch: {
    rid: {
      immediate: true,
      handler() {
        this.queryData();
      },
    },
  },
  methods: {
    queryData() {
      this.loading = true;
      this.$axios
        .get("/api/v1/margin/rpt/margin_trade_detail", {
          params: {
            relationId: this.rid,
          },
        })
        .then((ret) => {
          this.loading = false;
          if (ret.code === 0) {
            this.listData = ret.data;
          }
        });
    },
  },
};
</script>
<style lang="less" scoped></style>
