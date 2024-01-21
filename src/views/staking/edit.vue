
<template lang="pug">
Main.page-exchange
  Divider(orientation="left") {{ $lang('基本信息') }}
  Form(:label-width="140")
    Row(:gutter="20")
      Col(span="16")
        FormItem(:label="$lang('产品类型')")
          RadioGroup(v-model="formData.type")
            Radio(
              label="0",
              :disabled="formData.status > 0",
              v-if="types.allowFixed && productType == 0"
            ) {{ $lang('定期') }}
            Radio(
              label="2",
              :disabled="formData.status > 0",
              v-if="types.allowFixedLock && productType == 2"
            ) {{ $lang('定期锁仓') }}
            Radio(
              label="1",
              :disabled="formData.status > 0",
              v-if="types.allowCurrent && productType == 1"
            ) {{ $lang('活期') }}
        FormItem(:label="$lang('选择币种')")
          Row
            Col(span="11")
              Select(
                v-model="formData.tokenId",
                filterable,
                :disabled="formData.status > 0"
              )
                Option(
                  v-for="item in tokens",
                  :value="item.tokenId",
                  :key="item.tokenId"
                ) {{ item.tokenName }}
            Col(span="2") &nbsp;
            Col(span="11")
              Input(
                v-model="formData.perLotAmount",
                :disabled="formData.status > 0"
              )
                span(slot="prepend") {{ $lang('单份数量') }}
                template(slot="append") {{ tokenInfo(formData.tokenId).tokenName }}

        FormItem(key="a9", :label="$lang('发售额度')")
          Row
            Col(span="11")
              Input(
                v-model="formData.upLimitLots",
                :disabled="formData.status > 1",
                @on-keyup="formatNumber('upLimitLots')"
              )
                span(slot="prepend") {{ $lang('实际发售份额') }}
                template(slot="append") {{ $lang('份') }}
            Col(span="2") &nbsp;
            Col(span="11" v-if="productType !=1")
              Input(v-model="formData.showUpLimitLots")
                span(slot="prepend") {{ $lang('页面展示份额') }}
                span(slot="append") {{ $lang('份') }}

        FormItem(key="a8", :label="$lang('购买配置')")
          Row
            Col(span="11")
              Input(
                v-model="formData.perUsrLowLots",
                :disabled="formData.status > 0",
                type='number',
                @on-keyup="formatNumber('perUsrLowLots')"
              )
                span(slot="prepend") {{ $lang('最小购买份额') }}
                span(slot="append") {{ $lang('份') }} = {{ perUsrLowLotsAmount }}{{ tokenInfo(formData.tokenId).tokenName }}
            Col(span="2") &nbsp;
            Col(span="11")
              Input(
                v-model="formData.perUsrUpLots",
                :disabled="formData.status > 0",
                type='number',
                @on-keyup="formatNumber('perUsrUpLots')"
              )
                span(slot="prepend") {{ $lang('最大购买份额') }}
                span(slot="append") {{ $lang('份') }} = {{ perUsrUpLotsAmount }}{{ tokenInfo(formData.tokenId).tokenName }}

        FormItem(key="a2", :label="$lang('认购时间')")
          DatePicker(
            format="yyyy/MM/dd HH:mm:ss",
            @on-change="changeSubscribeTime",
            type="datetimerange",
            style="width:100%",
            :value="subscribeTime",
            :placeholder="$lang('开始认购-结束认购时间')",
            :options="options",
            :disabled="formData.status > 1"
          )

        FormItem(:label="$lang('募集总额')")
          Alert(style="font-size:30px;padding:20px") {{ (formData.upLimitLots * formData.perLotAmount).cutFixed(2) }} {{ tokenInfo(formData.tokenId).tokenName }}

        Divider(dashed)
        FormItem(:label="$lang('付息方式')", :disabled="formData.status > 0" v-if="productType !=1")
          RadioGroup(
            v-model="formData.dividendType",
            @on-change="changeDividendType"
          )
            Radio(:label="0", :disabled="!!formData.id") {{ $lang('分期付息') }}
            Radio(:label="1", :disabled="!!formData.id") {{ $lang('一次性还本付息') }}
        FormItem(key="a3", :label="$lang('开始计息时间')" v-if="productType !=1")
          DatePicker(
            format="yyyy/MM/dd",
            @on-change="changeInterestStartDate",
            style="width:100%",
            :value="interestStartDate",
            :placeholder="$lang('开始计息时间')",
            :options="options",
            :disabled="formData.status > 0"
          )

        FormItem(:label="$lang('项目期限')" v-if="productType !=1")
          Row
            Col(span="11")
              Input(
                v-model="formData.timeLimit",
                @on-change="computeDividendTimes",
                :disabled="formData.status > 0"
              )
                template(slot="append") {{ $lang('天') }}
            Col(span="2") &nbsp;
            Col(span="11")
              Input(v-model="formData.referenceApr")
                span(slot="prepend") {{ $lang('页面展示年化利率') }}
                span(slot="append") %
        FormItem(:label="$lang('类型')" v-if="productType !=1")
          RadioGroup(v-model="formData.rebateCalcWay" @on-change="changeRebateCalcWay")
            Radio(:label="0" :disabled="!!formData.id")
              span {{ $lang('配置年化利率') }}
            Radio(:label="1" :disabled="!!formData.id")
              span {{ $lang('配置金额') }}
        FormItem(:label="$lang('默认年化利率')" v-if="productType ==1")
          Row
            Col(span="11")
              Input(v-model="formData.actualApr")
                span(slot="append") %
            Col(span="1") &nbsp;
            Col(span="11" v-if="formData.id")
              a(:href="`/staking/rateDetail/${formData.id}/${formData.actualApr}`") {{ $lang('详情') }} >>
        FormItem(:label="$lang('项目期数')", v-if="formData.dividendType == 0 && productType !=1")
          Select(
            v-model="formData.dividendTimes",
            @on-change="computeDividendTimes",
            :disabled="formData.status > 0"
          )
            Option(v-for="item in 60", :value="item", :key="item") {{ item }} {{ $lang('期') }}
        FormItem.ivu-table-body(
          :label="$lang('项目期数')",
          v-if="formData.timeLimit && formData.interestStartDate && productType !=1"
        )
          table.ivu-table(
            cellspacing="0",
            cellpadding="0",
            border="0",
            style="width:100%"
          )
            tr.ivu-table-row
              th NO.
              th {{ $lang('发息时间') }}
              th {{ formData.rebateCalcWay == 0 ? $lang('年化利率') : $lang('金额') }}
            tr.ivu-table-row(v-for="(rebate, __index) in rebates")
              td
                .ivu-table-cell {{ __index + 1 }}
              td
                .ivu-table-cell
                  DatePicker(
                    style="width:100%",
                    format="yyyy/MM/dd",
                    v-model="rebate.rebateDate",
                    :placeholder="$lang('发息时间')",
                    :disabled="__index == rebates.length - 1 || !rebate.canModify"
                  )
              td
                .ivu-table-cell
                  Input(
                    v-model="rebate.rebateRate",
                    :disabled="!rebate.canModify"
                    v-if="formData.rebateCalcWay == 0"
                  )
                    span(slot="prepend") {{ $lang('年化利率') }}
                    span(slot="append") %
                  Input(
                    v-model="rebate.rebateAmount",
                    :disabled="!rebate.canModify"
                    v-else
                  )
                    span(slot="prepend") {{ $lang('金额') }}
                    Select(slot="append" filterable style="width: 80px"  v-model="rebate.tokenId")
                      Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{item.tokenName}}
        Divider(dashed)
        FormItem(:label="$lang('本金所在AID')", v-if="formData.type == 0 || formData.type == 1")
          Select(
            v-model="formData.principalAccountId",
            :disabled="formData.status > 0 || aidLoading"
          )
            Option(
              v-for="item in aids",
              :value="item.accountId",
              :key="item.accountId"
            ) {{ [item.tag, item.accountId].join(' - ') }}
        FormItem(:label="$lang('利息发放AID')")
          Select(
            v-model="formData.dividendAccountId",
            :disabled="formData.status > 0 || aidLoading"
          )
            Option(
              v-for="item in aids",
              :value="item.accountId",
              :key="item.accountId"
            ) {{ [item.tag, item.accountId].join(' - ') }}
          Button(size="small", @click="addAid") + AID
          | &nbsp;&nbsp;
          Button(
            size="small",
            @click="refreshAid",
            :loading="aidLoading",
            :disabled="aidLoading"
          ) {{ $lang('刷新') }}
        Divider(dashed)
        Card(dis-hover style="margin-bottom: 24px")
          p(slot="title") {{ $lang('认购条件') }}
          FormItem(:label="$lang('实名认证')")
            iSwitch(size="small", v-model="formData.limit.verifyKyc")
          FormItem(:label="$lang('绑定手机号')")
            iSwitch(size="small", v-model="formData.limit.verifyBindPhone")
          FormItem(:label="$lang('代币持仓')")
            iSwitch(size="small", v-model="formData.limit.verifyBalance")
          FormItem(
            :label="$lang('持仓数量')",
            v-if="formData.limit.verifyBalance"
          )
            Input(v-model="formData.limit.quantity")
              Select(v-model="formData.limit.positionToken", slot="append", style="width:80px")
                Option(
                  v-for="item in tokens",
                  :value="item.tokenId",
                  :key="item.tokenId"
                ) {{ item.tokenName }}
          FormItem(:label="$lang('平均持仓量')")
            iSwitch(
              size="small",
              v-model="formData.limit.verifyAvgBalance"
            )
          template(v-if="formData.limit.verifyAvgBalance")
            FormItem(:label="$lang('平均数量')")
              Input(v-model="formData.limit.verifyAvgBalanceVolume")
                Select(
                  v-model="formData.limit.verifyAvgBalanceToken",
                  slot="append",
                  style="width:80px"
                )
                  Option(
                    v-for="item in tokens",
                    :value="item.tokenId",
                    :key="item.tokenId"
                  ) {{ item.tokenName }}
            FormItem(:label="$lang('持仓时间')")
              DatePicker(
                format="yyyy/MM/dd HH:mm:ss",
                @on-change="changeVerifyAvgBalanceTime",
                type="daterange",
                style="width:100%",
                :value="verifyAvgBalanceTime",
                :placeholder="$lang('开始时间-结束时间')"
              )
              Alert(type="error", style="margin-top:10px")
                p {{ $lang('快照时间按照UTC +0时间生成，对应您本地时间为') }}:{{ formData.limit.verifyAvgBalanceStartTime > 0 ? new Date(formData.limit.verifyAvgBalanceStartTime * 1).format('yyyy-MM-dd hh:mm:ss') : '----' }} - {{ formData.limit.verifyAvgBalanceEndTime > 0 ? new Date(formData.limit.verifyAvgBalanceEndTime * 1).format('yyyy-MM-dd hh:mm:ss') : '----' }}

          FormItem( :label="$lang('用户等级')")
            Select(v-model="levelLimit", multiple)
              Option(v-for="item in levels" :value="item.levelConfigId" :key="item.levelConfigId") {{ formatLevelTitle(item.localeDetail) }}
  Alert
    Checkbox(
      v-for="(item, index) in localInfos",
      v-model="item.enabled",
      :key="index"
    ) {{ lang[item.language] }}
  Form
    Card(dis-hover, :title="$lang('项目介绍')", style="marginTop:15px")
      Row(:gutter="30")
        Col(
          span="12",
          v-for="(item, index) in localInfos",
          v-if="item.enabled",
          :key="item.language"
        )
          Divider {{ lang[item.language] }}
          FormItem
            Input(v-model="item.productName")
              span(slot="prepend") {{ $lang('产品名称') }}
          FormItem
            Input(v-model="item.protocolUrl")
              span(slot="prepend") {{ $lang('产品协议') }}
          FormItem(:label="$lang('项目介绍')")
            Input(v-model="item.productDetails", type="textarea", :rows="8")
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading", loading, long) {{ $lang('加载中') }}
        Button(
          @click="submit",
          type="primary",
          long,
          v-else,
          :loading="loading",
          :disabled="loading"
        ) {{ $lang('保存') }}
