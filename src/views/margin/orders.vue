<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="type" @on-change="change")
        Option(:value="3") {{$lang('成交明细')}}
        Option(:value="1") {{$lang('当前委托-普通委托')}}
        Option(:value="2") {{$lang('历史委托-普通委托')}}
        Option(:value="4") {{$lang('当前委托-计划委托')}}
        Option(:value="5") {{$lang('历史委托-计划委托')}}
    Col(span="4")
      Select(v-model="searchForm.symbolId" filterable clearable)
        Option(v-for="_item in symbolList" :key="_item.symbolId" :value="_item.symbolId") {{_item.symbolName}}
    Col(span="16")
      Input(search :placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')}`" v-model="inputInfo", enter-button="" @on-search="search")
  currentOrder(:data="listData", :loading="loading" v-if="type==1")
  historyOrder(:data="listData", :loading="loading" v-else-if="type==2")
  tradeOrder(:data="listData", :loading="loading" v-else-if="type==3")
  currentPlanOrder(:data="listData", :loading="loading" v-else-if="type==4" @cancelOrder="loadData")
  historyPlanOrder(:data="listData", :loading="loading" v-else-if="type==5")
  Row(:gutter="20" style="padding-top:30px")
    Col(span="10")
      ButtonGroup
        Button(@click="search" icon="ios-skip-backward" :disabled="searchForm.lastId==0")
        Button(@click="getNextData" :disabled="listData.length<searchForm.pageSize" icon="ios-arrow-forward")
</template>
<script>
  import { formatParams } from '@/libs/common.js';
  import currentOrder from './orders/current.vue';
  import historyOrder from './orders/history.vue';
  import tradeOrder from './orders/trades.vue';
  import currentPlanOrder from './orders/currentPlan.vue';
  import historyPlanOrder from './orders/historyPlan.vue';
  export default {
    components: {
      currentOrder,
      historyOrder,
      tradeOrder,
      currentPlanOrder,
      historyPlanOrder,
    },
    data() {
      return {
        //从深度管理跳转过来的订单筛选
        orderId: '',
        inputInfo: this.$route.query.userId || '',
        type: this.$route.params.type ? this.$route.params.type : 3,
        symbolList: [],
        types: {
          1: 'current_orders',
          2: 'history_orders',
          3: 'trades',
          4: 'plan_spot/current_orders',
          5: 'plan_spot/history_orders',
        },
        searchForm: {
          userId: '',
          nationalCode: '',
          phone: '',
          email: '',
          lastId: 0,
          pageSize: 100,
          hasMore: false,
          symbolId: '',
        },
        postForm: {},
        loading: false,
        listData: [],
      };
    },
    methods: {
      change(type) {
        this.$router.replace('/margin/orders/' + type);
        this.search();
      },
      search() {
        this.postForm = Object.assign(
          {},
          this.searchForm,
          formatParams(this.inputInfo)
        );
        this.listData = [];
        this.searchForm.lastId = 0;
        this.postForm.lastId = 0;
        this.loadData();
      },
      getNextData() {
        if (this.type == 3) {
          this.postForm.lastId = this.listData[
            this.listData.length - 1
          ].tradeId;
        } else {
          this.postForm.lastId = this.listData[
            this.listData.length - 1
          ].orderId;
        }
        this.searchForm.lastId = this.postForm.lastId;
        this.loadData();
      },
      loadData() {
        this.loading = true;
        Object.assign(this.postForm, { accountType: 27 });
        this.$axios
          .post(`/api/v1/order/${this.types[this.type]}`, this.postForm)
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              if (this.orderId) {
                result.data = result.data.filter(
                  (el) => el.orderId.indexOf(this.orderId) > -1
                );
                this.orderId = '';
              }
              this.listData = result.data.map((el) => {
                el.list = [];
                return el;
              });
            }
          });
      },
    },
    created() {
      Object.assign(this.searchForm, this.$route.query);
      if (this.$route.query.userId) {
        this.inputInfo = this.$route.query.userId;
        this.orderId = this.$route.query.orderId;
      }
      this.$axios
        .post('/api/v1/symbol/query', {
          current: 1,
          pageSize: 1000,
          category: 1,
        })
        .then((result) => {
          if (result.code === 0) {
            this.symbolList = result.data.list ? result.data.list : [];
            // this.search();
          }
        });
    },
  };
</script>
