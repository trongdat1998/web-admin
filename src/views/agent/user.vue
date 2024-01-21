<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="10")
      Input(:placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')} / AccountId`" v-model="inputInfo")
    Col(span="10")
      Input(:placeholder="$lang('经纪人姓名')" v-model="searchForm.agentName")
    Col(span="4")
      Button(type="primary" @click="loadData()" long icon="md-search") {{$lang('搜索')}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable")
  div(style="padding-top:30px")
    ButtonGroup
      Button(icon="ios-arrow-back" @click="prev"  :disabled="searchForm.page==1")
      Button(icon="ios-arrow-forward" @click="next"  :disabled="listData.length<searchForm.limit")
</template>
<script>
import { formatParams } from "@/libs/common.js";
export default {
  data() {
    return {
      searchForm: {
        userId: "",
        mobile: "",
        email: "",
        agentName: "",
        page: 1,
        limit: 20
      },
      loadingTable: true,
      inputInfo: "",
      columns: [
        {
          title: "UID",
          minWidth: 190,
          key: "userId",
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId
              }
            })
        },
        {
          title: this.$lang("手机号"),
          minWidth: 140,
          key: "mobile",
          render: (h, params) =>
            h("span", params.row.mobile ? params.row.mobile : "----")
        },
        {
          title: this.$lang("邮箱"),
          minWidth: 140,
          key: "email",
          render: (h, params) =>
            h("span", params.row.email ? params.row.email : "----")
        },
        {
          title: this.$lang("用户姓名"),
          minWidth: 140,
          key: "userName",
          render: (h, params) =>
            h("span", params.row.userName ? params.row.userName : "----")
        },
        {
          title: this.$lang("国籍"),
          minWidth: 140,
          key: "country",
          render: (h, params) =>
            h("span", params.row.country ? params.row.country : "----")
        },
        {
          title: this.$lang("上级经纪人姓名"),
          minWidth: 180,
          key: "agentName",
          render: (h, params) =>
            h("span", params.row.agentName ? params.row.agentName : "----")
        },
        {
          title: this.$lang("上级经纪人UID"),
          minWidth: 170,
          key: "agentUserId",
          render: (h, params) => {
            return params.row.agentUserId
              ? h("User", {
                  props: {
                    uid: params.row.agentUserId
                  }
                })
              : h("span", "----");
          }
        },
        {
          title: this.$lang("上级经纪人级别"),
          minWidth: 180,
          key: "agentLevel",
          render: (h, params) =>
            h(
              "Tag",
              {
                props: {
                  color: params.row.agentLevel == 0 ? "error" : "primary"
                }
              },
              params.row.agentLevel
            )
        },
        {
          title: this.$lang("注册时间"),
          minWidth: 170,
          key: "registerTime"
        }
      ],
      listData: []
    };
  },
  methods: {
    prev() {
      if (this.searchForm.page > 1) {
        this.searchForm.page--;
        this.loadData(true);
      }
    },
    next() {
      if (this.listData.length >= this.searchForm.limit) {
        this.searchForm.page++;
        this.loadData(true);
      }
    },
    loadData(s) {
      if (!s) {
        this.searchForm.page = 1;
      }
      this.loadingTable = true;
      let json = Object.assign(this.searchForm, formatParams(this.inputInfo));
      if (json.userId) {
        json.accountId = json.userId;
      }
      delete json["phone"];
      this.$axios
        .post("/api/v1/agent/query/broker/user/list", json)
        .then(result => {
          this.loadingTable = false;
          this.listData = [];
          if (result.code === 0 && result.data) {
            this.listData = result.data.data;
          }
        });
    }
  },
  created() {
    this.loadData();
  }
};
</script>