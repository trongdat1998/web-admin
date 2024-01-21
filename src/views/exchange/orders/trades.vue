<template lang="pug">
Table(:columns="columns", :data="data", :loading="loading")
</template>
<script>
  export default {
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
            type: 'index',
            minWidth: 60,
          },
          {
            title: this.$lang('订单号'),
            key: 'orderId',
            minWidth: 170,
          },
          {
            title: 'UserId',
            key: 'userId',
            minWidth: 170,
            render: (h, params) =>
              h('User', {
                props: {
                  uid: params.row.userId,
                },
              }),
          },

          {
            minWidth: 190,
            title: this.$lang('时间'),
            render: (h, params) =>
              h(
                'span',
                this.newDate(params.row.createdAt).format('yyyy-MM-dd hh:mm:ss')
              ),
          },
          {
            minWidth: 80,
            title: this.$lang('类型'),
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
            minWidth: 120,
            title: this.$lang('交易对'),
            key: 'symbolId',
          },
          {
            minWidth: 100,
            title: this.$lang('方向'),
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
            minWidth: 120,
            title: this.$lang('价格'),
            key: 'price',
          },
          {
            minWidth: 140,
            title: this.$lang('委托量'),
            key: 'quantity',
          },
          {
            minWidth: 120,
            title: this.$lang('成交额'),
            key: 'amount',
          },
          {
            width: 120,
            title: this.$lang('手续费'),
            key: 'tokenFee',
            fixed: 'right',
            align: 'center',
          },
        ],
      };
    },
  };
</script>
