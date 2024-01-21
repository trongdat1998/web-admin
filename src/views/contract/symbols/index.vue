<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/contract/symbols/list") {{$lang('合约列表')}}
    router-link.button(to="/contract/symbols/apply") {{$lang('合约申请')}}
  router-view
</template>
<script>
  export default {
    computed: {},
  };
</script>
