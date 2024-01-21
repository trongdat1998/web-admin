<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="20") &nbsp;
    Col(span="4")
      Button(
        long,
        type="primary",
        @click="newOne",
        icon="md-add-circle",
        ghost,
        :disabled="isRead"
      ) {{ $lang('新建') }}
  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable"
  )
    template(slot-scope="{ row, index }", slot="show")
      iSwitch(
        v-model="row.isShow",
        :disabled="isRead",
        :false-value="0",
        :true-value="1",
        @on-change="online(row, index)",
        :loading="index === editIndex",
        size="small"
      )

  // 绑定资金子账户    
  Modal.page-exchange-win(
    v-model="creatWin",
    :title="$lang('绑定资金子账户')",
    :mask-closable="false"
  )
    Form
      FormItem(label="AID")
        Input(
          v-model="formData.accountId",
          placeholder="AID",
          :disabled="!!formData.requestId"
        )
      template(v-if="formData.requestId")
        FormItem(label="UID") 
          User(:uid="formData.userId")
        FormItem(:label="$lang('谷歌验证码')", v-if="formData.authType == 3")
          Input(
            :maxlength="6",
            v-model="formData.verifyCode",
            :placeholder="$lang('验证码')"
          )
        FormItem(:label="$lang('手机验证码')", v-else)
          Input(
            :maxlength="6",
            v-model="formData.verifyCode",
            :placeholder="$lang('验证码')"
          )
            span(slot="append", v-if="time") {{ time }}s
            a(slot="append", v-else, @click="check") {{ $lang('获取验证码') }}
        FormItem(:label="$lang('标识')")
          Input(v-model="formData.tag", :placeholder="$lang('标识')")
        FormItem(:label="$lang('备注')")
          Input(
            v-model="formData.remark",
            :placeholder="$lang('备注')",
            type="textarea",
            :rows="4"
          )
    div(slot="footer")
      Button(
        :loading="loading",
        :disabled="!!loading",
        @click="bind",
        type="primary",
        long,
        v-if="formData.requestId"
      ) {{ $lang('确定') }}
      Button(
        :loading="loading",
        :disabled="!!loading",
        @click="check",
        type="success",
        long,
        v-else
      ) {{ $lang('账户检测') }}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["isRead"]),
  },
  data() {
    return {
      redirectUrl: this.$route.query.redirectUrl,
      editIndex: null,
      loading: false,
      loadingTable: true,
      listData: [],
      creatWin: false,
      time: 0,

      formData: {
        userId: "",
        accountId: "",
        authType: "",
        requestId: "",
        verifyCode: "",
        tag: "",
        remark: "",
      },
      columns: [
        {
          title: this.$lang("创建时间"),
          minWidth: 160,
          key: "createdAt",
          render: (h, p) => h("span", this.newDate(p.row.createdAt).format()),
        },
        {
          title: "AID",
          minWidth: 160,
          key: "accountId",
        },
        {
          title: "UID",
          minWidth: 160,
          key: "userId",
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId,
              },
            }),
        },
        {
          title: this.$lang("标识"),
          minWidth: 160,
          key: "tag",
        },
        {
          title: this.$lang("备注"),
          minWidth: 160,
          key: "remark",
        },

        {
          title: this.$lang("状态"),
          minWidth: 160,
          slot: "show",
          align: "right",
        },
      ],
    };
  },
  created() {
    this.loadData();
    if (this.redirectUrl) {
      this.newOne();
    }
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
    online(row, index) {
      this.editIndex = index;
      this.$axios
        .post(
          row.isShow
            ? "/api/v1/platform_account/fund_account/set_visible"
            : "/api/v1/platform_account/fund_account/set_unvisible",
          {
            accountId: row.accountId,
          }
        )
        .then((result) => {
          this.editIndex = "";
          if (result.code != 0) {
            row.isShow = !row.isShow ? 1 : 0;
          }
        });
    },
    newOne() {
      this.creatWin = true;
      Object.assign(this.formData, {
        userId: "",
        accountId: "",
        authType: "",
        requestId: "",
        verifyCode: "",
        tag: "",
        remark: "",
      });
    },
    loadData() {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/platform_account/fund_account/query", {})
        .then((result) => {
          if (result.code === 0) {
            this.loadingTable = false;
            this.listData = result.data;
          }
        });
    },
    check() {
      this.loading = true;
      this.$axios
        .post("/api/v1/platform_account/fund_account/check", this.formData)
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            this.time = 60;
            Object.assign(this.formData, result.data);
          }
        });
    },
    getCode() {
      this.$axios
        .post("/api/v1/platform_account/send_validate_code", this.formData)
        .then((result) => {
          if (result.code == 0) {
            this.time = 60;
          }
        });
    },
    bind() {
      this.loading = true;
      this.$axios
        .post("/api/v1/platform_account/fund_account/bind", this.formData)
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            if (this.redirectUrl) {
              location.href = decodeURIComponent(this.redirectUrl);
            } else {
              this.creatWin = false;
              this.loadData();
            }
          }
        });
    },
  },
};
</script>