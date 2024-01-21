<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="20")
      strong {{$lang('返佣有效期')}} : 
      RadioGroup(v-model="formData.autoTransfer" @on-change="autoTransfer")
        Radio(:disabled="isRead" :label="1") {{$lang("自动转账")}}
        Radio(:disabled="isRead" :label="0") {{$lang("手动转账")}}
    Col(span="4")
      Button(long to="/activity/invite_transfer/detail/" type="primary" size="small" icon="md-search") {{$lang('搜索')}}
  Alert(type="error" style="margin-top:15px") {{$lang("自动转账，无需人工审核直接将返佣转账给用户，自动转账时间每日UTC +8(新加坡时间) 10:00以后")}}<br/>{{$lang("手动转账需要人工确认后，才会转账给用户")}}<br/>{{$lang("转账前，请确定运营账号有足够的余额，否则会导致转账失败")}}
  Table(:columns="columns", :data="listData", :loading="loading" @on-expand="expand")
  Row(:gutter="20" style="padding-top:30px")
    Col(span="10")
    ButtonGroup
      Button(icon="ios-arrow-back" @click="prev"  :disabled="searchForm.page==1")
      Button(icon="ios-arrow-forward" @click="next"  :disabled="listData.length<searchForm.limit")
  Modal(v-model="settingsWinStatus", width="360")
    p(slot="header" style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{$lang('全部返佣')}}
    div(style="text-align:center") {{$lang("您确定执行此操作吗？")}}
    div(slot="footer")
      Button(type="error"  long @click="sendBouns" :loading="loading") {{$lang("确定")}}
</template>
<script>
import expandRow from "./table-expand.vue";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["isRead"])
  },
  components: { expandRow },
  data() {
    return {
      settingsWinStatus: false,
      searchForm: {
        page: 1,
        limit: 30
      },
      loading: false,

      formData: {
        autoTransfer: 0
      },
      model1: "",
      columns: [
        {
          type: "expand",
          width: 50,
          render: (h, params) => {
            return h(expandRow, {
              props: {
                list: params.row.list
              }
            });
          }
        },
        {
          title: this.$lang("时间"),
          minWidth: 160,
          key: "statisticsTime"
        },
        {
          title: this.$lang("状态"),
          minWidth: 160,
          render: (h, p) => {
            let text = {
              0: "未转账",
              1: "转账中",
              2: "部分成功",
              3: "转账成功"
            };
            return h("span", this.$lang(text[p.row.grantStatus]));
          }
        },
        {
          title: this.$lang("返佣名单"),
          minWidth: 160,
          render: (h, params) => {
            if (params.row.changeStatus == 2) {
              return h(
                "Tag",
                {
                  attrs: {
                    color: "primary"
                  }
                },
                this.$lang("处理中")
              );
            }

            return h(
              "Tag",
              {
                attrs: {
                  color: params.row.changeStatus == 0 ? "default" : "error"
                }
              },
              this.$lang(params.row.changeStatus == 0 ? "已生成" : "未生成")
            );
          }
        },
        {
          title: this.$lang("操作"),
          minWidth: 120,
          align: "center",
          render: (h, params) => {
            if (params.row.changeStatus == 2) {
              return h("span", "----");
            }

            if (params.row.changeStatus == 1) {
              return h(
                "Button",
                {
                  attrs: {
                    type: "primary",
                    size: "small",
                    ghost: true,
                    disabled: this.isRead
                  },
                  on: {
                    click: () => {
                      this.refresh(params.row);
                    }
                  }
                },
                this.$lang("刷新名单")
              );
            }

            if (params.row.grantStatus == 0 || params.row.grantStatus == 2) {
              return h(
                "Button",
                {
                  attrs: {
                    type: "success",
                    size: "small",
                    ghost: true,
                    disabled: this.isRead
                  },
                  on: {
                    click: () => {
                      this.formData.statisticsTime = params.row.statisticsTime;
                      this.settingsWinStatus = true;
                      Object.assign(this.formData, params.row);
                    }
                  }
                },
                this.$lang("全部返佣")
              );
            } else {
              return h(
                "span",
                {
                  attrs: {
                    style: `color:${"green"}`
                  }
                },
                this.$lang("转账成功")
              );
            }
          }
        }
      ],
      listData: []
    };
  },

  methods: {
    refresh(row) {
      this.$axios
        .post("/api/v1/invite_fee_back/create_user_bonus_record", {
          statisticsTime: row.statisticsTime
        })
        .then(result => {
          if (result.code == 0) {
            location.reload();
          }
        });
    },
    expand(row, status) {
      if (status) {
        this.$axios
          .post("/api/v1/invite_fee_back/invite_statistics_daily_detail", {
            statisticsTime: row.statisticsTime
          })
          .then(result => {
            this.listData.forEach(el => {
              if (el.statisticsTime == row.statisticsTime) {
                el = Object.assign(el, {
                  list: result.data,
                  _expanded: true
                });
              }
            });
          });
      } else {
        this.listData.forEach(el => {
          if (el.orderId == row.orderId) {
            el = Object.assign(el, {
              _expanded: false
            });
          }
        });
      }
    },
    prev() {
      if (this.searchForm.page > 1) {
        this.searchForm.page--;
        this.loadData();
      }
    },
    next() {
      if (this.listData.length >= this.searchForm.limit) {
        this.searchForm.page++;
        this.loadData();
      }
    },
    loadData() {
      this.loading = true;
      this.$axios
        .post(
          "/api/v1/invite_fee_back/invite_statistics_daily_list",
          this.searchForm
        )
        .then(result => {
          if (result.code == 0) {
            this.formData.autoTransfer = result.data.autoTransfer ? 1 : 0;
            this.listData = result.data.list.map(el => {
              el.list = [];
              return el;
            });
            this.searchForm.page = result.data.page;
          }
          this.loading = false;
        });
    },
    sendBouns() {
      this.loading = true;
      this.$axios
        .post("/api/v1/invite_fee_back/execute_send_bonus", {
          statisticsTime: this.formData.statisticsTime
        })
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.settingsWinStatus = false;
            this.loadData();
          }
        });
    },
    autoTransfer() {
      this.$axios
        .post("/api/v1/invite_fee_back/auto_transfer", {
          enable: this.formData.autoTransfer ? true : false
        })
        .then(result => {
          if (result.code == 0) {
            this.$Message.success(this.$lang("成功"));
          }
        });
    }
  },
  created() {
    this.loadData();
  }
};
</script>