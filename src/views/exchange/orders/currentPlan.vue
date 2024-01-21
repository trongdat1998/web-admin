<style lang="less" scoped>
  .currentOrder {
    position: relative;
    z-index: 2;
    .cancel {
      position: absolute;
      right: 0;
      bottom: -62px;
    }
  }
</style>
<template lang="pug">
.currentOrder
  Table(
    :columns="columns",
    :data="data",
    :loading="loading",
    @on-selection-change="selectOption"
  )
  Button.cancel(
    type="error",
    :disabled="cancelOrderLists.length == 0 || isRead",
    @click="cancelAll()"
  ) {{ $lang('批量撤单') }}
  Modal(v-model="cancelModel", :title="$lang('撤销订单')", width="360")
    p(slot="header", style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{ $lang('提示') }}
    Alert(type="error") {{ $lang('确认撤销订单') }}:{{ cancelForm.orderId }}?
      span(slot="desc")
        | {{ $lang('报价') }} ：{{ cancelForm.price }} <br>
        | {{ $lang('委托数量') }} ：{{ cancelForm.quantity }}<br>
        | {{ $lang('委托金额') }} ：{{ cancelForm.amount }}<br>
        | {{ $lang('后台管理撤销用户订单是一个强制管理操作，请谨慎操作确认，避免与用户产生纠纷。') }}
    template(slot="footer")
      Button(
        type="error",
        @click="doCancel(cancelForm, false)",
        long,
        :loading="cancelLoading"
      ) {{ $lang('确定') }}
  Modal(v-model="cancelAllModel", width="360")
    p(slot="header", style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{ $lang('批量撤单') }}
    Alert(type="error") {{ $lang('确认撤销订单') }}:{{ cancelCount }}/{{ cancelOrderLists.length }}
      span(slot="desc")
        | {{ $lang('后台管理撤销用户订单是一个强制管理操作，请谨慎操作确认，避免与用户产生纠纷。') }}
    Progress(
      :percent="cancelOrderLists.length ? ((cancelCount * 100) / cancelOrderLists.length).cutFixed(2) : 100",
      status="active"
    )
    template(slot="footer")
      Button(
        type="error",
        @click="doCancelAll()",
        long,
        :loading="cancelLoading"
      ) {{ $lang('确定') }}
</template>
<script>
  import { mapState } from 'vuex';
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
    computed: {
      ...mapState(['isRead']),
    },
    methods: {
      selectOption(selection) {
        this.cancelOrderLists = selection;
      },
      doCancel(formData, bat) {
        this.cancelLoading = true;
        this.$axios
          .post('/api/v1/order/plan_spot/cancel', formData)
          .then((result) => {
            this.cancelLoading = false;
            this.cancelCount = this.cancelCount + 1;
            if (this.cancelCount === this.cancelOrderLists.length) {
              this.cancelAllModel = false;
              this.$emit('cancelOrder');
              this.cancelOrderLists = [];
            }
            if (result.code == 0 && !bat) {
              this.$emit('cancelOrder');
              this.cancelModel = false;
            }
          });
      },
      cancelAll() {
        this.cancelCount = 0;
        this.cancelAllModel = true;
      },
      doCancelAll() {
        this.cancelOrderLists.forEach((el) => {
          this.doCancel(el, true);
        });
      },
    },
    data() {
      return {
        cancelCount: 0,
        cancelOrderLists: [],
        cancelAllModel: false,
        cancelLoading: false,
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
            type: 'selection',
            width: 60,
            align: 'center',
          },
          {
            title: this.$lang('时间'),
            minWidth: 190,
            render: (h, params) =>
              h('span', this.newDate(params.row.time).format()),
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
            title: this.$lang('条件单ID'),
            key: 'orderId',
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
            render: (h, params) =>
              h(
                'span',
                Number(params.row.triggerPrice) > Number(params.row.quotePrice)
                  ? `≥${params.row.triggerPrice}`
                  : `≤${params.row.triggerPrice}`
              ),
          },
          {
            title: this.$lang('委托数量'),
            minWidth: 140,
            key: 'quantity',
          },
          {
            title: this.$lang('委托价格'),
            minWidth: 140,
            key: 'price',
            // render: (h, params) =>
            //   h("span", Number(params.row.triggerPrice) > Number(params.row.quotePrice) ? `≥${params.row.triggerPrice}` : `≤${params.row.triggerPrice}`),
          },
          {
            title: this.$lang('委托总额'),
            minWidth: 140,
            key: 'amount',
          },
          {
            minWidth: 120,
            title: this.$lang('操作'),
            align: 'center',
            fixed: 'right',
            key: 'orderId',
            render: (h, params) => {
              if (this.isRead) {
                return h('span', '---');
              } else {
                return h(
                  'a',
                  {
                    on: {
                      click: () => {
                        Object.assign(this.cancelForm, params.row);
                        this.cancelModel = true;
                      },
                    },
                  },
                  this.$lang('撤单')
                );
              }
            },
          },
        ],
      };
    },
  };
</script>
