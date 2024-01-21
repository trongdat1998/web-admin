<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/activity/redPacket/orders") {{$lang('红包记录')}}
    router-link.button(to="/activity/redPacket/tokens") {{$lang('币种')}}
    router-link.button(to="/activity/redPacket/config") {{$lang('设置')}}
  router-view
</template>
