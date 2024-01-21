<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/manage/public/home") {{$lang('首页推荐币对')}}
    router-link.button(to="/manage/public/kyc") {{$lang('KYC设置')}}
    router-link.button(to="/manage/public/warning") {{$lang('首页风险提示')}}
    router-link.button(to="/manage/public/mail" v-if="isRoot") {{$lang('邮件设置')}}
    router-link.button(to="/manage/public/newsTemplate" v-if="isRoot") {{$lang('新闻设置')}}
    router-link.button(to="/manage/public/platform") {{$lang('平台自定义数据')}}
    router-link.button(to="/manage/public/common") {{$lang('通用配置')}}
  router-view
</template>
<script>
  import { mapState } from 'vuex';
  export default {
    computed: {
      ...mapState(['isRoot']),
    },
  };
</script>
