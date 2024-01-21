<style lang="less" scoped>
.icon {
  img {
    cursor: pointer;
    max-height: 50px;
    &.current {
      border: 2px solid #19be6b;
    }
  }
}
</style>
<template lang="pug">
Main
  Form
    Card(dis-hover style="margin-top:15px")
      p(slot="title") {{$lang('等级图标')}}
      FormItem
        Input(v-model="formItem.levelIcon", :disabled="uploading" :placeholder='$lang("建议图片尺寸") + "：104 × 104px , < 20KB"')
          span(slot="prepend") {{$lang("等级图标")}}
          Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:'levelIcon'}", :show-upload-list="false" ,:max-size="300" accept="image/png" ,:on-format-error="formatError" ,:on-exceeded-size="exceededSize")
            Icon(type="md-cloud-upload" v-show="!uploading")
            Icon.spin-icon-load(type="ios-loading" v-show="uploading")

      Row(:gutter="30")
        Col(span="4")
         img(:src="formItem.levelIcon")
        Col.icon(span="20")
          Row(v-for="(item,index) in ['b','c','y','g']" :key="index")
            Col(span="2") &nbsp;
            Col(v-for="(_item,index) in 11" span="2" :key="index")
              img(:src="`https://${staticUrl}/static/levels/${item}-${_item-1}.png`" :class="{current:`https://${staticUrl}/static/levels/${item}-${_item-1}.png`===formItem.levelIcon}" @click="formItem.levelIcon=`https://${staticUrl}/static/levels/${item}-${_item-1}.png`")
    Card(dis-hover style="margin-top:15px" :title="$lang('等级名称')")
      Alert
        Checkbox(v-for="item in localeDetail", v-model="item.enabled", :key="item.language") {{lang[item.language]}}
      Row(:gutter="20")
        Col(v-for="(item,index) in localeDetail" v-if="item.enabled" ,:key="index" span="6")
          Divider(size="small") {{lang[item.language]}}
          FormItem(style="margin-bottom:6px")
            Input(v-model="item.levelName", :placeholder="$lang('等级名称')" )
              template(slot="prepend") {{$lang('等级名称')}}

    Card(dis-hover :title="$lang('等级条件')" style="margin-top:15px" v-if="conditions.length")
      Row(:gutter="20")
        Col(:span="functions['exchange'] && functions['futures'] ? 12 : 24" v-if="functions['exchange']")
          Divider(orientation="left" size="small" v-if="functions['exchange'] && functions['futures']") {{$lang('晋级方式')}}①
          Row(:gutter="20")
            Col(span="20")
              FormItem
                Input(v-model="conditions[0][0].minValue" :disabled="formItem.isBaseLevel")
                  template(slot="prepend") {{$lang('晋级条件')}}: {{$lang('持币量')}} ≥
                  Select(slot="append" filterable style="width: 80px" v-model="conditions[0][0].tokenId")
                    Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{item.tokenName}}
            Col(span="4")
              Icon(size="24" :color="conditions[0][0].tokenId&&conditions[0][0].minValue?'#19be6b':''" :type="conditions[0][0].tokenId&&conditions[0][0].minValue?'ios-checkmark-circle':'ios-checkmark-circle-outline'")
            Col(span="20")
              FormItem
                Input(v-model="conditions[0][1].minValue" :disabled="formItem.isBaseLevel")
                  template(slot="prepend") {{$lang('晋级条件')}}: {{$lang('30日币币交易额')}} ≥
                  template(slot="append") BTC
            Col(span="4")
              Icon(size="24" :color="conditions[0][1].minValue?'#19be6b':''" :type="conditions[0][1].minValue?'ios-checkmark-circle':'ios-checkmark-circle-outline'")
        Col(:span="functions['exchange'] && functions['futures'] ? 12 : 24" v-if="functions['futures']")
          Divider(orientation="left" size="small" v-if="functions['exchange'] && functions['futures']") {{$lang('晋级方式')}}②
          Row(:gutter="20")
            Col(span="20")
              FormItem
                Input(v-model="conditions[1][0].minValue" :disabled="formItem.isBaseLevel")
                  template(slot="prepend") {{$lang('晋级条件')}}: {{$lang('持币量')}} ≥
                  Select(slot="append" filterable style="width: 80px"  v-model="conditions[1][0].tokenId")
                    Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{item.tokenName}}
            Col(span="4")
              Icon(size="24" :color="conditions[1][0].tokenId&&conditions[1][0].minValue?'#19be6b':''" :type="conditions[1][0].tokenId&&conditions[1][0].minValue?'ios-checkmark-circle':'ios-checkmark-circle-outline'")
            Col(span="20")
              FormItem
                Input(v-model="conditions[1][1].minValue" :disabled="formItem.isBaseLevel")
                  template(slot="prepend") {{$lang('晋级条件')}}: {{$lang('30日合约交易额')}} ≥
                  template(slot="append") BTC
            Col(span="4")
              Icon(size="24" :color="conditions[1][1].minValue?'#19be6b':''" :type="conditions[1][1].minValue?'ios-checkmark-circle':'ios-checkmark-circle-outline'")
        Col(span="24" v-if="functions['exchange'] && functions['futures']")
          Alert
            Tag(color="error") {{$lang('晋级方式')}}
            | : {{$lang('等级晋级方式说明')}}<br>
            Tag(color="error")  {{$lang('晋级条件')}}
            | : {{$lang('等级晋级条件说明')}}
    Card(dis-hover style="margin-top:15px")
      p(slot="title") {{$lang('等级特权')}}
      Row(:gutter="40")
        Col(:span="functions['exchange'] && functions['futures'] ? 12 : 24" v-if="functions[item.fun]" v-for="(item,index) in discount" :key="index")
          Divider(size="small" orientation="left") {{$lang(item.name)}}
          FormItem
            Input(v-model="formItem[`${item.key}BuyMakerDiscount`]", :placeholder="$lang('Maker费率折扣')" :disabled="formItem.isBaseLevel")
              template(slot="append") %
              template(slot="prepend") {{$lang('Maker费率折扣')}}
          FormItem
            Input(v-model='formItem[`${item.key}BuyTakerDiscount`]', :placeholder="$lang('Taker买费率折扣')" :disabled="formItem.isBaseLevel")
              template(slot="append") %
              template(slot="prepend") {{$lang('Taker费率折扣')}}
      Divider(size="small" orientation="left") {{$lang('其它')}}
      Row(:gutter="40")
        Col(span="24" v-if="functions['invite']" ) {{ $lang('邀请返佣活动支持') }}，{{ $lang('您可选择控制该等级用户是否还可收到邀请用户交易返佣') }} &nbsp;
          iSwitch(v-model="formItem.inviteBonusStatus" :disabled="formItem.isBaseLevel")
            span(slot="open") {{$lang('开')}}
            span(slot="close") {{$lang('关')}}
      Card(dis-hover style="margin-top:15px" :title="$lang('杠杆利率配置')" v-if="functions['margin']")
        Row(:gutter="15")
          Col(:span="4" v-for="(item, index) in marginData" :key="index" style="margin-top: 6px")
            Input(v-model="item.showInterest" :disabled="formItem.isBaseLevel")
              template(slot="prepend") {{ item.tokenId }}
              template(slot="append") %
      Card(dis-hover style="margin-top:15px" :title="$lang('其它特殊条件（可选）')")
        Row
          FormItem
            Col(span="6")
              Input(v-model="otherItem.number" :disabled="formItem.isBaseLevel")
                template(slot="prepend") {{$lang('持币量')}} ≥
                Select(slot="append" filterable style="width: 80px" v-model="otherItem.tokenId")
                  Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{item.tokenName}}
            Col(span="16")
              Input(v-model="otherItem.discount" :disabled="formItem.isBaseLevel")
                CheckboxGroup(slot="prepend" v-model="otherItem.checkType")
                  Checkbox(label="spotSwitch" :disabled="formItem.isBaseLevel") {{ $lang('币币费率') }} {{ !functions['futures'] && !functions['margin'] ? $lang('在对应等级费率基础上再打折扣') : ''}}
                  Checkbox(label="contractSwitch" :disabled="formItem.isBaseLevel" v-if="functions['futures']") {{ $lang('合约费率') }} {{ functions['margin'] ? '' : $lang('在对应等级费率基础上再打折扣')}}
                  Checkbox(label="marginSwitch" :disabled="formItem.isBaseLevel" v-if="functions['margin']") {{ $lang('杠杆借贷利率') }} {{ $lang('在对应等级费率基础上再打折扣') }}
                span(slot="append") %
            Col(span="2")
              iSwitch(v-model="otherItem.status" :disabled="formItem.isBaseLevel" style="margin-left:12px" :true-value="1", :false-value="0")
                span(slot="open") {{$lang('开')}}
                span(slot="close") {{$lang('关')}}
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="19") &nbsp;
      Col(span="5")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" type="primary" long v-else) {{$lang('确定')}}
