<template lang="pug">
Main.page-exchange
  Tabs(:animated="false", v-model="searchForm.type", @on-click="search")
    TabPane(
      :label="$lang(item)",
      v-for="(item, key) in typeList",
      :name="key",
      :key="key"
    ) 
    Button(@click="openSrhAdd", slot="extra", type="success") {{ $lang('交易地址查询') }}
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="searchForm.tokenId", @on-change="search", filterable)
        Option(value="all") {{ $lang('全部币种') }}
        Option(
          v-for="item in tokens",
          :value="item.tokenId",
          :key="item.tokenId"
        ) {{ item.tokenName }}
    Col(span="4")
      Input(
        :placeholder="searchForm.type == 'withdraw' ? $lang('提币地址') : $lang('充币地址')",
        v-model="searchForm.address",
        clearable
      )
    Col(span="4")
      Input(:placeholder="$lang('TXID')", v-model="searchForm.txId", clearable)
    Col(span="4")
      DatePicker(
        format="yyyy/MM/dd HH:mm:ss",
        @on-change="changeTimes",
        type="datetimerange",
        style="width:100%",
        :value="times",
        :placeholder="$lang('请选择')"
      )
    Col(span="4")
      Input(
        :placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')}`",
        v-model="inputInfo"
      )
    Col(span="4")
      Button(@click="search", type="primary", long) {{ $lang('搜索') }}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{ row, index }", slot="txid")
      template(v-if="row.txid") {{ row.txid }}
      Account(v-else-if="row.fromAddress", :id="row.fromAddress")
    template(slot-scope="{ row, index }", slot="tokenName") {{ row.tokenId }}
      Tag(v-if="row.isBaas", color="primary") Bass
  Row(:gutter="20", style="padding-top:30px")
    Col(span="10")
      ButtonGroup
        Button(
          @click="getFirstData",
          :disabled="searchForm.fromId == 0",
          icon="ios-skip-backward"
        )
        Button(
          @click="getNextData",
          :disabled="listData.length < searchForm.pageSize",
          icon="ios-arrow-forward"
        )
  Modal(v-model="nextWin", width="400", :title="$lang('入账')")
    Alert {{ $lang('您确定要执行此操作吗？') }}<br><br>
      | AccountId:{{ nextForm.accountId }}<br><br>
      | orderId:{{ nextForm.orderId }}
    Input(
      v-model="nextForm.remark",
      type="textarea",
      :rows="4",
      :placeholder="$lang('备注')"
    )
    template(slot="footer")
      Button(
        type="error",
        @click="doNext",
        long,
        :loading="loading",
        :disabled="loading"
      ) {{ $lang('确定') }}
  Modal(
    v-model="srhAdWin",
    :title="$lang('地址查询')",
    footer-hide,
    :mask-closable="false"
  )
    Form(:label-width="100")
      FormItem(:label="$lang('币种')")
        Select(v-model="srhAddForm.tokenId", filterable)
          Option(
            v-for="item in tokens",
            :value="item.tokenId",
            :key="item.tokenId"
          ) {{ item.tokenName }}
      FormItem(:label="$lang('地址')")
        Input(v-model="srhAddForm.address")
      FormItem(label="TAG")
        Input(v-model="srhAddForm.memo")
      FormItem(label="")
        Button(
          type="primary",
          long,
          @click="srhAdd",
          :loading="loading",
          :disabled="loading"
        ) {{ $lang('确定') }}
      Alert(v-if="addInfo.isWalletAddress && addInfo.brokerUserId")
        | {{ $lang('本券商地址：该地址为{domain}内部用户充币地址').replace('{domain}', apiDomain) }}<br><br>
        | {{ $lang('地址') }}：{{ srhAddForm.address }}<br><br>
        | UID：
        User(:uid="addInfo.brokerUserId")
      Alert(v-else-if="addInfo.isWalletAddress") {{ $lang('该地址为云平台内其他交易所用户充币地址') }}
      Alert(v-else-if="addInfo.isload") {{ $lang('外部地址：本交易所及云平台均查询不到该地址，为外部地址') }}
    template(slot="footer")
      Button(
        type="error",
        @click="srhAdd",
        long,
        :loading="loading",
        :disabled="loading"
      ) {{ $lang('确定') }}
