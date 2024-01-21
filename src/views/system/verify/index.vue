<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/system/verify/list") {{$lang('待审批列表')}}
    router-link.button(to="/system/verify/history") {{$lang('历史审批')}}
  router-view
</template>
