<template lang="pug">
    Main
        .manage-menu
            router-link.button(to="/margin/report/pool") {{$lang('币池信息')}}
            router-link.button(to="/margin/report/transaction") {{$lang('成交统计')}}
            router-link.button(to="/margin/report/user") {{$lang('用户数据')}}
        router-view
</template>
<script>
  export default {};
</script>
