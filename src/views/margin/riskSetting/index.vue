<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/margin/riskSetting/riskSetting") {{$lang('风控设置')}}
    router-link.button(to="/margin/riskSetting/blackList") {{$lang('黑名单设置')}}
    router-link.button(to="/margin/riskSetting/specialLoanLimit") {{$lang('特殊借币限额')}}
  router-view
</template>
<script>
export default {
}
</script>
