<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/staking/product/regular") {{$lang('定期产品')}}
    router-link.button(to="/staking/product/lock") {{$lang('锁仓产品')}}
    router-link.button(to="/staking/product/current") {{$lang('活期产品')}}
  router-view
</template>
