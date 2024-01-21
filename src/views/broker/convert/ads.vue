<style lang="less" scoped>
.wrap {
  border: 1px dashed #dcdee2;
  padding: 15px;
}
.draggable {
  display: inline-block;
  padding: 8px 15px;
  border: 1px solid #dcdee2;
  margin: 10px;
  border-radius: 5px;
}
.noBorder {
  outline: none;
  box-shadow:none;
  border: 0px;
  margin-left: -7px;
}
</style>
<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="20") &nbsp;
    Col(span="4")
      Button(
        :disabled="isRead",
        type="primary",
        long,
        @click="create",
        icon="md-add-circle",
        ghost
      ) {{ $lang('新建') }}
  Alert
    span(v-html="adsDesc")
    Button.noBorder(size="small" type="primary", ghost, :to="`${supportDomain}/hc/zh-cn/articles/360053203014`" target="_blank") {{$lang('闪电兑换产品帮助')}} >>
  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable"
  )
    template(slot-scope="{row, index}", slot="name") {{ row.purchaseTokenName }} => {{ row.offeringsTokenName }}
    template(slot-scope="{row, index}", slot="priceType") {{ type[row.priceType] }}
    template(slot-scope="{row, index}", slot="price")
      template(v-if="row.priceType == 1") {{ row.priceValue }}{{ row.purchaseTokenName }} : 1{{ row.offeringsTokenName }}
      template(v-else) {{ row.symbolId }} * {{ row.priceValue }}%

    template(slot-scope="{row, index}", slot="status")
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.status",
        :true-value="1",
        :false-value="2",
        @on-change="setStatus(row, index)",
        :loading="index === editIndex"
      )
    template(slot-scope="{row, index}", slot="quantity") {{ row.minQuantity }} {{ row.offeringsTokenName }} - {{ row.maxQuantity }} {{ row.offeringsTokenName }}
    template(slot-scope="{row, index}", slot="action")
      Button(
        :disabled="isRead",
        type="primary",
        size="small",
        ghost,
        @click="editToken(row)"
      ) {{ $lang('修改') }}

  Modal(
    v-model="win",
    :title="$lang('广告管理')",
    footer-hide,
    :mask-closable="false",
    width="900"
  )

    Form(:labelWidth="140")
      Row(:gutter="20")
        Col(span="12")
          Divider {{ $lang('基本设置') }}
          FormItem(:label="$lang('类型')")
            RadioGroup(v-model="formData.priceType" @on-change="changeSymbol")
              Radio(
                :label="key * 1",
                v-for="(item, key) in type",
                :key="key",
                :disabled="disabled"
              ) {{ item }}
          template(v-if="formData.priceType == 1")
            FormItem(:label="$lang('发售币种')")
              Select(
                v-model="formData.offeringsTokenId",
                filterable,
                :disabled="!!formData.convertSymbolId"
              )
                Option(
                  :value="item.tokenId",
                  v-for="item in tokens",
                  :key="item.tokenId"
                ) {{ item.tokenName }}
            FormItem(:label="$lang('支付币种')")
              Select(
                v-model="formData.purchaseTokenId",
                filterable,
                :disabled="!!formData.convertSymbolId"
              )
                Option(
                  :value="item.tokenId",
                  v-for="item in tokens",
                  :key="item.tokenId"
                ) {{ item.tokenName }}
            FormItem(:label="$lang('发售价格')")
              Input(type="text", v-model="formData.priceValue")
                template(slot="append") {{ tokenMap[formData.purchaseTokenId] }} = 1 {{ tokenMap[formData.offeringsTokenId] }}
          template(v-else)
            FormItem(:label="$lang('兑换币对')")
              Select(
                :disabled="!!formData.convertSymbolId",
                v-model="formData.symbolId",
                filterable,
                @on-change="changeSymbol"
              )
                Option(
                  :value="item.symbolId",
                  v-for="item in symbols",
                  :key="item.symbolId"
                ) {{ item.symbolName }}
            FormItem(:label="$lang('发售折扣')")
              Input(type="text", v-model="formData.priceValue")
                template(slot="append") %
            FormItem(:label="$lang('发售价格')") {{ $lang('当前币对价格') }}({{ symbolName }}) x {{ formData.priceValue }}%

          FormItem(:label="$lang('闪兑账户')")
            Select(v-model="formData.brokerAccountId")
              Option(
                v-for="item in aids",
                :value="item.accountId",
                :key="item.accountId"
              ) {{ [item.tag, item.accountId].join(' - ') }}
          FormItem(:label="$lang('当日发售额度')")
            Input(type="text", v-model="formData.symbolDailyLimit")
              template(slot="append") {{ tokenMap[formData.offeringsTokenId] }}
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
        Col(span="12")
          Divider {{ $lang('兑换设置') }}
          FormItem(:label="$lang('最小交易数量')")
            Input(type="text", v-model="formData.minQuantity")
              template(slot="append") {{ tokenMap[formData.offeringsTokenId] }}
          FormItem(:label="$lang('最大交易数量')")
            Input(type="text", v-model="formData.maxQuantity")
              template(slot="append") {{ tokenMap[formData.offeringsTokenId] }}
          FormItem(:label="$lang('单用户每日兑换额度')")
            Input(type="text", v-model="formData.accountDailyLimit")
              template(slot="append") {{ tokenMap[formData.offeringsTokenId] }}
          FormItem(:label="$lang('单用户总兑换额度')")
            Input(type="text", v-model="formData.accountTotalLimit")
              template(slot="append") {{ tokenMap[formData.offeringsTokenId] }}
          FormItem(:label="$lang('支付币种精度')")
            Select(v-model="formData.purchasePrecision")
              Option(:value="item", v-for="item in 10", :key="item") {{ item }}
          FormItem(:label="$lang('发售币种精度')")
            Select(v-model="formData.offeringsPrecision")
              Option(:value="item", v-for="item in 10", :key="item") {{ item }}
      Divider {{ $lang('兑换条件') }}
      FormItem(:label="$lang('实名认证')")
        iSwitch(size="small", v-model="formData.verifyKyc")
      FormItem(:label="$lang('绑定手机号')")
        iSwitch(size="small", v-model="formData.verifyMobile")

      Button(
        long,
        type="success",
        @click="submit",
        :loading="loading",
        :disabled="loading"
      ) {{ $lang('确定') }}
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      time: 0,
      symbolName: "",
      aids: [],
      tokenMap: {},
      type: {
        1: this.$lang("固定价格"),
        2: this.$lang("浮动价格"),
      },
      symbols: [],
      win: false,
      formData: {
        convertSymbolId: "",
        brokerAccountId: "", //	闪兑券商账户id
        purchaseTokenId: "", //	申购币种id
        offeringsTokenId: "", //	发售币种id
        priceType: 1, //		价格类型	1固定价格，2浮动价格
        priceValue: "", //		价格值	当价格类型为浮动时，该值为小于1的比例值
        symbolId: "", //		币对id	当价格类型为浮动时，必须存在对应的币对id
        minQuantity: "", //		单笔订单最小数量	默认值为0
        maxQuantity: "", //		单笔订单最大数量	默认值为0，值为0时不控制最大数量
        accountDailyLimit: "", //		用户当日兑换发售币数量的额度	默认值为0，值为0时不控制额度
        accountTotalLimit: "", //		用户总兑换发售币数量的额度	默认值为0，值为0时不控制额度
        symbolDailyLimit: "", //		闪兑币对当日兑换发售币数量的额度	默认值为0，值为0时不控制额度
        verifyKyc: false, //		是否验证用户kyc	默认false
        verifyMobile: false, //		是否验证用户绑定手机	默认false
        verifyVipLevel: 0, //		验证用户vip等级	默认0，当前未判断vip等级
        status: 2, //		币对状态	1启用，2禁用,
        purchasePrecision: "", //申购数量精度
        offeringsPrecision: "", //发售数量精度
        verifyCode: "",
        authType: "",
      },
      loading: false,
      editIndex: null,
      loadingTable: true,

      columns: [
        {
          title: this.$lang("名称"),
          key: "purchaseTokenName",
          minWidth: 100,
          slot: "name",
        },
        {
          title: this.$lang("申购币种"),
          key: "purchaseTokenName",
          minWidth: 100,
          //slot: "fee"
        },
        {
          title: this.$lang("发售币种"),
          key: "offeringsTokenName",
          minWidth: 100,
        },
        {
          title: this.$lang("价格类型"),
          key: "priceType",
          minWidth: 140,
          slot: "priceType",
        },
        {
          title: this.$lang("价格"),
          key: "priceValue",
          minWidth: 140,
          slot: "price",
        },
        {
          title: this.$lang("数量限制"),
          key: "downRange",
          minWidth: 140,
          slot: "quantity",
        },

        {
          title: this.$lang("上线"),
          minWidth: 100,
          slot: "status",
        },
        {
          title: this.$lang("操作"),
          minWidth: 100,
          slot: "action",
          align: "right",
        },
      ],
      listData: [],
    };
  },
  computed: {
    ...mapState(["isRead", "tokens", "userInfo",'apiDomain']),
    adsDesc() {
      return this.$lang("ads.desc")
        .replace(
          "{web}",
          `<a target="_blank" href="https://www${this.apiDomain}/convert/"> https://www${this.apiDomain}/convert/</a>`
        )
    },
    disabled() {
      if (
        this.formData.convertSymbolId &&
        this.formData.priceType === 1 &&
        !this.symbols.filter((el) => el.symbolId === this.formData.symbolId)
          .length
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  created() {
    this.loadData();

    this.$axios
      .post("/api/v1/convert/product/fund_account/list")
      .then((result) => {
        if (result.code == 0) {
          this.aids = result.data;
        }
      });

    this.$axios
      .post("/api/v1/symbol/query", {
        current: 1,
        pageSize: 1000,
        category: 1,
      })
      .then((result) => {
        if (result.code === 0) {
          this.tokens.forEach((el) => {
            this.tokenMap[el.tokenId] = el.tokenName;
          });
          this.symbols = result.data.list ? result.data.list : [];
        }
      });
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
    changeSymbol() {
      if (this.formData.symbolId) {
        this.symbols.forEach((el) => {
          if (this.formData.symbolId == el.symbolId) {
            this.formData.offeringsTokenId = el.baseTokenId;
            this.formData.purchaseTokenId = el.quoteTokenId;
            this.symbolName = el.symbolName;
          }
        });
      } else {
        this.formData.offeringsTokenId = "";
        this.formData.purchaseTokenId = "";
        this.symbolName = "";
      }
    },

    editToken(row) {
      this.win = true;
      Object.assign(this.formData, row, {verifyCode: "",});
      if (row.priceType == 2) {
        this.changeSymbol();
      }
    },
    create() {
      this.win = true;
      Object.assign(this.formData, {
        convertSymbolId: "",
        brokerAccountId: "", //	闪兑券商账户id
        purchaseTokenId: "", //	申购币种id
        offeringsTokenId: "", //	发售币种id
        priceType: 1, //		价格类型	1固定价格，2浮动价格
        priceValue: "", //		价格值	当价格类型为浮动时，该值为小于1的比例值
        symbolId: "", //		币对id	当价格类型为浮动时，必须存在对应的币对id
        minQuantity: "", //		单笔订单最小数量	默认值为0
        maxQuantity: "", //		单笔订单最大数量	默认值为0，值为0时不控制最大数量
        accountDailyLimit: "", //		用户当日兑换发售币数量的额度	默认值为0，值为0时不控制额度
        accountTotalLimit: "", //		用户总兑换发售币数量的额度	默认值为0，值为0时不控制额度
        symbolDailyLimit: "", //		闪兑币对当日兑换发售币数量的额度	默认值为0，值为0时不控制额度
        verifyKyc: false, //		是否验证用户kyc	默认false
        verifyMobile: false, //		是否验证用户绑定手机	默认false
        verifyVipLevel: 0, //		验证用户vip等级	默认0，当前未判断vip等级
        status: 2, //		币对状态	1启用，2禁用
        purchasePrecision: "", //申购数量精度
        offeringsPrecision: "", //发售数量精度
        verifyCode: "",
      });
    },
    submit() {
      this.loading = true;
      let authType = this.userInfo.bindGA ? 1 : 2;
      Object.assign(this.formData, {authType: authType});
      this.$axios
        .post(
          this.formData.convertSymbolId
            ? "/api/v1/convert/symbol/modify"
            : "/api/v1/convert/symbol/add",
          this.formData
        )
        .then((result) => {
          this.loading = false;
          if (result.code === 0) {
            this.win = false;
            this.$Notice.success({
              title: this.$lang("成功"),
            });
            this.loadData();
          }
        });
    },
    loadData() {
      this.loadingTable = true;
      this.$axios.get("/api/v1/convert/symbol/query").then((result) => {
        this.loadingTable = false;
        if (result.code === 0) {
          this.listData = result.data;
        }
      });
    },
    setStatus(row, index) {
      this.editIndex = index;
      this.$axios
        .post("/api/v1/convert/symbol/status/update", row)
        .then((result) => {
          this.editIndex = null;
          if (result.code != 0) {
            this.listData = [...this.listData];
          } else {
            this.$Notice.success({
              title: this.$lang("成功"),
            });
          }
        });
    },
  },
};
</script>
