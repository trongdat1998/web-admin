<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      strong {{$lang('商家名单')}} : 
      iSwitch(size="small" v-model="showStatus", @on-change="change" :disabled="isRead")
    Col(span="16" v-if="showStatus")
      Input(search :placeholder="$lang('用户ID')" v-model="searchForm.userId", enter-button="" @on-search="loadData")
    Col(span="4" v-if="showStatus")
      Button(type="primary" long @click="createOne" :disabled="isRead" icon="md-add-circle" ghost) {{$lang('新建')}}
  Alert {{$lang('未开启商家名单功能，则所有通过KYC审核用户均可发OTC广告；开启商家名单功能后，则只有添加进商家名单的用户ID才能发布OTC广告，建议开启商家名单功能。')}}
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable" v-if="showStatus")
  Modal.page-exchange-win(v-model="createStatus", :title="$lang('新建')" @on-ok="doCreate", :loading="loading" width="360")
    Input(v-model='formData.userId', :placeholder="$lang('用户ID')")
  Modal(v-model="removeStatus" width="360")
    p(slot="header" style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{$lang("删除")}}
    p {{$lang("删除")}} {{$lang('用户ID')}}: {{reItem.userId}} ？
    div(slot="footer")
      Button(type="error"  long @click="doRemove") {{$lang('确定')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["isRead"])
  },
  data() {
    return {
      showStatus: false,
      loadingTable: true,
      createStatus: false,
      removeStatus: false,
      loading: true,
      listData: [],
      searchForm: {
        userId: "",
        current: 1,
        pageSize: 100
      },
      formData: {
        userId: ""
      },
      reItem: {},
      columns: [
        {
          title: "#",
          width: 80,
          type: "index"
        },
        {
          title: this.$lang("用户ID"),
          minWidth: 120,
          key: "userId",
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId
              }
            })
        },
        {
          title: this.$lang("昵称"),
          minWidth: 120,
          key: "nickname"
        },
        {
          title: this.$lang("手机号"),
          minWidth: 120,
          key: "mobile",
          render: (h, p) =>
            h(
              "span",
              p.row.mobile
                ? "+" + p.row.nationalCode + " " + p.row.mobile
                : "---"
            )
        },
        {
          title: "Email",
          minWidth: 120,
          key: "email",
          render: (h, p) => h("span", p.row.email ? p.row.email : "---")
        },
        {
          title: this.$lang("30天成交笔数"),
          minWidth: 80,
          key: "finishOrderNumber30Days"
        },
        {
          title: this.$lang("30天成交率"),
          minWidth: 80,
          render: (h, p) =>
            h("span", (p.row.finishOrderfRate30Days * 100).cutFixed(2) + "%")
        },
        {
          title: this.$lang("操作"),
          width: 100,
          fixed: "right",
          align: "center",
          render: (h, params) => {
            return h(
              "Button",
              {
                attrs:{
                  disabled:this.isRead,
                  size:"small",
                  type:"error"
                },
                on: {
                  click: () => {
                    this.removeStatus = true;
                    this.removeOne(params.row);
                  }
                }
              },
              this.$lang("删除")
            );
          }
        }
      ]
    };
  },
  methods: {
    change() {
      this.$axios
        .post("/api/v1/otc/white_list/set", {
          status: this.showStatus ? 1 : 0
        })
        .then(() => this.loadStauts());
    },
    loadData() {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/otc/user/white/list", this.searchForm)
        .then(result => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data;
          }
        });
    },
    loadStauts() {
      this.$axios.post("/api/v1/otc/white_list/status").then(result => {
        if (result.code === 0) {
          this.showStatus = result.data;
        }
      });
    },
    createOne() {
      this.formData.userId = "";
      this.createStatus = true;
    },
    removeOne(item) {
      this.reItem = item;
      this.removeStatus = true;
    },
    doRemove() {
      this.$axios
        .post("/api/v1/otc/user/white/del", this.reItem)
        .then(result => {
          if (result.code == 0) {
            this.removeStatus = false;
            this.loadData();
          }
        });
    },
    doCreate() {
      this.$axios
        .post("/api/v1/otc/user/white/add", this.formData)
        .then(result => {
          if (result.code == 0) {
            this.createStatus = false;
          }
          this.loadData();
        });
    }
  },
  created() {
    this.loadData();
    this.loadStauts();
  }
};
</script>