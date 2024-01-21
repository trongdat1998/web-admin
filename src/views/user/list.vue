<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="24")
      Input(search :placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')} / AccountId`" v-model="inputInfo", enter-button="" @on-search="loadData")
  Table(:columns="columns", :data="listData" , :loading="loadingTable")
    template(slot="email" slot-scope="{ row, index }")
      Tag(v-if="row.email" color="success")
        | {{ $lang("已绑定") }}
</template>
<script>
import { formatParams } from "@/libs/common.js";
import { mapState } from "vuex";
export default {
  data() {
    return {
      emailModel: false,
      loading: false,
      time: 0,
      suffixList: [],
      formData: {
        verifyCode: "",
        suffix: "",
        mobile: "",
      },
      seachForm: {
        userId: "",
        nationalCode: "",
        phone: "",
        email: "",
        accountId: "",
      },
      loadingTable: true,
      inputInfo: "",
      columns: [
        {
          title: this.$lang("用户ID"),
          key: "userId",
          minWidth: 190,
        },
        {
          title: "AccountID",
          key: "accountId",
          minWidth: 190,
        },
        {
          title: this.$lang("姓氏"),
          minWidth: 140,
          key: "firstName",
        },
        {
          title: this.$lang("名字"),
          minWidth: 140,
          key: "secondName",
        },
        {
          title: this.$lang("手机"),
          minWidth: 140,
          render: (h, params) =>
            h(
              "Tag",
              { props: { color: params.row.mobile ? "success" : "default" } },
              this.$lang(params.row.mobile ? "已绑定" : "未绑定")
            ),
        },
        {
          title: this.$lang("邮箱"),
          minWidth: 140,
          slot: "email",
        },
        {
          title: this.$lang("GA"),
          minWidth: 140,
          render: (h, params) =>
            h(
              "Tag",
              { props: { color: params.row.bindGa ? "success" : "default" } },
              this.$lang(params.row.bindGa ? "已绑定" : "未绑定")
            ),
        },
        {
          title: this.$lang("实名认证"),
          minWidth: 140,
          render: (h, params) => {
            let msg = "未提交审核";
            if (params.row.verifyStatus == 1) {
              msg = "未审核";
            } else if (params.row.verifyStatus == 2) {
              msg = "审核通过";
            } else if (params.row.verifyStatus == 3) {
              msg = "审核拒绝";
            }
            return h(
              "Tag",
              {
                props: {
                  color: params.row.verifyStatus == 2 ? "success" : "default",
                },
              },
              this.$lang(msg)
            );
          },
        },
        {
          title: this.$lang("操作"),
          width: 100,
          fixed: "right",
          align: "center",
          render: (h, params) => {
            return h(
              "User",
              {
                props: {
                  uid: params.row.userId,
                },
              },
              this.$lang("详情")
            );
          },
        },
      ],
      listData: [],
    };
  },
  computed: {
    ...mapState(["userInfo"]),
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--;
        }, 1000);
      }
    },
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      let json = Object.assign(this.seachForm, formatParams(this.inputInfo));
      if (json.userId) {
        json.accountId = json.userId;
      }
      this.$axios
        .post("/api/v1/brokeruser/get_broker_user", json)
        .then((result) => {
          this.loadingTable = false;
          this.listData = [];
          if (result.code === 0 && result.data) {
            this.listData = [result.data];
          }
        });
    },
  },
  created() {
    this.loadData();
  },
};
</script>
