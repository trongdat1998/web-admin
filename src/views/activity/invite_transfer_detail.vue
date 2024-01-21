<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="6")
      Select(v-model="searchForm.token" filterable)
        Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{item.tokenName}}
    Col(span="6")
      DatePicker(format="yyyy/MM/dd HH:mm:ss" :placeholder="$lang('日期')" type="date" v-model="statisticsTime" style="width:100%" @on-change="selectDate")
    Col(span="6")
      Input(placeholder="UID" v-model="searchForm.userId"  prefix="ios-grid-outline")
    Col(span="6")
      Button(long  type="primary" @click="search" icon="md-search") {{$lang('搜索')}}
  Table(:columns="columns", :data="listData", :loading="loading")
  Row(:gutter="20" style="padding-top:30px")
    Col(span="10")
      ButtonGroup(v-if="!(searchForm.page==1&&listData.length<searchForm.pageSize)")
        Button(:disabled="searchForm.page==1" icon="ios-skip-backward" @click="getFirst")
        Button(:disabled="listData.length<searchForm.pageSize" icon="ios-arrow-forward"  @click="getNext")
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["tokens"])
  },
  data() {
    return {
      statisticsTime: this.$route.params.date || new Date().format("yyyyMMdd"),
      searchForm: {
        userId: "",
        statisticsTime: 0,
        page: 1,
        token: "",
        pageSize: 100
      },
      loading: false,

      columns: [
        {
          title: "日期",
          minWidth: 160,
          render: (h, params) => h("span", params.row.statisticsTime)
        },
        {
          title: "UID",
          minWidth: 160,
          key: "userId"
        },
        {
          title: this.$lang("币种"),
          minWidth: 160,
          key: "token"
        },
        {
          title: this.$lang("返佣数量"),
          minWidth: 160,
          key: "bonusAmount"
        },
        {
          title: this.$lang("状态"),
          align: "center",
          width: 120,
          fixed: "right",
          render: (h, params) =>
            h(
              "Tag",
              {
                attrs: {
                  color: params.row.status ? "success" : "error"
                }
              },
              this.$lang(params.row.status ? "已发放" : "未发放")
            )
        }
      ],
      listData: []
    };
  },
  methods: {
    getFirst() {
      this.search();
    },
    getNext() {
      this.searchForm.page = this.searchForm.page + 1;
      this.loadData();
    },
    selectDate(val) {
      this.searchForm.statisticsTime = val
        ? new Date(val).format("yyyyMMdd")
        : "";
    },
    search() {
      this.searchForm.page = 1;
      this.loadData();
    },
    loadData() {
      this.loading = true;
      this.$axios
        .post("/api/v1/invite_fee_back/invite_bonus_record", this.searchForm)
        .then(result => {
          if (result.code == 0) {
            this.listData = result.data.list;
            this.searchForm.page = result.data.page;
          }
          this.loading = false;
        });
    }
  },
  created() {
    this.searchForm.statisticsTime = this.statisticsTime;
    this.searchForm.token = this.$route.params.token || "USDT";
    this.loadData();
  }
};
</script>