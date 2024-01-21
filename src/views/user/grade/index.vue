<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/user/grade/level") {{$lang('等级体系')}}
    router-link.button(to="/user/grade/config") {{$lang('相关配置')}}
  router-view
</template>
