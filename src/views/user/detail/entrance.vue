<template lang="pug">
Card(dis-hover :title="$lang('功能跳转')" style="margin-top:20px")
  Row(:gutter="30" style="margin-bottom:20px")
    Col(span="6")
      Button(target="_blank" long :to="'/cash/search/deposit?userId=' + searchForm.userId") {{$lang('查询充值记录')}}
    Col(span="6")
      Button(target="_blank" long :to="'/cash/search/withdraw?userId=' + searchForm.userId") {{$lang('查询提现记录')}}
    Col(span="6")
      Button(target="_blank" long :to="'/user/data?userId=' + searchForm.userId") {{$lang('查询资产流水记录')}}
    Col(span="6")
      Button(target="_blank" long :to="'/user/delivery_record?userId=' + searchForm.userId") {{$lang('查询消息接收记录')}}
  Row(:gutter="30")
    Col(span="6" v-if="functions.exchange")
      Button(target="_blank" long :to="'/exchange/orders/2?userId=' + searchForm.userId") {{$lang('查询币币交易记录')}}
    Col(span="6" v-if="functions.futures")
      Button(target="_blank" long :to="'/contract/order/tradeLimit?userId=' + searchForm.userId") {{$lang('查询合约交易记录')}}
    Col(span="6" v-if="functions.otc")
      Button(target="_blank" long :to="'/otc/order/0?userId=' + searchForm.userId") {{$lang('查询OTC交易记录')}}
</template>
<script>
import { mapState } from 'vuex'
export default {
  props: {
    searchForm: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
    ...mapState(['functions']),
  },
}
</script>
