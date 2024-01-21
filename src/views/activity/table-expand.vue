<style scoped lang="less">
.expand-row {
  border-top: 1px solid #e1e1e1;
  td{
    padding: 4px 10px;
    height: 36px;
    background: #fff;
  }
}
</style>
<template lang="pug">
div
  table(width="100%" cellspacing="0" cellpadding="0" border="0")
    tr.expand-row
      td {{$lang("币种")}}
      td {{$lang("数量")}}
      td {{$lang("待支付数量")}}
      td {{$lang("详情")}}
    tr.expand-row(v-for="item in list" :key="item.token")
      td {{item.token}}
      td {{item.amount}}
      td {{item.amount*1-item.transferAmount*1}}
      td
        a(:href="`/activity/invite_transfer/detail/${item.statisticsTime}/${item.token}`" target="_blank") {{$lang("详情")}}
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default() {
        return [];
      }
    }
  }
};
</script>