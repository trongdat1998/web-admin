<style lang="less">
.page-user {
  .ivu-card-body {
    //line-height: 2;
    //min-height: 260px;
    position: relative;
    .picArea{
      height: 300px;
    }
    img {
      max-height: 266px;
      display: block;
      margin: 0 auto;
      max-width: 100%;
    }
    .text {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      text-align: center;
    }
  }
}
</style>

<template lang="pug">
Main.page-user
  baseInfo(:searchForm="searchForm")
  entrance(:searchForm="searchForm")
  otcInfo(:searchForm="searchForm")
  kycInfo(:searchForm="searchForm")
  Card(dis-hover :title="$lang('其他信息')" style="margin-top:20px")
    Tabs(v-model="name" :animated="false")
      TabPane(:label="$lang('用户资产')" name="userAccsets")
      TabPane(:label="$lang('提币地址')" name="withdrawAddress")
      TabPane(:label="$lang('充币地址')" name="depositAddress")
      TabPane(:label="$lang('登录历史记录')" name="loginLogs")
      TabPane(:label="$lang('最近操作记录')" name="actionLogs")
      TabPane(:label="$lang('邀请记录')" name="inviteRelation")
    userAccsets(:searchForm="searchForm" v-if="name=='userAccsets'")
    loginLogs(:searchForm="searchForm" v-if="name=='loginLogs'")
    actionLogs(:searchForm="searchForm"  v-if="name=='actionLogs'")
    depositAddress(:searchForm="searchForm" v-if="name=='depositAddress'")
    withdrawAddress(:searchForm="searchForm" v-if="name=='withdrawAddress'")
    inviteRelation(:searchForm="searchForm" v-if="name=='inviteRelation'")
</template>
<script>
import withdrawAddress from "./withdrawAddress";
import depositAddress from "./depositAddress";
import loginLogs from "./loginLogs";
import actionLogs from "./actionLogs";
import inviteRelation from "./inviteRelation";
import userAccsets from "./userAccsets";
import kycInfo from "./kycInfo";
import baseInfo from "./baseInfo";
import otcInfo from "./otcInfo"
import entrance from "./entrance"

export default {
  components: {
    withdrawAddress,
    depositAddress,
    loginLogs,
    actionLogs,
    inviteRelation,
    userAccsets,
    kycInfo,
    baseInfo,
    otcInfo,
    entrance
  },
  data() {
    return {
      name:"userAccsets",
      searchForm: {
        userId: this.$route.params.userId
      }
    };
  }
};
</script>