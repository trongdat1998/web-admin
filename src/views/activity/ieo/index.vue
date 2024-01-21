<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/activity/ieo/home") {{$lang('IEO管理')}}
    router-link.button(to="/activity/ieo/config") {{$lang('IEO页面配置')}}
  router-view
</template>
