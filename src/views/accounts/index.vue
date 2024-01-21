<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/accounts/operation") {{$lang('运营账户')}}
    router-link.button(to="/accounts/revenue") {{$lang('营收账户')}}
    router-link.button(to="/accounts/list") {{$lang('资金账户')}}

  router-view
</template>
<script>
  import { mapState } from 'vuex';
  export default {
    computed: {},
  };
</script>
