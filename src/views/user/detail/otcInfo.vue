<template lang="pug">
Card(dis-hover :title="$lang('OTC信息')" style="margin-top:20px")
  Row(:gutter="30" style="margin-bottom:20px")
    Col(span="6") {{$lang("昵称")}}：{{data.nickname}}
      | &nbsp;&nbsp;&nbsp;
      Button(type="error" v-if="data.nickname" @click="edit()" size="small" :disabled="isRead") {{$lang('修改')}}
    Col(span="6") {{$lang("30天成交笔数")}}：{{data.finishOrderNumber30Days}}
    Col(span="6") {{$lang("30天成交率")}}：{{(data.finishOrderfRate30Days*100).cutFixed(2)}}%
    Col(span="6") {{$lang("24小时内买币价值")}}：{{data.usdtValue24HoursBuy}}USDT
  Table(:columns="columns", :data="payments", :loading="loading")
    template(slot-scope="{ row, index }" slot="code")
      template(v-if="row.paymentType==0") ----
      Poptip(trigger="hover" v-else)
        img(:src="row.qrcode" slot="content" width="300")
        Icon(type="ios-image" size="24")
  Modal(v-model="editWin" :title="$lang('修改OTC昵称')" width="300")
    Input(v-model="formData.value" :placeholder="$lang('OTC昵称')")
    Button(slot="footer" long type="success" @click="editName" :loading="loading" :disabled="loading") {{$lang('确定')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["isRead"])
  },
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
      formData: {
        key: this.$route.params.userId,
        value: ""
      },
      editWin: false,
      types: {
        0: this.$lang("银行卡"),
        1: this.$lang("支付宝"),
        2: this.$lang("微信")
      },
      banks: {
        ABC: "农业银行",
        "Bank of Shanghai": "上海银行",
        BAY: "大城银行",
        BBL: "曼谷银行",
        BCM: "交通银行",
        BOB: "北京银行",
        BOC: "中国银行",
        CCB: "建设银行",
        CEB: "光大银行",
        "China Citic Bank": "中信银行",
        CIB: "兴业银行",
        CIMB: "CIMB泰国银行",
        CMB: "招商银行",
        CMBC: "民生银行",
        GDB: "广发银行",
        "Huaxia Bank": "华夏银行",
        ICBC: "工商银行",
        "K-Bank": "开泰银行",
        KTB: "泰京银行",
        OTHER: "其他",
        PAB: "平安银行",
        PSBC: "邮储银行",
        SCB: "汇商银行",
        SPDB: "浦发银行",
        TCR: "TCR银行 ",
        Thanachart: "Thanachart银行",
        TMB: "泰国军人银行",
        UOB: "大华银行"
      },
      loading: false,
      data: {
        accountId: "",
        finishOrderNumber30Days: "",
        finishOrderfRate30Days: "",
        nickname: "",
        usdtValue24HoursBuy:""
      },
      payments: [],
      columns: [
        {
          title: "#",
          type: "index"
        },
        {
          title: this.$lang("类型"),
          width: 100,
          render: (h, params) => h("span", this.types[params.row.paymentType])
        },
        {
          title: this.$lang("姓名"),
          minWidth: 150,
          key: "realName"
        },
        {
          title: this.$lang("信息"),
          minWidth: 250,
          render: (h, params) => {
            if (params.row.paymentType == 0) {
              return h(
                "span",
                "【" +
                  (this.banks[params.row.bankName] || params.row.bankName) +
                  "】" +
                  params.row.accountNo
              );
            } else {
              return h("span", params.row.accountNo);
            }
          }
        },
        {
          title: this.$lang("二维码"),
          minWidth: 150,
          slot: "code"
        },
        {
          title: this.$lang("状态"),
          minWidth: 150,
          render: (h, params) =>
            h(
              "Tag",
              {
                props: {
                  color: params.row.visible ? "success" : "default",
                  type: "dot"
                }
              },
              this.$lang(params.row.visible ? "已启用" : "已禁用")
            )
        }
      ]
    };
  },
  methods: {
    edit() {
      this.formData.value = this.data.nickname;
      this.formData.key = this.data.accountId;
      this.editWin = true;
    },
    editName() {
      this.loading = true;
      this.$axios
        .post("/api/v1/brokeruser/otc/nickname/modify", this.formData)
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.editWin = false;
            this.load();
          }
        });
    },
    loadPayment(accountId) {
      this.loading = true;
      this.$axios
        .post("/api/v1/brokeruser/otc/payments", {
          id: accountId
        })
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.payments = result.data;
          }
        });
    },
    load() {
      this.loading = true;
      this.$axios
        .post("/api/v1/brokeruser/otc/user_info", {
          id: this.$route.params.userId
        })
        .then(result => {
          this.loading = false;
          if (result.code == 0 && result.data) {
            this.data = result.data;
            this.loadPayment(result.data.accountId);
          }
        });
    }
  },
  created() {
    this.load();
  }
};
</script>