<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="20")
      Alert {{$lang("黑名单的用户的产生的佣金不会返还给他的上级邀请人")}}
    Col(span="4")
      Button(ghost  type="primary" @click="openBlackListWindow" long  icon="md-add-circle" :disabled="isRead") {{$lang('添加黑名单')}}
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
  Modal(v-model="settingsWinStatus" width="360")
    p(slot="header" style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{$lang('删除')}}
    div(style="text-align:center") {{$lang("您确定执行此操作吗？")}}
    div(slot="footer")
      Button(type="error"  long @click="deleteBlackList" :loading="loadingTable") {{$lang("确定")}}
  Modal.page-exchange-win(v-model="addSettingsWinStatus", :title="$lang('添加黑名单')" @on-ok="addBlackList" width="360")
    Input(v-model='searchForm.userId', placeholder="UID")

  .page-pages
    ButtonGroup(v-if="hasNext || hasPrev")
      Button(type="primary" v-if="hasPrev && markId" @click="prev")
        Icon(type="ios-arrow-back")
        | {{$lang("上一页")}}
      Button(type="primary" v-else disabled)
        Icon(type="ios-arrow-back")
        | {{$lang("上一页")}}
      
      Button(type="primary"  @click="next" v-if="hasNext")
        | {{$lang("下一页")}}
        Icon(type="ios-arrow-forward")
      Button(type="primary"  disabled v-else)
        | {{$lang("下一页")}}
        Icon(type="ios-arrow-forward")
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["isRead"])
  },
  data() {
    return {
      addSettingsWinStatus: false,
      settingsWinStatus: false,
      loadingTable: true,
      searchForm: {
        userId: "",
        pageSize: 100,
        next: true,
        current: 1
      },
      hasNext: false,
      hasPrev: false,
      markId: 0,
      listData: [],
      date: [],
      columns: [
        {
          title: this.$lang("时间"),
          minWidth: 190,
          key: "createdAt",
          render: (h, p) => {
            return h("span", this.newDate(p.row.createdAt).format());
          }
        },
        {
          title: "UserID",
          minWidth: 160,
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId
              }
            })
        },
        {
          title: this.$lang("联系方式"),
          minWidth: 160,
          key: "userContact"
        },
        {
          title: this.$lang("操作"),
          minWidth: 100,
          width: 100,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h(
              "Button",
              {
                attrs: {
                  type: "error",
                  size: "small",
                  disabled: this.isRead
                },
                on: {
                  click: () => {
                    this.searchForm.userId = params.row.userId;
                    this.settingsWinStatus = true;
                    Object.assign(this.searchForm, params.row);
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
  created() {
    this.loadData();
  },
  methods: {
    prev() {
      this.searchForm.current = this.searchForm.current - 1;
      if (this.searchForm.current < 1) {
        this.searchForm.current = 1;
      }
      this.searchForm.next = false;
      this.loadData();
    },
    next() {
      this.searchForm.current = this.searchForm.current + 1;
      this.loadData();
    },
    deleteBlackList() {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/invite_fee_back/delete_invite_black_list", {
          userId: this.searchForm.userId
        })
        .then(result => {
          this.loadingTable = false;
          if (result.code === 0) {
            location.reload();
          }
        });
    },
    openBlackListWindow() {
      this.searchForm.userId = "";
      this.addSettingsWinStatus = true;
    },
    addBlackList() {
      this.$axios
        .post("/api/v1/invite_fee_back/add_invite_black_list", this.searchForm)
        .then(result => {
          if (result.code === 0) {
            this.loadingTable = false;
            this.loadData();
          }
        });
    },
    loadData() {
      this.loadingTable = true;

      this.$axios
        .post("/api/v1/invite_fee_back/invite_black_list", this.searchForm)
        .then(result => {
          this.loadingTable = false;
          if (result.code === 0 && result.data.length) {
            if (!this.markId) {
              this.markId = result.data[0].id;
            }

            if (this.markId != result.data[0].id) {
              this.hasPrev = true;
            } else {
              this.hasPrev = false;
            }
            if (result.data.length >= this.searchForm.pageSize) {
              this.hasNext = true;
            } else {
              this.hasNext = false;
            }
            this.listData = result.data ? result.data : [];
          } else {
            this.hasNext = false;
          }
          if (this.searchForm.current == 1) {
            this.hasPrev = false;
          }
        });
    }
  }
};
</script>