</template>
<script>
import { formatParams } from "@/libs/common.js";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["apiDomain", "tokens"]),
  },
  data() {
    return {
      nextWin: false,
      srhAdWin: false,
      srhAddForm: {
        tokenId: "",
        address: "",
        memo: "",
      },

      addInfo: {
        isWalletAddress: false,
        brokerUserId: "",
        accountId: "",
        isload: false,
      },
      nextForm: {
        orderId: "",
        accountId: "",
        execReceipt: true,
        remark: "",
      },
      times: [],
      cancelModel: false,
      inputInfo: this.$route.query.userId || "",
      searchForm: {
        userId: "",
        mobile: "",
        email: "",
        fromId: 0,
        pageSize: 100,
        type: this.$route.params.type === "deposit" ? "deposit" : "withdraw",
        next: false,
        address: "",
        txId: "",
        startTime: "",
        endTime: "",
        tokenId: "all",
      },
      loading: false,
      loadingTable: false,
      stauts: {
        WITHDRAWAL_STATUS_UNKNOWN: "未知",
        BROKER_AUDITING_STATUS: "券商审核中",
        BROKER_REJECT_STATUS: "券商拒绝",
        AUDITING_STATUS: "平台审核中",
        AUDIT_REJECT_STATUS: "平台拒绝",
        PROCESSING_STATUS: "处理提币",
        WITHDRAWAL_SUCCESS_STATUS: "成功",
        WITHDRAWAL_FAILURE_STATUS: "失败",
        DEPOSIT_STATUS_UNKNOWN: "未知",
        DEPOSIT_BALANCE_ADDED: "已入账",
        DEPOSIT_CAN_WITHDRAW: "可以提现",
        DEPOSIT_BALANCE_NOT_ADD: "确认数不足",
        WITHDRAWAL_CANCELLED_STATUS: "用户取消",
      },
      errorType: {
        1: "平台关闭充值",
        2: "券商关闭充值",
        3: "该用户为充值黑名单",
        4: "小于最小充值金额",
      },
      typeList: {
        withdraw: "提现",
        deposit: "充值",
        unadd: "未入账",
      },
      columns: [],
      columnsDefault: [
        {
          title: this.$lang("用户ID"),
          minWidth: 180,
          key: "userId",
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId,
              },
            }),
        },
        {
          title: this.$lang("订单ID"),
          minWidth: 180,
          key: "orderId",
        },
        {
          title: this.$lang("类型"),
          minWidth: 100,
          key: "businessSubject",
          render: (h) =>
            h("span", this.$lang(this.typeList[this.searchForm.type])),
        },
        {
          title: this.$lang("数量"),
          minWidth: 180,
          key: "tokenQuantity",
          render: (h, params) =>
            this.searchForm.type == "withdraw"
              ? h(
                  "span",
                  params.row.arriveQuantity + "/" + params.row.tokenQuantity
                )
              : h("span", params.row.tokenQuantity),
        },
        {
          title: this.$lang("币种"),
          minWidth: 150,
          key: "tokenId",
          slot: "tokenName",
        },
        {
          title: this.$lang("地址"),
          minWidth: 160,
          key: "address",
        },
        {
          title: this.$lang("TXID"),
          minWidth: 160,
          slot: "txid",
        },
      ],
      listData: [],
    };
  },
  methods: {
    openSrhAdd() {
      Object.assign(this.srhAddForm, {
        tokenId: this.tokens[0].tokenId,
        address: "",
        memo: "",
      });
      Object.assign(this.addInfo, {
        isWalletAddress: false,
        brokerUserId: "",
        accountId: "",
        isload: false,
      });
      this.srhAdWin = true;
    },
    srhAdd() {
      this.loading = true;
      Object.assign(this.addInfo, {
        isWalletAddress: false,
        brokerUserId: "",
        accountId: "",
        isload: false,
      });
      this.$axios
        .get("/api/v1/withdraw_order/query_ask_wallet_address", {
          params: this.srhAddForm,
        })
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            Object.assign(this.addInfo, result.data, { isload: true });
          }
        });
    },
    doNext() {
      this.loading = true;
      this.$axios
        .post("/api/v1/withdraw_order/deposit/un_receipt/exec", this.nextForm)
        .then(() => {
          this.loading = false;
          this.loadData();
          this.nextWin = false;
        });
    },
    changeTimes(val) {
      this.searchForm.startTime = new Date(val[0]).getTime();
      this.searchForm.endTime = new Date(val[1]).getTime();
    },
    search() {
      if (this.searchForm.type == "withdraw") {
        this.columns = [
          {
            title: this.$lang("提交时间"),
            minWidth: 190,
            render: (h, params) =>
              h("span", this.newDate(params.row.createTime).format()),
          },
          ...this.columnsDefault,
          {
            title: this.$lang("审核时间"),
            minWidth: 190,
            render: (h, params) =>
              h(
                "span",
                params.row.verifyTime > 0
                  ? this.newDate(params.row.verifyTime).format()
                  : "---"
              ),
          },
          {
            title: this.$lang("钱包处理时间"),
            minWidth: 190,
            render: (h, params) =>
              h(
                "span",
                params.row.walletHandleTime > 0
                  ? this.newDate(params.row.walletHandleTime).format()
                  : "---"
              ),
          },

          {
            title: this.$lang("状态"),
            minWidth: 100,
            key: "statusCode",
            render: (h, params) =>
              h("span", this.$lang(this.stauts[params.row.statusCode])),
          },
        ];
      } else if (this.searchForm.type == "deposit") {
        this.columns = [
          {
            title: this.$lang("时间"),
            minWidth: 190,
            render: (h, params) =>
              h("span", this.newDate(params.row.createTime).format()),
          },
          ...this.columnsDefault,
          {
            title: this.$lang("链上状态"),
            minWidth: 100,
            key: "statusCode",
            render: (h, params) =>
              h("span", this.$lang(this.stauts[params.row.statusCode])),
          },
          {
            title: this.$lang("入账状态"),
            minWidth: 100,
            key: "receiptType",
            render: (h, params) => {
              if (params.row.statusCode === "DEPOSIT_BALANCE_NOT_ADD") {
                return h("span", this.$lang("待入账"));
              }

              if (params.row.receiptType === 0) {
                return h("span", this.$lang("已到账"));
              } else if (params.row.receiptType === 1) {
                return h("span", this.$lang("入账到锁仓"));
              } else if (params.row.receiptType === 2) {
                return h(
                  "span",
                  this.$lang("未入账") +
                    ":" +
                    params.row.cannotReceiptReason +
                    this.$lang(this.errorType[params.row.cannotReceiptReason])
                );
              }
            },
          },
        ];
      } else {
        this.columns = [
          {
            title: this.$lang("创建时间"),
            minWidth: 200,
            key: "receiptType",
            render: (h, params) =>
              h("span", this.newDate(params.row.time).format()),
          },
          ...this.columnsDefault,
          {
            title: this.$lang("未入账原因"),
            minWidth: 200,
            key: "receiptType",
            render: (h, params) =>
              h(
                "span",
                this.$lang(this.errorType[params.row.cannotReceiptReason])
              ),
          },

          {
            title: this.$lang("操作"),
            minWidth: 100,
            key: "receiptType",
            render: (h, params) => {
              // if (params.row.cannotReceiptReason === 2) {
              return h(
                "a",
                {
                  on: {
                    click: () => {
                      this.nextWin = true;
                      this.nextForm.remark = "";
                      Object.assign(this.nextForm, params.row);
                    },
                  },
                },
                this.$lang("入账")
              );
              // } else {
              //   return h("span", "----");
              // }
            },
          },
        ];
      }
      this.searchForm.fromId = 0;
      this.listData = [];
      this.loadData();
    },
    loadData() {
      this.loadingTable = true;
      let url = "/api/v1/withdraw_order/query/deposit";
      if (this.searchForm.type == "withdraw") {
        url = "/api/v1/withdraw_order/query/withdraw";
      }
      if (this.searchForm.type == "unadd") {
        url = "/api/v1/withdraw_order/query/deposit/un_receipt";
      }

      let json = Object.assign({}, this.searchForm);
      if (json.tokenId == "all") {
        json.tokenId = "";
      }
      this.$axios
        .post(url, Object.assign(json, formatParams(this.inputInfo)))
        .then((result) => {
          if (result.code == 0) {
            this.listData = result.data;
          }
          this.loadingTable = false;
        });
    },
    getFirstData() {
      this.searchForm.fromId = 0;
      this.loadData();
    },
    getNextData() {
      this.searchForm.fromId = this.listData[this.listData.length - 1].orderId;
      this.loadData();
    },
  },
  created() {
    this.search();
  },
};
</script>
