<style lang="less" scoped>
.wrapper {
  display: flex;
  align-items: center;
  height: calc(100vh - 150px);
}
.background {
  width: 100%;
  padding: 200px 0;
  font-size: 30px;
  text-align: center;
  position: relative;
  .text {
    position: relative;
    z-index: 2;
  }
}
</style>

<template lang="pug">
  .wrapper
    .background 
      .text
        div {{$lang("服务已到期，请续费")}}。
</template>
<style lang="less">
</style>
<script>
export default {
  methods: {
    back() {
      history.back();
    }
  }
};
</script>