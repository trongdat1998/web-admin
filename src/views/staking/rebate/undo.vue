<template lang="pug">
div
  Table(:columns="columns", :data="data", :loading="loadingTable")
    template(slot-scope="{ row, index }", slot="tag")
      span.border(:style="objectStyle(row)") {{ tag(row) }}
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
    template(slot-scope="{ row, index }", slot="action")
      ButtonGroup
        Button(@click="rebate(row)", size="small", type="error" :disabled="isRead") {{ $lang('派息') }}
        Button(
          :to="`/staking/product/${row.productId}/${productType}`",
          size="small",
          type="primary"
        ) {{ $lang('查看') }}
        Button(
          v-if="productType != 1",
          :disabled="(productType == 2 && row.type == 1)",
          @click="calculation(row)",
          size="small",
          type="warning"
        ) {{ $lang('重新计算') }}
  Modal(v-model="win", width="450")
    p(slot="header", style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{ $lang('派息') }}
    div(style="text-align:center") 【{{ types[formData.productType] }} {{ formData.productName }}】: {{ formData.interestAmount + formData.interestTokenName }}
    Form(:labelWidth="100" style="margin-top: 12px")
      FormItem(:label="$lang('谷歌验证码')" v-if="userInfo.bindGA" required)
        Input( v-model='formData.verifyCode', :placeholder="$lang('谷歌验证码')")
      FormItem(:label="$lang('手机验证码')" v-else required)
        Row
          Col(span="14")
            Input(v-model="formData.verifyCode" type="text" :placeholder="$lang('手机验证码')", :maxlength="6")
          Col(span="2" style="text-align: center") -
          Col(span="8")
            Button(v-if="time" disabled long) {{time}}s
            Button(v-else @click="getCode" long type="primary" ghost :disabled="isRead") {{$lang("获取验证码")}}
    div(slot="footer")
      Button(type="error", long, @click="next", :loading="loading") {{ $lang('确定') }}
  Modal(v-model="calWin", width="450")
    p(slot="header")
      span {{ $lang('重新计算') }}
    div
      Form(:labelWidth="100")
        FormItem(:label="$lang('额度')")
          span {{ calFormData.interestAmount }}{{ calFormData.interestTokenName  }}
        FormItem(:label="calFormData.type == 1 ? $lang('本金') : $lang('利率')" v-if="calFormData.rebateCalcWay == 0" )
          Input( v-model='calFormData.rebateRate')
            template(slot="append") %
        FormItem(:label="$lang('额度')" v-else)
          Input( v-model='calFormData.rebateAmount')
            Select(slot="append" filterable style="width: 80px"  v-model="calFormData.tokenId")
              Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{item.tokenName}}
        FormItem(:label="$lang('谷歌验证码')" v-if="userInfo.bindGA" required)
          Input( v-model='calFormData.verifyCode', :placeholder="$lang('谷歌验证码')")
        FormItem(:label="$lang('手机验证码')" v-else required)
          Row
            Col(span="14")
              Input(v-model="calFormData.verifyCode" type="text" :placeholder="$lang('手机验证码')", :maxlength="6")
            Col(span="2" style="text-align: center") -
            Col(span="8")
              Button(v-if="time" disabled long) {{time}}s
              Button(v-else @click="getCode" long type="primary" ghost :disabled="isRead") {{$lang("获取验证码")}}
    div(slot="footer")
      Button(type="error", long, @click="doCalculation", :loading="loading") {{ $lang('确定') }}
