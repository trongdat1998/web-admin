<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4") &nbsp;
    Col(span="16")
      Input(search :placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')}`" v-model="inputInfo", enter-button="" @on-search="loadData")
    Col(span="4")
      Button(type="primary" long @click="exportData(1)" :disabled="isRead")
        Icon(type="ios-download-outline")
        | {{$lang("导出数据")}}
  Table(:columns="columns", :data="listData", :loading="loading" ref="table")
  Row(:gutter="20" style="padding-top:30px")
    Col(span="10")
      ButtonGroup
        Button(@click="getFirstData" :disabled="searchForm.fromId===0" icon="ios-skip-backward")
        Button(@click="getNextData" :disabled="listData.length<searchForm.limit" icon="ios-arrow-forward")
</template>
<script>
import { formatParams } from "@/libs/common.js";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["isRead"])
  },
  data() {
    return {
      searchForm: {
        projectId: this.$route.params.id,
        userId: "",
        phone: "",
        email: "",
        fromId: 0,
        endId: 0,
        limit: 20,
      },
      inputInfo: "",
      loading: false,

      columns: [
        {
          type: "index",
          minWidth: 60
        },
        {
          title: this.$lang("时间"),
          minWidth: 160,
          key: "purchaseTime"
        },
        {
          title: this.$lang("UID"),
          minWidth: 160,
          key: "userId"
        },
        {
          title: this.$lang("订单号"),
          minWidth: 160,
          key: "orderId"
        },
        {
          title: this.$lang("项目"),
          minWidth: 160,
          key: "projectName"
        },
        {
          title: this.$lang("申购金额"),
          minWidth: 160,
          key: "amount",
          sortable: true
        },
        {
          title: this.$lang("申购份数"),
          minWidth: 160,
          key: "orderQuantity",
          sortable: true,
          render: (h, p) => {
            return h("span", p.row.orderQuantity + this.$lang("份"));
          }
        },
        {
          title: this.$lang("获得数量"),
          minWidth: 160,
          key: "receiveTokenQuantity",
          sortable: true
        }
      ],
      listData: []
    };
  },
  methods: {
    loadData() {
      this.loading = true;
      this.searchForm.hasMore = false;
      this.$axios
        .post(
          "/api/v1/activity/ieo/order/list",
          Object.assign(this.searchForm, formatParams(this.inputInfo))
        )
        .then(result => {
          if (result.code == 0) {
            this.listData = result.data.map(el => {
              el.purchaseTime = this.newDate(el.purchaseTime).format();
              el.userId = el.userId + "\t";
              el.orderId = el.orderId + "\t";
              el.amount = el.amount + el.purchaseTokenName;
              el.receiveTokenQuantity =
                el.receiveTokenQuantity + el.receiveTokenName;
              return el;
            });
          }
          this.loading = false;
        });
    },
    getFirstData() {
      this.searchForm.fromId = 0;
      this.loadData();
    },
    getNextData() {
      this.searchForm.fromId = this.listData.slice(-1)[0].orderId;
      this.loadData();
    },
    exportData() {
      window.open(`/api/v1/activity/ieo/download/order?projectId=${this.$route.params.id}&type=${this.$route.params.type}`);
    }
  },
  created() {
    this.loadData();
  }
};
</script>
