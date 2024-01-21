<template lang="pug">
  Table(:columns="columns", :data="listData" :loading="loading")
</template>
<script>
export default {
  props: {
    searchForm: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      loading: false,
      listData: [],
      types: {
        updatePassword: this.$lang("修改密码"),
        bindEmail: this.$lang("绑定邮箱"),
        bindMobile: this.$lang("绑定手机"),
        bindGA: this.$lang("绑定GA"),
        findPwd: this.$lang("找回密码"),
        createApiKey: this.$lang("创建API"),
        deleteApiKey: this.$lang("删除API"),
        setTradePassword: this.$lang("设置交易密码"),
        setOtcNickName: this.$lang("设置OTC昵称"),
        addOtcPayment: this.$lang("新增OTC支付方式"),
        deleteOtcPayment: this.$lang("删除OTC支持方式"),
        createSubAccount: this.$lang("创建子账户"),
        purchaseFinance: this.$lang("购买理财")
      },
      columns: [
        {
          title: this.$lang("时间"),
          minWidth: 190,
          key: "created",
          render: (h, params) =>
            h("span", this.newDate(params.row.created).format())
        },
        {
          title: "IP",
          minWidth: 160,
          key: "remoteIp"
        },
        {
          title: this.$lang("操作内容"),
          minWidth: 160,
          key: "actionType",
          render: (h, p) => h("span",this.types[p.row.actionType])
        },
        {
          title: this.$lang("操作平台"),
          minWidth: 160,
          key: "platform"
        },
        {
          title: this.$lang("状态"),
          minWidth: 160,
          key: "resultCode",
          render: (h, p) => {
            if (p.row.resultCode == 0) {
              return h("span", this.$lang("成功"));
            } else {
              return h("span", this.$lang("失败") + ":" + p.row.resultCode);
            }
          }
        }
      ]
    };
  },
  created() {
    this.loading = true;
    this.$axios
      .post(
        "/api/v1/brokeruser/user_action_logs",
        Object.assign(
          {
            current: 1,
            pageSize: 100
          },
          this.searchForm
        )
      )
      .then(result => {
        this.loading = false;
        if (result.code == 0) {
          this.listData = result.data;
        }
      });
  }
};
</script>