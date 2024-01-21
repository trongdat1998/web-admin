<template lang="pug">
Main
  .manage-menu
  div.page-exchange
    Row(:gutter="15" style="margin-top: 24px")
      Col(span="6")
        Select(v-model="searchForm.status" @on-change="loadData" :placeholder="$lang('全部')")
          Option(value="") {{$lang("全部")}}
          Option(value="0") {{$lang("待派息")}}
          Option(value="2") {{$lang("已派息")}}
    Divider(dashed)
    Table(:columns="columns", :data="listData", :loading="loadingTable")
    Row(:gutter="20" style="padding-top:30px")
      Col(span="10")
        ButtonGroup
          Button(@click="getFirstData" icon="ios-skip-backward" :disabled="searchForm.startRebateDate==0")
          Button(@click="getNextData" :disabled="listData.length<searchForm.size" icon="ios-arrow-forward")
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["lang", "isRead"]),
  },
  data() {
    return {
      searchForm: {
        status: '0',
        startRebateDate: 0,
        size: 100,
      },
      actualApr: this.$route.params.actualApr,
      // 状态
      status: {
        0: this.$lang("待派息"),
        1: this.$lang("已计算"),
        2: this.$lang("已派息"),
        3: this.$lang("取消派息"),
      },
      loadingTable: false,
      columns: [],
      defaultColumns: [
        {
          title: this.$lang("状态"),
          minWidth: 160,
          sortable: true,
          render: (h, params) => h("span", this.status[params.row.status]),
        },
        {
          title: this.$lang("发息时间"),
          minWidth: 190,
          render: (h, params) =>
            h("span", this.newDate(params.row.rebateDate).format()),
        },
        {
          title: this.$lang("年化利率"),
          minWidth: 100,
          render: (h, params) =>
            h("span", `${params.row.rebateRate}%`),
        },
      ],
      listData: [],
    };
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      Object.assign(this.searchForm, {productId: this.$route.params.id})
      this.columns = [
        {
          title: this.$lang("默认年化利率"),
          minWidth: 100,
          render: (h) =>
            h("span", `${this.actualApr}%`),
        },
        ...this.defaultColumns
      ]
      this.$axios
        .post("/api/v1/staking/product/current/rebate/list", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    getNextData() {
      this.searchForm.startRebateDate = this.listData.slice(-1)[0].rebateDate;
      this.loadData();
    },
    getFirstData() {
      this.searchForm.startRebateDate = 0;
      this.loadData();
    },
  },
  created() {
    this.loadData();
  },
};
</script>
