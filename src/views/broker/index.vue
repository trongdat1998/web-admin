<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/broker/risk/ipDisabled") {{$lang('IP禁止访问')}}
  router-view
</template>
