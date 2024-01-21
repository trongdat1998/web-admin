<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/app/app/common") {{$lang('基础配置')}}
    router-link.button(to="/app/app/download") {{$lang('下载管理')}}
    router-link.button(to="/app/app/share") {{$lang('分享配置')}}
    router-link.button(to="/app/app/update") {{$lang('升级配置')}}
    router-link.button(to="/app/app/gongge") {{$lang('宫格配置')}}
    // router-link.button(to="/manage/app/screen") {{$lang('闪屏配置')}}
    router-link.button(to="/app/app/tabs") {{$lang('TAB配置')}}
  router-view
</template>

