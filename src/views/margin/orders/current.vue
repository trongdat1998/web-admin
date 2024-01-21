<template lang="pug">
div
  Table(:columns="columns", :data="data", :loading="loading")
  Modal(v-model="cancelModel", :title="$lang('撤销订单')" width="360")
    p(slot="header" style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{$lang('提示')}}
    Alert(type="error") {{$lang('确认撤销订单')}}:{{cancelForm.orderId}}?
      span(slot="desc")
        | {{$lang("报价")}} ：{{cancelForm.price}} <br>
        | {{$lang("委托数量")}} ：{{cancelForm.quantity}}<br>
        | {{$lang("委托金额")}} ：{{cancelForm.amount}}<br>
        | {{$lang("后台管理撤销用户订单是一个强制管理操作，请谨慎操作确认，避免与用户产生纠纷。")}}
    template(slot="footer")
      Button(type="error" @click="doCancel" long) {{$lang('确定')}}
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
    methods: {
      doCancel() {
        this.$axios
          .post('/api/v1/order/cancel_order', this.cancelForm)
          .then((result) => {
            if (result.code == 0) {
              location.reload();
            }
          });
      },
    },
    data() {
      return {
        cancelModel: false,
        cancelForm: {
          userId: '',
          orderId: '',
          amount: '',
          price: '',
          quantity: '',
        },
        columns: [
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
                  ? this.newDate(params.row.updated).format(
                      'yyyy-MM-dd hh:mm:ss'
                    )
                  : '----'
              ),
          },
          {
            minWidth: 190,
            title: this.$lang('订单ID'),
            key: 'orderId',
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
            title: this.$lang('数量'),
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
            title: this.$lang('未成交'),
            minWidth: 140,
            key: 'locked',
          },
        ],
      };
    },
  };
</script>
