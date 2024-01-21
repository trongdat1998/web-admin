<style lang="less" scoped>
</style>
<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="searchForm.status")
        Option(:value="0") {{$lang("全部")}}
        Option(v-for="(value, key) in status", :value="key", :key="key") {{value}}
    Col(span="5")
     DatePicker(type="daterange", :editable="false" :placeholder="$lang('选择日期')"  format="yyyy-MM-dd" style="width:100%" v-model="tempDate", @on-change="loadData")
    Col(span="5")
      Input(:placeholder="$lang('用户ID')"  v-model="searchForm.userId")
    Col(span="5")
      Input(:placeholder="$lang('订单号')" v-model="searchForm.orderId")
    Col(span="5")
      Button(@click="loadData" long type="primary") {{$lang('搜索')}}

  Table(:columns="columns", :data="listData", :loading="loading")
    template(slot-scope="{ row }" slot="status")
      span {{status[row.status]}}
  div(style="padding-top:30px")
    ButtonGroup
      Button(@click="search" icon="ios-skip-backward" :disabled="searchForm.lastId==0")
      Button(icon="ios-arrow-forward" @click="next"  :disabled="listData.length<searchForm.limit")

</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["dateRangeOptions","isRead"])
  },
  data() {
    return {
      appealContent:"",
      status: {
        1: this.$lang("等待付款"),
        2: this.$lang("等待付款确认"),
        3: this.$lang("放币处理中"),
        4: this.$lang("放币成功"),
        5: this.$lang("订单超时"),
        6: this.$lang("订单拒绝"),
        7: this.$lang("订单取消"),
      },
      tempDate: [],
      searchForm: {
        orderId: '',
        lastId: 0,
        limit: 100,
        status: 0,
        userId: '',
        startTime: 0,
        endTime: 0
      },
      loading: false,
      columns: [
        {
          title: this.$lang("时间"),
          minWidth: 190,
          render: (h, params) =>
            h("span", this.newDate(params.row.created).format())
        },
        {
          title: "UID",
          minWidth: 180,
          key: "userId",
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId
              }
            })
        },
        {
          title: this.$lang("订单号"),
          minWidth: 170,
          key: "orderId"
        },
        {
          title: this.$lang("类型"),
          minWidth: 80,
          render: (h) =>
            h("span",  this.$lang("买入")), // 目前只有买入，后期增加需后台支持
        },
        {
          title: this.$lang("总价"),
          minWidth: 140,
          key: "amount",
          render: (h, params) =>
            h("span", params.row.currencyAmount + params.row.currencyId)
        },
        {
          title: this.$lang("单价"),
          minWidth: 140,
          key: "price",
          render: (h, params) =>
            h("span", params.row.price + params.row.currencyId)
        },
        {
          title: this.$lang("到手数量"),
          minWidth: 130,
          key: "tokenAmount",
          render: (h, params) =>
            h("span", params.row.tokenAmount + params.row.tokenId)
        },
        {
          title: this.$lang("商家"),
          minWidth: 130,
          key: "thirdPartyName",
        },
        {
          title: this.$lang("状态"),
          minWidth: 150,
          slot: "status"
        },
      ],
      listData: []
    };
  },
  watch: {
  },
  methods: {
    next() {
      this.searchForm.lastId = this.listData.slice(-1)[0].lastId;
      this.loadData();
    },
    search() {
      this.searchForm.lastId = 0;
      this.listData = [];
      this.loadData();
    },
    loadData() {
      if (this.tempDate.length && this.tempDate[0] && this.tempDate[1]) {
        this.searchForm.startTime = new Date(this.tempDate[0]).getTime();
        this.searchForm.endTime = new Date(this.tempDate[1]).getTime();
      } else {
        this.searchForm.startTime = 0;
        this.searchForm.endTime = 0;
      }
      this.loading = true;
      let json = {};
      Object.assign(json, this.searchForm);
      if(!this.searchForm.orderId) {
        Object.assign(json, {orderId: 0});
      }
      if(!this.searchForm.userId) {
        Object.assign(json, {userId: 0});
      }
      this.$axios
        .post(
          "/api/v1/otc/third_party/order/query", json
        )
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
  },
  created() {
    this.loadData();
  },
};
</script>
