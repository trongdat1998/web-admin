<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      DatePicker(format="yyyy/MM/dd HH:mm:ss" @on-change="changeTimes"  type="datetimerange" style="width:100%" :value="times" :placeholder="$lang('请选择')")
    Col(span="20")
      Input(search v-model="searchForm.username", :placeholder="$lang('登录名')" @on-search="search"  enter-button="")
  Table(:columns="columns", :data="listData", :loading="loading")
</template>
<script>
export default {
  data() {
    return {
      times:[],
      searchForm: {
        username:"",
        pageSize: 1000,
        lastId:"0",
        startTime:"",
        endTime:""
      },
      loading: false,
      columns: [
        {
          title: this.$lang("编号"),
          minWidth: 100,
          key: "id"
        },
        {
          title: this.$lang("登录名"),
          minWidth: 120,
          key: "username"
        },
        {
          title: this.$lang("访问页面"),
          minWidth: 160,
          key: "requestUrl"
        },
        {
          title: this.$lang("操作内容"),
          minWidth: 160,
          key: "remark"
        },
        {
          title: "IP",
          minWidth: 160,
          key: "ip"
        },
        {
          title: this.$lang("时间"),
          minWidth: 190,
          render: (h, params) =>
            h("span", this.newDate(params.row.created).format())
        },
      ],
      listData: []
    };
  },
  methods: {
    changeTimes(val) {
      this.searchForm.startTime = new Date(val[0]).getTime();
      this.searchForm.endTime = new Date(val[1]).getTime();
    },
    search() {
      this.searchForm.fromId = 0;
      this.listData = [];
      this.loadData();
    },
    loadData() {
      this.loading = true;
      this.$axios
        .post("/api/v1/logs/query", this.searchForm)
        .then(result => {
          if (result.code == 0) {
            this.listData = result.data;
          }
          this.loading = false;
        });
    },
    getFirstData() {
      this.searchForm.fromId = 0;
      this.loadData();
    },
    getNextData() {
      this.searchForm.fromId = this.listData[this.listData.length - 1].orderId;
      this.loadData();
    }
  },
  created() {
    this.loadData()
  }
};
</script>