<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="searchForm.tokenId" filterable)
        Option(value="") {{$lang('全部')}}
        Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{item.tokenName}}
    Col(span="20")
      Input(:placeholder="$lang('用户ID')" v-model="searchForm.userId", search enter-button="" @on-search="loadData()")
  Table(:columns="columns", :data="listData" , :loading="loadingTable")
  div(style="padding-top:30px")
    ButtonGroup
      Button(icon="ios-skip-backward" @click="first")
      Button(icon="ios-arrow-forward" @click="next"  :disabled="listData.length<searchForm.limit")
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["tokens"])
  },
  data() {
    return {
      searchForm: {
        userId: "",
        tokenId: "",
        limit: 20,
        fromId: 0,
        endId: 0
      },
      loadingTable: false,
      columns: [
        {
          title: this.$lang("日期"),
          minWidth: 140,
          key: "time",
          render: (h, params) =>
            h("span", params.row.time ? params.row.time : "----")
        },
        {
          title: this.$lang("经纪人名称"),
          minWidth: 140,
          key: "agentName",
          render: (h, params) =>
            h("span", params.row.agentName ? params.row.agentName : "----")
        },
        {
          title: this.$lang("经纪人UID"),
          minWidth: 140,
          key: "userId",
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId
              }
            })
        },
        {
          title: this.$lang("上级经纪人"),
          minWidth: 140,
          key: "superiorName",
          render: (h, params) =>
            h(
              "span",
              params.row.superiorName ? params.row.superiorName : "----"
            )
        },
        {
          title: this.$lang("币种"),
          minWidth: 140,
          key: "tokenId",
          render: (h, params) =>
            h("span", params.row.tokenId ? params.row.tokenId : "----")
        },
        {
          title: this.$lang("佣金数量"),
          minWidth: 140,
          key: "agentFee"
        }
      ],
      listData: []
    };
  },
  methods: {
    first() {
      this.searchForm.fromId = 0;
      this.loadData(true);
    },
    next() {
      if (this.listData.length >= this.searchForm.limit) {
        this.searchForm.fromId = this.listData[this.searchForm.limit - 1].id;
        this.loadData();
      }
    },
    loadData() {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/agent/query/agent/commission/list", this.searchForm)
        .then(result => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    }
  },
  created(){
    this.loadData()
  }

};
</script>