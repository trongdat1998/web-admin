<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/otc/settings/tokens") {{$lang('币种管理')}}
    router-link.button(to="/otc/settings/currency") {{$lang('法币配置')}}
  router-view
</template>
