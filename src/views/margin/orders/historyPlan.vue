<template lang="pug">
Table(
  :columns="columns",
  :data="data",
  :loading="loading",
  @on-expand="expand"
)
</template>
<script>
  import expandRow from './table-expandPlan.vue';
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
        status: {
          1: this.$lang('等待委托'),
          2: this.$lang('委托成功'),
          3: this.$lang('委托失败'),
          4: this.$lang('委托取消'),
        },
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
            title: this.$lang('条件单ID'),
            key: 'orderId',
          },
          {
            minWidth: 190,
            title: this.$lang('订单ID'),
            key: 'executedOrderId',
          },
          {
            title: this.$lang('时间'),
            minWidth: 190,
            render: (h, params) =>
              h('span', this.newDate(params.row.time).format()),
          },
          {
            minWidth: 190,
            title: this.$lang('触发时间'),
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
                1: '限价',
                2: '市价',
                3: 'LIMIT-MAKER',
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
                    style: `color:${params.row.side == 2 ? 'red' : 'green'}`,
                  },
                },
                this.$lang(params.row.side == 2 ? '卖出' : '买入')
              ),
          },
          {
            title: this.$lang('触发价格'),
            minWidth: 140,
            key: 'triggerPrice',
            render: (h, params) =>
              h(
                'span',
                Number(params.row.triggerPrice) > Number(params.row.quotePrice)
                  ? `≥${params.row.triggerPrice}`
                  : `≤${params.row.triggerPrice}`
              ),
          },
          {
            title: this.$lang('委托价格'),
            minWidth: 140,
            key: 'price',
          },
          {
            title: this.$lang('委托数量'),
            minWidth: 140,
            key: 'quantity',
          },
          {
            title: this.$lang('委托总额'),
            minWidth: 140,
            key: 'amount',
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
                this.status[params.row.status]
              ),
          },
        ],
      };
    },

    methods: {
      expand(row, status) {
        if (status) {
          this.$axios
            .post('/api/v1/order/plan_spot/get', {
              userId: row.userId,
              orderId: row.orderId,
              accountType: 27,
            })
            .then((result) => {
              if (result.data.order) {
                this.data.forEach((el) => {
                  if (el.orderId == row.orderId) {
                    let order = [];
                    order.push(result.data.order);
                    Object.assign(el, {
                      list: order,
                      _expanded: true,
                    });
                  }
                });
              }
            });
        }
      },
    },
  };
</script>
