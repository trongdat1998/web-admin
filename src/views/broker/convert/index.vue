<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/broker/convert/ads") {{$lang('广告管理')}}
    router-link.button(to="/broker/convert/orders") {{$lang('历史订单')}}
  router-view
</template>