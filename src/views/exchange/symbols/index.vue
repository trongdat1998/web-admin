<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/exchange/symbols/list") {{$lang('币对管理')}}
    router-link.button(to="/exchange/symbols/task") {{$lang('定时任务')}}
    router-link.button(to="/exchange/symbols/apply") {{$lang('上币申请')}}
  router-view
</template>
<script>
  export default {};
</script>