</template>
<script>
import { mapState } from "vuex";
import { initData, formatNumber } from "@/libs/common.js";
import { Decimal } from "decimal.js";
export default {
  computed: {
    ...mapState(["lang", "tokens", "isRead"]),
    perUsrLowLotsAmount() {
      if (this.formData.perUsrLowLots && this.formData.perLotAmount) {
        return new Decimal(this.formData.perUsrLowLots).mul(new Decimal(this.formData.perLotAmount))
      }
      return ''
    },
    perUsrUpLotsAmount() {
      if (this.formData.perUsrUpLots && this.formData.perLotAmount) {
        return new Decimal(this.formData.perUsrUpLots).mul(new Decimal(this.formData.perLotAmount))
      }
      return ''
    }
  },
  data() {
    return {
      isCopy : this.$route.query.copy === "1",
      productType: this.$route.params.productType,
      types: {
        allowFixed: 0,
        allowFixedLock: 0,
      },
      rebates: [],
      aids: [],
      levelLimit: [],
      levels: [],
      options: {
        disabledDate: (date) => {
          return date && date.valueOf() < Date.now() - 86400000;
        },
      },
      options2: {
        disabledDate: (date) => {
          if (this.formData.timeConfig.purchaseEndTime) {
            return (
              date && date.valueOf() < this.formData.timeConfig.purchaseEndTime
            );
          } else {
            return date && date.valueOf() < Date.now() - 86400000;
          }
        },
      },
      editorOption: {},
      pageLoading: false,
      loading: false,
      aidLoading: false,
      subscribeTime: [],
      verifyAvgBalanceTime: [],
      interestStartDate: "",
      releaseResultTime: "",
      localInfos: [],
      formData: {
        actualApr: 0,
        status: 0,
        id: "", //修改的时候传入，新增可不传
        tokenId: "",
        dividendType: 0, //派息方式:0=分期付息 1=一次性还本付息
        dividendTimes: 1, //派息次数
        timeLimit: "", //产品期限
        referenceApr: "", //参考利率
        perUsrLowLots: "", //用户最低认购份数
        perUsrUpLots: "", //用户最大认购份数
        upLimitLots: "", //总认购（发行）份数
        showUpLimitLots: "", //页面展示总认购（发行）份数
        perLotAmount: "", //每份金额
        subscribeStartDate: "", //认购开始时间
        subscribeEndDate: "", //认购结束时间
        interestStartDate: "", //计息开始时间
        sort: 1,
        type: this.$route.params.productType, //产品类型:0=定期 2=定期锁仓 1=活期
        principalAccountId: "", //本金账户
        dividendAccountId: "", //派息账户
        arrposid: 0,
        localInfos: [],
        rebates: [],
        rebateCalcWay: 0,
        limit: {
          id: 0, //修改的时候传入，新增可不传
          verifyKyc: false,
          verifyBindPhone: false,
          verifyBalance: false,
          verifyAvgBalance: false,
          balanceRuleJson: "",
          levelLimit: "",
          positionToken: "",
          quantity: "", //数量
          verifyAvgBalanceStartTime: "",
          verifyAvgBalanceEndTime: "",
          verifyAvgBalanceVolume: "",
          verifyAvgBalanceToken: "",
        },
      },
    };
  },
  methods: {
    addAid() {
      this.formData.localInfos = this.localInfos.filter((el) => el.enabled);

      this.formData.rebates = this.rebates.map((el) => {
        return Object.assign({}, el, {
          rebateDate: el.rebateDate ? el.rebateDate.getTime() : "",
        });
      });

      localStorage.stakingProductDetail = JSON.stringify(this.formData);
      location.href =
        "/accounts/list?redirectUrl=" + encodeURIComponent(location.href);
    },
    formatNumber(key) {
      this.formData[key] = formatNumber(this.formData[key]);
    },
    refreshAid() {
      this.aidLoading = true;
      this.$axios
        .post("/api/v1/staking/product/fund_account/list")
        .then((result) => {
          this.aidLoading = false;
          if (result.code == 0) {
            this.aids = result.data;
          }
        });
    },
    changeDividendType(type) {
      if (type == 1) {
        this.formData.dividendTimes = 1;
        this.computeDividendTimes();
      }
    },
    computeDividendTimes() {
      let i = 0,
        step = 0,
        rebateDate = 0,
        lastDate = 0;
      this.rebates = [];

      if (this.formData.interestStartDate && this.formData.timeLimit) {
        step =
          Math.floor(this.formData.timeLimit / this.formData.dividendTimes) *
          86400000;
        rebateDate = Number(this.formData.interestStartDate);

        lastDate = this.formData.timeLimit * 86400000 + rebateDate;
      }

      while (i < this.formData.dividendTimes) {
        i++;
        let _rebateDate = rebateDate + step * i;

        if (i == this.formData.dividendTimes) {
          this.rebates.push({
            id: "",
            rebateDate: lastDate ? new Date(lastDate) : "",
            rebateRate: this.formData.referenceApr || "",
            canModify: 1,
          });
        } else {
          this.rebates.push({
            id: "",
            rebateDate: _rebateDate ? new Date(_rebateDate) : "",
            rebateRate: this.formData.referenceApr || "",
            canModify: 1,
          });
        }
      }
    },
    formatLevelTitle(list) {
      let title = "";
      if (list.length) {
        title = list[0].levelName;
        list.forEach((el) => {
          if (el.language == this.$i18n.locale) {
            title = el.levelName;
          }
        });
      }
      return title;
    },

    //日期选择
    changeSubscribeTime(val) {
      this.formData.subscribeStartDate = new Date(val[0]).getTime();
      this.formData.subscribeEndDate = new Date(val[1]).getTime();
    },

    //持仓时间
    changeVerifyAvgBalanceTime(val) {
      this.formData.limit.verifyAvgBalanceStartTime = new Date(
        val[0]
      ).getTime();
      this.formData.limit.verifyAvgBalanceEndTime = new Date(
        val[1]
      ).getTime();
    },

    changeInterestStartDate(val) {
      this.formData.interestStartDate = new Date(val).getTime();
      this.computeDividendTimes();
    },

    tokenInfo(tokenId) {
      return this.tokens.filter((el) => el.tokenId == tokenId)[0] || {};
    },

    init() {
      this.localInfos = initData(
        this.lang,
        JSON.stringify({
          id: 0, //修改的时候传入，新增可不传
          productName: "",
          protocolUrl: "",
          productDetails: "",
        })
      );
    },

    initForm(formData) {
      Object.assign(this.formData, formData);
      this.formData.type = `${formData.type}`
      if (this.formData.interestStartDate) {
        this.interestStartDate = new Date(
          Number(this.formData.interestStartDate)
        );
      }

      if (this.formData.subscribeStartDate) {
        this.subscribeTime = [
          new Date(Number(this.formData.subscribeStartDate)),
          new Date(Number(this.formData.subscribeEndDate)),
        ];
      }

      this.formData.localInfos.forEach((el) => {
        this.localInfos.forEach((_el) => {
          if (el.language == _el.language) {
            Object.assign(_el, el);
          }
        });
      });

      this.rebates = this.formData.rebates.map((el) => {
        return Object.assign(el, {
          rebateDate: new Date(Number(el.rebateDate)),
        });
      });
    },
    loadData(id) {
      this.init();
      this.computeDividendTimes();
      if (id) {
        this.pageLoading = true;
        this.$axios
          .post("/api/v1/staking/product/get", { id })
          .then((result) => {
            this.pageLoading = false;
            if (result.code == 0) {
              Object.assign(this.formData, result.data);
              if (result.data.limit.verifyAvgBalanceStartTime > 0) {
                this.verifyAvgBalanceTime = [
                  this.newDate(result.data.limit.verifyAvgBalanceStartTime),
                  this.newDate(result.data.limit.verifyAvgBalanceEndTime),
                ];
              }
              this.levelLimit = this.formData.limit.levelLimit.split(',');
              this.initForm(result.data);
              if(this.isCopy){
                this.formData.status = 0;
                this.formData.id = ""; //修改的时候传入，新增可不传
              }
            }
          });
      } else {
        if (localStorage.stakingProductDetail) {
          this.initForm(JSON.parse(localStorage.stakingProductDetail));
          localStorage.removeItem('stakingProductDetail')
        }
      }
    },
    changeRebateCalcWay() {
    },
    submit() {
      this.loading = true;
      this.formData.localInfos = this.localInfos.filter((el) => el.enabled);
      if (this.productType == 1) {
        delete this.formData.rebates
        this.formData.timeLimit = 0
        this.formData.dividendType = 0
        this.formData.showUpLimitLots = 0
        this.formData.interestStartDate = 0
      } else {
        this.formData.rebates = this.rebates.map((el) => {
          return Object.assign({}, el, {
            rebateDate: el.rebateDate ? el.rebateDate.getTime() : "",
          }, {
            rebateRate: this.formData.rebateCalcWay == '0' ? el.rebateRate : 0
          });
        });
      }
      this.formData.limit.levelLimit = this.levelLimit.join(',');
      this.$axios
        .post("/api/v1/staking/product/save", this.formData)
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            if (!this.formData.id) {
              location.href = "/staking/";
            } else {
              this.$Notice.success({
                title: this.$lang("成功"),
              });
            }
          }
        });
    },
  },
  created() {
    this.refreshAid();
    this.$axios
      .post("/api/v1/activity/ieo/user_level/user_level_info", {})
      .then((result) => {
        if (result.code == 0) {
          this.levels = result.data;
        }
      });
    this.$axios
      .post("/api/v1/staking/product/get_permission")
      .then((result) => {
        if (result.code == 0) {
          Object.assign(this.types, result.data);
        }

        this.loadData(
          this.$route.params.id === "create" ? "" : this.$route.params.id
        );
      });
  },
};
</script>
