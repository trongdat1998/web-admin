<style lang="less" scoped>
.box {
  display: flex;
  min-height: 300px;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ccc;
  padding: 50px;
}
</style>

<template lang="pug">
div(v-if="isInit")
  template(v-if="isBind")
    Alert {{ $lang('券商简称') }}：{{ brokerName }} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Account ID：{{ accountId }}
    Alert(type="warning", show-icon, v-if="createForm.accountType == 7") {{ $lang('assets.tips') }}
  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable",
    v-if="isBind"
  )
  .box(@click="bind", v-else)
    Button(
      icon="md-add-circle",
      type="primary",
      @click="bind",
      :disabled="isRead"
    ) {{ $lang('绑定资金子账户') }}

  // 绑定资金子账户    
  Modal.page-exchange-win(
    v-model="creatWinStatus",
    :title="$lang('绑定资金子账户')",
    @on-ok="doNext",
    :loading="loading"
  )
    Form(:model="createForm", :label-width="120")
      FormItem(:label="$lang('类型')")
        Input(:value="type[createForm.accountType]", readonly)
      FormItem(:label="$lang('券商简称')")
        Input(v-model="createForm.brokerName", :placeholder="$lang('券商简称')")
      FormItem(:label="$lang('登录账号')")
        Input(v-model="createForm.username", :placeholder="$lang('登录账号')")
      FormItem(:label="$lang('验证码')")
        Input(v-model="createForm.validateCode", :placeholder="$lang('验证码')")
          span(slot="append", v-if="time") {{ time }}s
          a(slot="append", v-else, @click="getCode") {{ $lang('获取验证码') }}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["isRead"]),
  },
  data() {
    return {
      loading: true,
      loadingTable: true,
      listData: [],
      creatWinStatus: false,
      time: 0,
      isInit: false,
      isBind: false,
      accountId: "",
      brokerName: "",
      type: {
        7: this.$lang("运营账户"),
        13: this.$lang("营收账户"),
        //10: this.$lang("保证金")
      },
      createForm: {
        username: "",
        accountType: this.$route.path.indexOf("revenue") > -1 ? 13 : 7,
        brokerName: "",
        validateCode: "",
      },
      columns: [
        {
          title: this.$lang("全称"),
          minWidth: 160,
          key: "tokenFullName",
        },
        {
          title: this.$lang("可用"),
          minWidth: 160,
          key: "available",
        },
        {
          title: this.$lang("冻结"),
          minWidth: 160,
          key: "locked",
        },
        {
          title: this.$lang("币种"),
          minWidth: 160,
          key: "tokenId",
        },
      ],
    };
  },
  created() {
    this.loadData();
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
      this.$axios
        .post("/api/v1/platform_account/assets", this.createForm)
        .then((result) => {
          if (result.code === 0) {
            this.isInit = true;
            this.loadingTable = false;
            this.listData = result.data.list;
            this.isBind = result.data.isBind;
            this.brokerName = result.data.brokerName;
            this.accountId = result.data.accountId;
          }
        });
    },
    bind() {
      this.creatWinStatus = true;
    },
    getCode() {
      this.$axios
        .post("/api/v1/platform_account/send_validate_code", this.createForm)
        .then((result) => {
          if (result.code == 0) {
            this.time = 60;
          }
        });
    },
    doNext() {
      this.$axios
        .post("/api/v1/platform_account/bind", this.createForm)
        .then((result) => {
          this.loading = false;
          setTimeout(() => {
            this.loading = true;
          }, 200);
          if (result.code == 0) {
            this.loadData();
            this.creatWinStatus = false;
          }
        });
    },
  },
};
</script>