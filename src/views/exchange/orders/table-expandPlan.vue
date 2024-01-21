<style scoped>
.expand-row {
  padding: 8px 0;
  border-top: 1px solid #e1e1e1;
}
</style>
<template lang="pug">
  div
      Row(style="padding: 8px 0;")
          Col(span="4") {{$lang('创建时间')}}:
          Col(span="3") {{$lang('委托价格')}}:
          Col(span="3") {{$lang('币对')}}:
          Col(span="3") {{$lang('方向')}}:
          Col(span="3") {{$lang('成交总额')}}:
          Col(span="3") {{$lang('状态')}}:
          Col(span="4") {{$lang('委托单号')}}:
      Row.expand-row(v-for="item,index in list" :key="index")
          Col(span="4") {{newDate(item.created).format()}}
          Col(span="3") {{item.price}}
          Col(span="3") {{item.symbolId}}
          Col(span="3") {{item.side ? "卖出" : "买入"}}
          Col(span="3") {{item.executedAmount}}
          Col(span="3") {{ordersStatus[item.status]}}
          Col(span="4") {{item.orderId}}
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
  },
  data() {
    return {
      ordersStatus: {
        0: this.$lang("已建立"),
        1: this.$lang("部分成交"),
        2: this.$lang("完全成交"),
        4: this.$lang("已撤销"),
        6: this.$lang("已报待撤"),
        8: this.$lang("拒绝"),
        10: this.$lang("已报待建"),
      },
    }
  }
};
</script>
