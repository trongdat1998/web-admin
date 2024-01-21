<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/manage/website/navigation") {{$lang('导航数据')}}
    router-link.button(to="/manage/website/common") {{$lang('基础数据')}}
    router-link.button(to="/manage/website/oldHome" v-if="!indexNewVersion||frontendCustomer") {{$lang('首页数据')}}
    router-link.button(v-else to="/manage/website/newHome") {{$lang('首页数据')}}
    router-link.button(to="/manage/website/login") {{$lang('登录注册')}}
    router-link.button(to="/manage/website/theme") {{$lang('配色管理')}}
  router-view
</template>
<script>
import { mapState } from "vuex";
export default {
  data(){
    return {
      type:this.$route.query.type
    }
  },
  computed: {
    ...mapState(["lang", "indexNewVersion", "frontendCustomer"])
  }
};
</script>