</template>
<script>
import { mapState } from "vuex";
import { Decimal } from "decimal.js";
export default {
  props: {
    loadingTable: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    productType: {
      type: Number,
      default() {
        return 0;
      },
    },
  },
  computed: {
    ...mapState(["lang", "isRead", "userInfo", "tokens"]),
  },
  data() {
    return {
      win: false,
      calWin: false,
      formData: {
        productName: "",
        interestAmount: "",
        tokenName: "",
        productType: "",
        verifyCode: "",
      },
      time: 0,
      calFormData: {
        verifyCode: '',
        interestAmount: '',
        interestTokenName: '',
        type: '',
        rebateRate: '',
        rebateCalcWay: '',
        rebateAmount: '',
        tokenId: '',
      },
      searchForm: {
        lastId: 0,
        limit: 100,
      },
      types: {
        0: this.$lang("定期"),
        2: this.$lang("定期锁仓"),
        1: this.$lang("活期"),
      },

      dividendTypes: {
        0: this.$lang("分期付息"),
        1: this.$lang("一次性还本付息"),
      }, //派息方式:

      repayTypes: {
        0: this.$lang("付息"),
        1: this.$lang("还本"),
      }, //派息类型
      calcTypes: {
        0: this.$lang("利率"),
        1: this.$lang("金额"),
      }, //类型

      loading: false,
      columns: [],
      defaultColumns: [
        {
          title: this.$lang("本次操作"),
          minWidth: 100,
          key: "type",
          render: (h, params) =>
            h("span", this.repayTypes[params.row.type]),
        },
        {
          title: this.$lang("类型"),
          minWidth: 100,
          key: "rebateCalcWay",
          render: (h, params) =>
            h("span", this.calcTypes[params.row.rebateCalcWay]),
        },
        {
          title: this.$lang("配置额度"),
          minWidth: 100,
          render: (h, params) =>
            h("span", params.row.rebateCalcWay == 1 ? `${params.row.rebateAmount}${params.row.interestTokenName}`
              : `${new Decimal(params.row.rebateRate).mul(new Decimal(100))}%`),
        },
        {
          title: this.$lang("本金额度"),
          minWidth: 160,
          key: "principalAmount",
          render: (h, params) =>
            h("span", params.row.principalAmount + params.row.tokenName),
        },
        {
          title: this.$lang("计息时间"),
          minWidth: 190,
          key: "rebateDate",
          render: (h, params) =>
            h("span", this.newDate(params.row.rebateDate).format()),
        },
        {
          title: this.$lang("期数"),
          width: 100,
          key: "numberOfPeriods",
          //slot: "show",
        },
        {
          title: this.$lang("派息额度"),
          width: 160,
          fixed: "right",
          align: "center",
          render: (h, params) =>
            h("span", params.row.interestAmount + params.row.interestTokenName),
        },

        {
          title: this.$lang("操作"),
          fixed: "right",
          align: "center",
          slot: "action",
          width: 210,
        },
      ],
    };
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--;
        }, 1000);
      }
    }
  },
  methods: {
    getCode() {
      !this.time &&
      this.$axios
        .post("/api/v1/user/send_a_sms_verify_code", {})
        .then(result => {
          if (result.code == 0) {
            this.time = 60;
          }
        });
    },
    rebate(row) {
      Object.assign(this.formData, row);
      this.formData.verifyCode = '';
      this.win = true;
    },
    calculation(row) {
      Object.assign(this.calFormData, row);
      Object.assign(this.calFormData, {rebateRate: new Decimal(row.rebateRate).mul(new Decimal(100)).toString()});
      this.calFormData.tokenId = row.interestTokenId;
      this.calFormData.verifyCode = '';
      this.calWin = true;
    },
    doCalculation() {
      this.loading = true;
      let authType = this.userInfo.bindGA ? 1 : 2;
      Object.assign(this.calFormData, {authType: authType}, {productRebateId: this.calFormData.id});
      this.$axios
        .post("/api/v1/staking/product/rebate/calc", {
          ...this.calFormData,
        })
        .then((result) => {
          this.loading = false;
          this.win = false;
          if (result.code == 0) {
            this.$emit("searchData");
            this.calWin = false;
          }
        });
    },
    next() {
      this.loading = true;
      let authType = this.userInfo.bindGA ? 1 : 2;
      this.$axios
        .post("/api/v1/staking/product/rebate/transfer", {
          productId: this.formData.productId,
          productRebateId: this.formData.id,
          verifyCode: this.formData.verifyCode,
          authType: authType,
        })
        .then((result) => {
          this.loading = false;
          this.win = false;
          if (result.code == 0) {
            this.$Message.success(this.$lang("后台处理中"));
            this.$emit("searchData");
          }
        });
    },
  },
  mounted() {
    if (this.productType == 1) {
      this.columns = [
        {
          title: this.$lang("名称"),
          minWidth: 160,
          key: "productName",
        },
        ...this.defaultColumns,
      ]
    } else {
      this.columns = [
        {
          title: this.$lang("名称"),
          minWidth: 160,
          key: "productName",
        },
        {
          title: this.$lang("付息方式"),
          minWidth: 100,
          key: "dividendType",
          render: (h, params) =>
            h("span", this.dividendTypes[params.row.dividendType]),
        },
        ...this.defaultColumns,
      ]
    }
  },
};
</script>
