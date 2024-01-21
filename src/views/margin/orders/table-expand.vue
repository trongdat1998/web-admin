<style scoped>
.expand-row {
  padding: 8px 0;
  border-top: 1px solid #e1e1e1;
}
</style>
<template lang="pug">
  div
      Row(style="padding: 8px 0;")
          Col(span="5") 时间:
          Col(span="4") 价格:
          Col(span="5") 数量:
          Col(span="5") 成交额:
          Col(span="5") 手续费:
      Row.expand-row(v-for="item,index in list" :key="index")
          Col(span="5") {{newDate(item.createdAt).format()}}
          Col(span="4") {{item.price}}
          Col(span="5") {{item.quantity}}
          Col(span="5") {{item.amount}}
          Col(span="5") {{item.tokenFee}}
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