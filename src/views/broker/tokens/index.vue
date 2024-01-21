<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/broker/tokens/tokens") {{$lang('币种管理')}}
    router-link.button(to="/broker/tokens/task") {{$lang('定时任务')}}
    router-link.button(to="/broker/tokens/apply") {{$lang('上币申请')}}
  router-view
</template>
<script>
  export default {};
</script>
