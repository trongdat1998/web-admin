<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/statistic/tops/balance") {{$lang('持币排行')}}
    router-link.button(to="/statistic/tops/cash") {{$lang('充提排行')}}
    router-link.button(to="/statistic/tops/trade") {{$lang('交易排行')}}
    router-link.button(to="/statistic/tops/fee") {{$lang('手续费排行')}}
  router-view
</template>
