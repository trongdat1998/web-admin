<template lang="pug">
	Main.page-exchange
		Row.search(:gutter="15")
			Col(span="24")
				Input(search :placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')}`" v-model="inputInfo", enter-button="" @on-search="changTab")
		Tabs(@on-click="changTab", v-model="tabsValue")
			TabPane(:label="$lang('待审核')")
			TabPane(:label="$lang('审核历史')")
		Table(:columns="columns", :data="listData", :loading="loading")
		Row.page-pages(v-show="searchForm.hasMore")
			Col(span="8") &nbsp;
			Col(span="8")
				Button(long @click="loadData" type="primary" ghost) {{$lang('点击加载更多')}}
			Col(span="8") &nbsp;
		Modal(v-model="userStatus" width="600", :mask-closable="false", :title="formData.verifyPassed ? $lang('通过') : $lang('拒绝')")
			Alert {{$lang('您确定要执行此操作吗？')}}
			RadioGroup(vertical, v-model="formData.failedReason" v-if="!formData.verifyPassed")
				Radio(label="101")
					span {{ $lang("提币拒绝：登录地址异常，无法确认提币安全性，请联系客服") }}
				Radio(label="102")
					span {{ $lang("提币拒绝：客服致电未接通，请注意接听电话") }}
				Radio(label="103")
					span {{ $lang("提币拒绝：2FA绑定不全，无法确认提币安全性，请联系客服") }}
				Radio(label="104")
					span {{ $lang("提币拒绝：客服致电，接听人反馈不是本人操作") }}
				Radio(label="105")
					span {{ $lang("提币拒绝：为了保障您的资产安全，请联系客服") }}
				Radio(label="106")
					span {{ $lang("提币拒绝：其他") }}
			Input(v-model="formData.refuseReason", v-if="formData.failedReason == 106", :placeholder="`${$lang('请输入拒绝原因')}`", style="margin-left: 19px; width: 540px")
			template(slot="footer")
				Button(:type="formData.verifyPassed?'success':'error'" @click="settings" long) {{$lang(formData.verifyPassed?'通过':'拒绝')}}
</template>
<script>
  import { formatParams } from "@/libs/common.js";
  import { mapState } from "vuex";

  export default {
    computed: {
      ...mapState(["isRead"])
    },
    data () {
      return {
        tabsValue: 0,
        userStatus: false,
        list: [],
        userInfo: {},
        msg: "",
        formData: {
          verifyPassed: true,
          withdrawOrderId: "",
          userId: "",
          remark: "",
          failedReason: '101',
          refuseReason: "",
        },

        loading: true,
        front: true,
        inputInfo: "",
        searchForm: {
          userId: "",
          mobile: "",
          email: "",
          fromId: 0,
          lastId: 0,
          pageSize: 200,
          next: false,
          hasMore: false
        },
        columns: [],
        defaultColumns: [
          {
            type: "index",
            minWidth: 60
          },
          {
            title: this.$lang("提交时间"),
            minWidth: 190,
            render: (h, p) => h("span", this.newDate(p.row.created).format()),
            sortable: true
          },
          {
            title: "UID",
            minWidth: 180,
            key: "userId",
            render: (h, params) =>
              h("User", {
                props: {
                  uid: params.row.userId
                }
              })
          },
          {
            title: this.$lang("提币数量"),
            minWidth: 150,
            key: "quantity"
          },

        ],
        listData: []
      };
    },
    methods: {
      loadData () {
        this.searchForm.hasMore = false;
        this.loading = true;

        if (this.tabsValue) {
          this.columns = [
            ...this.defaultColumns,
            {
              title: this.$lang("到账数量"),
              minWidth: 150,
              key: "arrivalQuantity"
            },
            {
              title: this.$lang("币种"),
              minWidth: 90,
              key: "tokenId",
              sortable: true
            },
            {
              title: this.$lang("提币地址"),
              minWidth: 190,
              key: "address"
            },
            {
              title: this.$lang("审核时间"),
              minWidth: 190,
              render: (h, p) => h("span", this.newDate(p.row.verifyTime).format())
            },
            {
              title: this.$lang("审核人员"),
              minWidth: 190,
              key: "adminUserName"
            },
            {
              title: this.$lang("拒绝理由"),
              minWidth: 190,
              key: "failedReasonDesc"
            },
            {
              title: this.$lang("状态"),
              width: 140,
              fixed: "right",
              align: "center",
              render: (h, params) =>
                h(
                  "Tag",
                  {
                    props: {
                      color: params.row.verifyStatus == 3 ? "success" : "error"
                    }
                  },
                  this.$lang(params.row.verifyStatus == 3 ? "通过" : "拒绝")
                )
            }
          ];
        } else {
          this.columns = [
            ...this.defaultColumns,

            {
              title: this.$lang("提币折合") + "(USDT)",
              minWidth: 170,
              key: "quantityInUsdt",
              sortable: true
            },
            {
              title: this.$lang("到账数量"),
              minWidth: 150,
              key: "arrivalQuantity"
            },
            {
              title: this.$lang("币种"),
              minWidth: 90,
              key: "tokenId",
              sortable: true
            },
            {
              title: this.$lang("提币地址"),
              minWidth: 190,
              key: "address"
            },
            {
              title: this.$lang("操作"),
              width: 140,
              fixed: "right",
              align: "center",
              render: (h, params) => h('ButtonGroup', [
                h(
                  "Button",
                  {
                    attrs: {
                      ghost: true,
                      size: "small",
                      type: "success",
                      disabled: this.isRead
                    },
                    on: {
                      click: () => {
                        this.formData.verifyPassed = true;
                        this.formData.withdrawOrderId =
                          params.row.withdrawOrderId;
                        this.formData.userId = params.row.userId;
                        this.userStatus = true;
                      }
                    }
                  },
                  this.$lang("通过")
                ),
                h(
                  "Button",
                  {
                    attrs: {
                      ghost: true,
                      size: "small",
                      type: "error",
                      disabled: this.isRead
                    },
                    on: {
                      click: () => {
                        this.formData.verifyPassed = false;
                        this.formData.withdrawOrderId =
                          params.row.withdrawOrderId;
                        this.formData.userId = params.row.userId;
                        this.userStatus = true;
                      }
                    }
                  },
                  this.$lang("拒绝")
                )
              ])
            }
          ];
        }

        this.$axios
          .post(
            this.tabsValue
              ? "/api/v1/withdraw_order/verify_history"
              : "/api/v1/withdraw_order/unverified_list",
            Object.assign(this.searchForm, formatParams(this.inputInfo))
          )
          .then(result => {
            this.loading = false;
            if (result.data.length == this.searchForm.pageSize) {
              this.searchForm.hasMore = true;
              this.searchForm.fromId =
                result.data[this.searchForm.pageSize - 1].withdrawOrderId;
            }
            this.listData = [...this.listData, ...result.data];
          });
      },
      changTab () {
        this.searchForm.fromId = 0;
        this.searchForm.lastId = 0;
        this.listData = [];
        this.loadData();
      },
      settings () {
        this.$axios
          .post("/api/v1/withdraw_order/verify", this.formData)
          .then(result => {
            if (result.code == 0) {
              this.userStatus = false;
              this.changTab();
            }
          });
      }
    },
    created () {
      this.loadData();
    }
  };
</script>
