<template lang="pug">
  Table(:columns="columns", :data="data", :loading="loading" @on-expand="expand")
</template>
<script>
  import expandRow from './table-expand.vue';
  export default {
    components: { expandRow },
    props: {
      loading: {
        type: Boolean,
        default: false,
      },
      data: {
        type: Array,
        default() {
          return [];
        },
      },
    },
    data() {
      return {
        columns: [
          {
            type: 'expand',
            width: 50,
            render: (h, params) => {
              return h(expandRow, {
                props: {
                  list: params.row.list,
                },
              });
            },
          },
          {
            minWidth: 190,
            title: this.$lang('订单ID'),
            key: 'orderId',
          },
          {
            title: this.$lang('时间'),
            minWidth: 190,
            render: (h, params) =>
              h('span', this.newDate(params.row.created).format()),
          },
          {
            minWidth: 190,
            title: this.$lang('最后更新'),
            render: (h, params) =>
              h(
                'span',
                params.row.updated > 0
                  ? this.newDate(params.row.updated).format()
                  : '----'
              ),
          },
          {
            title: this.$lang('类型'),
            minWidth: 140,
            render: (h, p) => {
              let text = {
                0: '限价',
                2: '市价',
                3: '市价',
                4: 'MAKER单',
              };
              return h('span', this.$lang(text[p.row.orderType]));
            },
          },
          {
            title: this.$lang('交易对'),
            minWidth: 140,
            key: 'symbolId',
          },
          {
            title: this.$lang('方向'),
            minWidth: 140,
            key: 'side',
            render: (h, params) =>
              h(
                'span',
                {
                  attrs: {
                    style: `color:${params.row.side ? 'red' : 'green'}`,
                  },
                },
                this.$lang(params.row.side ? '卖出' : '买入')
              ),
          },
          {
            title: this.$lang('价格'),
            minWidth: 140,
            key: 'price',
          },
          {
            title: this.$lang('委托量'),
            minWidth: 140,
            key: 'quantity',
          },
          {
            title: this.$lang('委托总额'),
            minWidth: 140,
            key: 'amount',
          },
          {
            title: this.$lang('已成交'),
            minWidth: 140,
            key: 'executedAmount',
          },
          {
            title: this.$lang('成交均价'),
            minWidth: 140,
            key: 'averagePrice',
          },
          {
            title: this.$lang('状态'),
            align: 'center',
            width: 100,
            fixed: 'right',
            render: (h, params) =>
              h(
                'span',
                {
                  attrs: {
                    style: `color:${params.row.status == 2 ? 'green' : 'red'}`,
                  },
                },
                this.$lang(params.row.status == 2 ? '已成交' : '未成交')
              ),
          },
        ],
      };
    },

    methods: {
      expand(row, status) {
        if (status) {
          this.$axios
            .post('/api/v1/margin/transaction_order/order_trades', {
              userId: row.userId,
              orderId: row.orderId,
            })
            .then((result) => {
              this.data.forEach((el) => {
                if (el.orderId == row.orderId) {
                  el = Object.assign(el, {
                    list: result.data,
                    _expanded: true,
                  });
                }
              });
            });
        } else {
          this.data.forEach((el) => {
            if (el.orderId == row.orderId) {
              el = Object.assign(el, {
                _expanded: false,
              });
            }
          });
        }
      },
    },
  };
</script>
