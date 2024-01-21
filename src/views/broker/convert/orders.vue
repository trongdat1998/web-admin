<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="searchForm.status", @on-change="search")
        Option(:value="0") {{ $lang('全部') }}
        Option(:value="key", v-for="(item, key) in status", :key="key") {{ item }}
    Col(span="20")
      Input(
        :placeholder="`${$lang('用户ID')}`",
        v-model="inputInfo",
        search,
        enter-button="",
        @on-search="search"
      )

  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable"
  )
    template(slot-scope="{row, index }", slot="uid") 
      User(:uid="row.userId")
    template(slot-scope="{row, index}", slot="name") {{ row.purchaseTokenName }} => {{ row.offeringsTokenName }}
    template(slot-scope="{row, index}", slot="price") {{ row.price }}{{ row.purchaseTokenName }}
    template(slot-scope="{row, index}", slot="quantity") {{ row.offeringsQuantity }}{{ row.offeringsTokenName }}
    template(slot-scope="{row, index}", slot="amount") {{ row.purchaseQuantity }}{{ row.purchaseTokenName }}
    template(slot-scope="{row, index}", slot="status") {{ status[row.status] }}
  div(style="padding-top:30px") 
    ButtonGroup
      Button(
        icon="md-skip-backward",
        @click="first",
        :disabled="searchForm.lastId == 0 || loadingTable"
      )
      Button(
        icon="ios-arrow-forward",
        @click="next",
        :disabled="listData.length < searchForm.pageSize || loadingTable"
      )
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      loadingTable: true,
      inputInfo: "",
      searchForm: {
        convertSymbolId: 0,
        status: 0,
        beginTime: 0,
        endTime: 0,
        lastId: 0,
        userId: "0",
        pageSize: 100,
      },

      status: {
        1: this.$lang("未付款"),
        2: this.$lang("已付款"),
        3: this.$lang("付款失败"),
      },

      columns: [
        {
          title: this.$lang("时间"),
          key: "orderId",
          minWidth: 180,
          render: (h, p) => h("div", this.newDate(p.row.updated).format()),
        },

        {
          title: this.$lang("订单号"),
          key: "orderId",
          minWidth: 100,
        },
        {
          title: "Uid",
          key: "userId",
          minWidth: 100,
          slot: "uid",
        },
        {
          title: this.$lang("名称"),
          key: "userId",
          minWidth: 100,
          slot: "name",
        },
        {
          title: this.$lang("价格"),
          key: "price",
          minWidth: 100,
          slot: "price",
        },
        {
          title: this.$lang("数量"),
          key: "quantity",
          minWidth: 100,
          slot: "quantity",
        },
        {
          title: this.$lang("金额"),
          key: "purchaseQuantity",
          minWidth: 100,
          slot: "amount",
        },
        {
          title: this.$lang("金额"),
          key: "status",
          minWidth: 100,
          slot: "status",
        },
      ],
      listData: [],
    };
  },
  computed: {
    ...mapState(["isRead"]),
  },
  created() {
    this.loadData();
  },
  methods: {
    first() {
      this.search();
    },
    next() {
      this.searchForm.lastId = this.listData[this.listData.length - 1].orderId;
      this.loadData();
    },
    search() {
      this.searchForm.lastId = 0;
      this.loadData();
    },
    loadData() {
      this.loadingTable = true;
      let data = Object.assign(this.searchForm, {
        userId: this.inputInfo ? this.inputInfo : 0,
      });
      this.$axios.post("/api/v1/convert/order/query", data).then((result) => {
        this.loadingTable = false;
        if (result.code === 0) {
          this.listData = result.data;
        }
      });
    },
  },
};
</script>