<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/manage/orgapi/auth") {{$lang('创建API')}}
    router-link.button(to="/manage/orgapi/trans") {{$lang('增加二级流水')}}
  router-view
</template>
