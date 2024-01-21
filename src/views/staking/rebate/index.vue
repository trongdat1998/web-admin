<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/staking/rebate/regular") {{$lang('定期产品')}}
    router-link.button(to="/staking/rebate/lock") {{$lang('锁仓产品')}}
    router-link.button(to="/staking/rebate/current") {{$lang('活期产品')}}
  router-view
</template>
