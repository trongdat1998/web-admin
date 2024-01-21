<template lang="pug"> 
div
  Alert
    Row
      Col(span="6") {{$lang('邀请码')}}：{{inviteInfo.inviteCode}} 
      Col(span="6") {{$lang('邀请人数')}}：{{inviteInfo.inviteCount}} 
      Col(span="6") {{$lang('直接邀请')}}：{{inviteInfo.inviteDirectValidCount}}
      Col(span="6") {{$lang('间接邀请')}}：{{inviteInfo.inviteIndirectValidCount}}
  Table(:columns="columns", :data="listData" :loading="loading")
  Row(:gutter="20" style="padding-top:30px")
    Col(span="10")
      ButtonGroup
        Button(@click="getFirstInviteRelation" :disabled="inviteFrom.fromId==0" icon="ios-skip-backward")
        Button(@click="getNextInviteRelation" :disabled="listData.length<inviteFrom.limit" icon="ios-arrow-forward")
</template>
<script>
export default {
  props: {
    searchForm: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      loading: false,
      inviteInfo: {},
      listData: [],
      inviteFrom: { fromId: 0, lastId: "0", limit: 200 },
      columns: [
        {
          title: this.$lang("被邀请人账号"),
          minWidth: 160,
          render: (h, p) =>
            h("span", p.row.registerType == 1 ? p.row.mobile : p.row.email)
        },
        {
          title: this.$lang("被邀请人UID"),
          minWidth: 160,
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId
              }
            })
        },
        {
          title: this.$lang("邀请时间"),
          minWidth: 190,
          render: (h, params) =>
            h("span", this.newDate(params.row.registerDate).format())
        },
        {
          title: this.$lang("邀请关系"),
          minWidth: 160,
          render: (h, p) =>
            h(
              "span",
              this.$lang(p.row.inviteType == 1 ? "直接邀请" : "间接邀请")
            )
        }
      ]
    };
  },
  methods: {
    getInviteRelation() {
      this.loading = true;
      this.$axios
        .post(
          "/api/v1/brokeruser/get_user_invite_relation",
          Object.assign(this.inviteFrom, this.searchForm)
        )
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    getFirstInviteRelation() {
      this.inviteFrom.fromId = 0;
      this.getInviteRelation();
    },
    getNextInviteRelation() {
      this.inviteFrom.fromId = this.listData[this.listData.length - 1].inviteId;
      this.getInviteRelation();
    }
  },
  created() {
    this.$axios
      .post("/api/v1/brokeruser/get_user_invite_info", this.searchForm)
      .then(result => {
        if (result.code == 0) {
          this.inviteInfo = result.data;
        }
      });
    this.getInviteRelation();
  }
};
</script>