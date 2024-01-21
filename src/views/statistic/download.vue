<style scoped>
.expand-row {
  padding: 15px 0;
  border-top: 1px solid #e1e1e1;
  font-size: 16px;
}
</style>
<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="6")
      DatePicker(type="datetimerange" format="yyyy/MM/dd" :options="options" style="width:100%" :value="date", :placeholder="$lang('周期')"  @on-change="change")
  Table(:columns="list", :data="times")
</template>
<script>
export default {
  data() {
    return {
      date: [
        new Date(Date.now() - 86400000 * 15).format("yyyy-MM-dd"),
        new Date(Date.now() - 86400000).format("yyyy-MM-dd")
      ],
      options: {
        disabledDate(date) {
          return (
            date.valueOf() > Date.now() - 86400000 ||
            date.valueOf() < new Date("2019-06-24")
          );
        }
      },
      list: [
        {
          title: this.$lang("资产"),
          type: "balance",
          minWidth: 130,
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=balance&date=${params.row.date}`
                }
              },
              params.row.date
            );
          }
        },
        {
          title: this.$lang("成交明细"),
          type: "trade_detail",
          minWidth: 170,
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=trade_detail&date=${params.row.date}`
                }
              },
              params.row.date
            );
          }
        },
        {
          title: this.$lang("OTC订单"),
          type: "otc_order",
          minWidth: 130,
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=otc_order&date=${params.row.date}`
                }
              },
              params.row.date
            );
          }
        },
        {
          title: this.$lang("充币记录"),
          type: "deposit_order",
          minWidth: 140,
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=deposit_order&date=${params.row.date}`
                }
              },
              params.row.date
            );
          }
        },
        {
          title: this.$lang("提币记录"),
          type: "withdraw_order",
          minWidth: 160,
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=withdraw_order&date=${params.row.date}`
                }
              },
              params.row.date
            );
          }
        },
        {
          title: this.$lang("用户注册记录"),
          type: "user_register",
          minWidth: 130,
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=user_register&date=${params.row.date}`
                }
              },
              params.row.date
            );
          }
        },
        {
          title: this.$lang("用户KYC记录"),
          type: "user_kyc",
          minWidth: 130,
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=user_kyc&date=${params.row.date}`
                }
              },
              params.row.date
            );
          }
        },
        {
          title: this.$lang("用户登录记录"),
          type: "user_login",
          minWidth: 130,
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=user_login&date=${params.row.date}`
                }
              },
              params.row.date
            );
          }
        },
        {
          title: this.$lang("合约持仓快照"),
          type: "contract_position",
          minWidth: 190,
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=contract_position&date=${params.row.date}`
                }
              },
              params.row.date
            );
          }
        },
        {
          title: this.$lang("资产流水"),
          type: "balance_flow",
          minWidth: 130,
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=balance_flow&date=${params.row.date}`
                }
              },
              params.row.date
            );
          }
        },
        {
          title: this.$lang("锁仓余额"),
          type: "lock_position",
          minWidth: 150,
          render: (h, params) => {
            return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=lock_position&date=${params.row.date}`
                }
              },
              params.row.date
            );
          }
        },
        {
          title: this.$lang("分佣明细"),
          type: "lock_position",
          minWidth: 150,
          render: (h, params) => {
            if(params.row.date>'2020-08-01'){
              return h(
              "a",
              {
                attrs: {
                  href: `/api/v1/statistic/download_data?type=trade_commission&date=${params.row.date}`
                }
              },
              params.row.date
            );
            }else{
              return h("span","---")
            }
            
          }
        }
      ],
      listData: []
    };
  },
  methods: {
    change(date) {
      this.date = date;
    }
  },
  computed: {
    times() {
      let arr = [];
      if (this.date[0] && this.date[1]) {
        let start = new Date(this.date[0]).getTime();
        let end = new Date(this.date[1]).getTime();
        while (start <= end) {
          arr.unshift({
            date: new Date(start).format("yyyy-MM-dd")
          });
          start += 86400000;
        }
      }
      return arr;
    }
  }
};
</script>