</template>
<script>
import { mapState } from 'vuex'
import { initData } from '@/libs/common.js'
import CONSTS from '@/libs/consts'

const { staticUrl } = CONSTS
export default {
  data() {
    return {
      staticUrl: staticUrl,
      otherItem: {
        number: '',
        discount: '',
        checkType: [],
        status: 0,
        spotSwitch: false,
        contractSwitch: false,
        marginSwitch: false,
      },
      localeDetail: [],
      conditions: [],
      marginData: [],
      formItem: {
        levelConfigId: this.$route.params.id || '',
        levelIcon: `https://${staticUrl}/static/levels/b-1.png`,
        localeDetail: [],

        spotBuyMakerDiscount: '',
        spotBuyTakerDiscount: '',

        contractBuyMakerDiscount: '',
        contractBuyTakerDiscount: '',

        isBaseLevel: false,
        checkType: false,
        inviteBonusStatus: false,
      },

      discount: [
        {
          name: '币币交易',
          fun: 'exchange',
          key: 'spot',
        },
        {
          name: '合约交易',
          fun: 'futures',
          key: 'contract',
        },
      ],

      defaultLimit: {
        withdrawNumberLimit: '',
        withdrawNeedKycQuota: '',
        withdrawUpperLimit: '',
      },
      pageLoading: false,
      uploading: false,
      loading: false,
    }
  },
  computed: {
    ...mapState(['lang', 'tokens', 'functions', 'isRead']),
  },
  methods: {
    uploadSuccess(result) {
      this.uploading = false
      this.formItem.levelIcon = result.data.url
      this.$Notice.success({
        title: this.$lang('成功'),
      })
    },
    beforeUpload() {
      this.uploading = true
    },
    exceededSize() {
      this.uploading = false
      this.$Notice.error({
        title: this.$lang('图片过大，请压缩后重新上传'),
      })
    },
    formatError() {
      this.uploading = false
      this.$Notice.error({
        title: this.$lang('图片格式不正确，仅支持.png格式的图片'),
      })
    },
    loadData() {
      this.pageLoading = true
      this.$axios
        .post('/api/v1/user_level/withdraw_limiter', {})
        .then((result) => {
          this.pageLoading = false
          if (result.code === 0 && result.data) {
            Object.assign(this.defaultLimit, result.data)
          }
        })

      let conditions = [
        [
          {
            key: 'balanceAmount',
            minValue: '',
            maxValue: '0',
            tokenId: '',
          },
          {
            key: '30dSpotTradeAmountBtc',
            minValue: '',
            maxValue: '0',
          },
        ],
        [
          {
            key: 'balanceAmount',
            minValue: '',
            maxValue: '0',
            tokenId: '',
          },
          {
            key: '30dContractTradeAmountBtc',
            minValue: '',
            maxValue: '0',
          },
        ],
      ]

      if (this.formItem.levelConfigId) {
        this.$axios
          .post('/api/v1/user_level/query_configs', {
            id: this.formItem.levelConfigId,
          })
          .then((result) => {
            if (result.code == 0 && result.data.length) {
              let res = result.data[0]

              if (res.conditions && res.conditions.length) {
                conditions.forEach((local, index) => {
                  if (res.conditions[index] && res.conditions[index].length) {
                    local.forEach((localItem) => {
                      res.conditions[index].forEach((el) => {
                        if (el.key === localItem.key) {
                          Object.assign(localItem, el)
                        }
                      })
                    })
                  }
                })
              }

              this.conditions = conditions

              Object.assign(this.formItem, res)

              res.localeDetail.forEach((el) => {
                this.localeDetail.forEach((_el) => {
                  if (el.language == _el.language) {
                    Object.assign(_el, el)
                    if (el.levelName) {
                      _el.enabled = true
                    }
                  }
                })
              })
            }
          })
      } else {
        this.conditions = conditions
      }
    },
    getOtherConfig() {
      this.$axios
        .post('/api/v1/user_level/query_have_token_discount', {})
        .then((result) => {
          if (result.code === 0) {
            Object.assign(this.otherItem, result.data)
            for (let key in result.data) {
              if (result.data[key] === true) {
                this.otherItem.checkType.push(key)
              }
            }
          }
        })
    },
    getMarginConfig() {
      let levelConfigId = 0
      if (this.formItem.levelConfigId) {
        levelConfigId = this.formItem.levelConfigId
      } else {
        levelConfigId = 0
      }
      this.$axios
        .get('/api/v1/user_level/query_margin_interest', {
          params: { levelConfigId: levelConfigId },
        })
        .then((result) => {
          if (result.code === 0) {
            result.data.map((item) => {
              if (item.showInterest == 0) {
                item.showInterest = item.interest
              }
              if (item.showInterest == -1) {
                item.showInterest = 0
              }
            })
            // Object.assign(this.marginData, result.data)
            this.marginData = result.data
          }
        })
    },
    saveOtherConfig() {
      let checkType = {
        spotSwitch: false,
        contractSwitch: false,
        marginSwitch: false,
      }
      this.otherItem.checkType.forEach((item) => {
        checkType[item] = true
      })
      Object.assign(this.otherItem, checkType)
      if (this.otherItem.status == 'true' || this.otherItem.status == 1) {
        this.otherItem.status = 1
      } else {
        this.otherItem.status = 0
      }
      this.$axios
        .post('/api/v1/user_level/add_have_token_discount', this.otherItem)
        .then(() => {})
    },
    submit() {
      this.saveOtherConfig()
      this.pageLoading = true

      this.formItem.localeDetail = this.localeDetail.filter(
        (el) => el.enabled && el.levelName
      )

      this.formItem.conditions = []

      this.conditions.forEach((el) => {
        let tmp = el.filter((_el) => _el.minValue && _el.tokenId !== '')
        this.formItem.conditions.push(tmp)
      })
      let interestsData = []
      this.marginData.map((item) => {
        interestsData.push({
          tokenId: item.tokenId,
          interest: item.showInterest,
        })
      })
      Object.assign(this.formItem, {
        spotSellMakerDiscount: this.formItem.spotBuyMakerDiscount || '100',
        spotSellTakerDiscount: this.formItem.spotBuyTakerDiscount || '100',
        contractSellMakerDiscount:
          this.formItem.contractBuyMakerDiscount || '100',
        contractSellTakerDiscount:
          this.formItem.contractBuyTakerDiscount || '100',

        spotBuyMakerDiscount: this.formItem.spotBuyMakerDiscount || '100',
        spotBuyTakerDiscount: this.formItem.spotBuyTakerDiscount || '100',
        contractBuyMakerDiscount:
          this.formItem.contractBuyMakerDiscount || '100',
        contractBuyTakerDiscount:
          this.formItem.contractBuyTakerDiscount || '100',

        withdrawUpperLimitInBTC: this.defaultLimit.withdrawUpperLimit,
        optionBuyMakerDiscount: '100',
        optionBuyTakerDiscount: '100',
        optionSellMakerDiscount: '100',
        optionSellTakerDiscount: '100',
        cancelOtc24hWithdrawLimit: false,
        inviteBonusStatus: this.formItem.inviteBonusStatus,
        tokenInterests: interestsData,
      })
      if (!this.functions['margin']) {
        this.formItem.tokenInterests = []
      }
      this.$axios
        .post('/api/v1/user_level/config', this.formItem)
        .then((result) => {
          this.pageLoading = false
          if (result.code === 0) {
            this.$Notice.success({
              title: this.$lang('成功'),
            })
            if (!this.formItem.levelConfigId) {
              this.$router.replace(`/user/grade/level`)
            }
          }
        })
    },
  },
  mounted() {
    this.getMarginConfig()
  },
  created() {
    this.localeDetail = initData(this.lang, JSON.stringify({ levelName: '' }))
    this.loadData()
    this.getOtherConfig()
  },
}
</script>
