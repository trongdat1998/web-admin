<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="type")
        Option(:value="1") {{$lang("用户模式")}}
        Option(:value="2") {{$lang("盘口模式")}}
    Col(span="4")
      Select(v-model="searchForm.symbolId" @on-change="load" filterable)
        Option(:value="item.symbolId" v-for="item,index in symbols" filterable :key="item.symbolId + index")  {{item.baseTokenId}}/{{item.quoteTokenId}}
    Col(span="16")
      Input(v-model="searchForm.userId" :disabled="type==2", :placeholder="$lang('用户UID')"  search enter-button="" @on-search="load")
  Tabs(v-model="searchForm.side" @on-click="load")
    TabPane(:label="$lang('买盘')" name="0")
    TabPane(:label="$lang('卖盘')" name="1")
  Table.user-table(:loading="loading" :columns="columns", :data="depth")
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
  data() {
    return {
      cancelModel: false,
      loading: false,
      type: 1,
      searchForm: {
        symbolId: "",
        side: "0",
        userId: ""
      },
      cancelForm: {
        userId: "",
        orderId: "",
        amount: "",
        brokerUserId: "",
        price: "",
        quantity: ""
      },
      symbols: [],
      list: [],
      columns: [
        {
          type: "index",
          minWidth: 60,
          align: "center"
        },
        {
          minWidth: 100,
          title: this.$lang("报价"),
          key: "price",
          sortable: true
        },
        {
          minWidth: 100,
          title: this.$lang("委托数量"),
          key: "quantity",
          sortable: true
        },
        {
          minWidth: 100,
          title: this.$lang("委托金额"),
          key: "amount",
          sortable: true
        },
        {
          minWidth: 150,
          title: "UID",
          key: "brokerUserId",
          sortable: true,
          render: (h, params) => {
            if (this.type == 1) {
              return h("User", {
                props: {
                  uid: params.row.brokerUserId
                }
              });
            } else {
              return h("span", "---");
            }
          }
        },
        {
          minWidth: 150,
          title: this.$lang("订单ID"),
          key: "orderId",
          render: (h, params) => {
            if (this.type == 1) {
              return h(
                "a",
                {
                  attrs: {
                    target: "_blank",
                    href: `/exchange/orders/1?userId=${params.row.brokerUserId}&symbolId=${this.searchForm.symbolId}&orderId=${params.row.orderId}`
                  }
                },
                params.row.orderId
              );
            } else {
              return h("span", "---");
            }
          }
        }
        // {
        //   minWidth: 120,
        //   title: this.$lang("操作"),
        //   align: "center",
        //   fixed: "right",
        //   key: "orderId",
        //   render: (h, params) => {
        //     if (this.type == 1) {
        //       return h(
        //         "a",
        //         {
        //           on: {
        //             click: () => {
        //               Object.assign(this.cancelForm,params.row)
        //               this.cancelForm.userId = params.row.brokerUserId;
        //               this.cancelModel = true;
        //             }
        //           }
        //         },
        //         this.$lang("撤单")
        //       );
        //     } else {
        //       return h("span", "---");
        //     }
        //   }
        // }
      ]
    };
  },
  computed: {
    depth() {
      if (this.type == 1) {
        return this.list.filter(
          el => el.brokerUserId.indexOf(this.searchForm.userId) > -1
        );
      } else {
        let tmp = [];
        let json = {};
        this.list.forEach(el => {
          if (json[el.price]) {
            json[el.price] = {
              price: el.price,
              quantity: json[el.price].quantity + el.quantity,
              amount: json[el.price].amount + el.amount
            };
          } else {
            json[el.price] = {
              price: el.price,
              quantity: el.quantity,
              amount: el.amount,
              orderId: "---",
              brokerId: "---"
            };
          }
        });

        Object.keys(json).forEach(el => {
          tmp.push(json[el]);
        });
        return tmp;
      }
    }
  },
  methods: {
    doCancel() {
      this.$axios
        .post(" /api/v1/book_order/cancel_order ", this.cancelForm)
        .then(result => {
          if (result.code == 0) {
            this.load();
          }
        });
    },
    load() {
      this.list = [];
      this.loading = true;
      this.$axios
        .post(
          "/api/v1/order/book_orders",
          Object.assign({ type: 1 }, this.searchForm, {
            side: this.searchForm.side * 1
          })
        )
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            if (result.data.result == 1) {
              let str =
                sessionStorage[this.searchForm.symbolId + this.searchForm.side];
              if (str) {
                this.list = JSON.parse(str);
              }
            } else {
              if (result.data.list) {
                this.list = result.data.list.map(el => {
                  el.price = el.price * 1;
                  el.amount = el.amount * 1;
                  el.quantity = el.quantity * 1;
                  return el;
                });
                sessionStorage[
                  this.searchForm.symbolId + this.searchForm.side
                ] = JSON.stringify(this.list);
              }
            }
          }
        });
    }
  },
  created() {
    this.$axios
      .post("/api/v1/symbol/query", {
        category: 1,
        current: 1,
        pageSize: 1000
      })
      .then(result => {
        if (result.code == 0 && result.data.list.length) {
          this.symbols = result.data.list;
          this.searchForm.symbolId = result.data.list[0].symbolId;
          this.load();
        }
      });
  }
};
</script>