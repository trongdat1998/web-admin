<template lang="pug"> 
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="24")
      Input(placeholder="UID" v-model="searchForm.userId", search enter-button="" @on-search="load")
  Row(:gutter="15" style="margin-bottom:20px")
    Col(span="4")
      Card {{$lang('邀请码')}}：{{inviteInfo.inviteCode}} 
    Col(span="4") 
      Card {{$lang('邀请人数')}}：{{inviteInfo.inviteCount}} 
    Col(span="4") 
      Card {{$lang('直接邀请')}}：{{inviteInfo.inviteDirectValidCount}}
    Col(span="4") 
      Card {{$lang('间接邀请')}}：{{inviteInfo.inviteIndirectValidCount}}
    Col(span="8") 
      Card {{$lang('上级邀请人')}}
        template(v-if="userInfo.inviteUserId>0")
          User(:uid="userInfo.inviteUserId")
          | &nbsp;&nbsp;&nbsp;&nbsp;
        template(v-else) {{$lang('无')}}&nbsp;&nbsp;&nbsp;&nbsp;
        a(v-if="userInfo.inviteUserId>0 && !isRead" @click.prevent="removeWin=true") {{$lang('删除')}}
        a(v-else-if="!loading&&inviteInfo.userId&&!isRead" @click.prevent="add") {{$lang('添加')}}
  Table(:columns="columns", :data="listData" :loading="loading")
  Row(:gutter="20" style="padding-top:30px")
    Col(span="10")
      ButtonGroup
        Button(@click="getFirstInviteRelation" :disabled="inviteFrom.fromId==0" icon="ios-skip-backward")
        Button(@click="getNextInviteRelation" :disabled="listData.length<inviteFrom.limit" icon="ios-arrow-forward")
  Modal(v-model="removeWin" :title="$lang('删除')" width="300")
    Alert(type="error") {{$lang('您确定执行此操作吗？')}}
    Button(slot="footer" long type="error" @click="doRemove" :loading="loading" :disabled="loading") {{$lang('删除')}}
  Modal(v-model="addWin" :title="$lang('添加')" width="300")
    Input(v-model="addForm.inviteUserId" placeholder="UID")
    Button(slot="footer" long type="success" @click="doAdd" :loading="loading" :disabled="loading") {{$lang('添加')}}
</template>
<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['isRoot', 'isRead']),
  },
  data() {
    return {
      addWin: false,
      removeWin: false,
      searchForm: {
        userId: this.$route.params.userId || '',
      },
      addForm: {
        inviteUserId: '',
        invitedUserId: '',
      },
      loading: false,
      inviteInfo: {
        userId: '',
        inviteCode: '',
        inviteCount: 0,
        inviteValidCount: 0,
        inviteDirectValidCount: 0,
        inviteIndirectValidCount: 0,
        inviteLevel: 0,
        directRate: 0,
        indirectRate: 0,
        bonusCoin: 0,
        bonusPoint: 0,
      },
      userInfo: {
        userId: '',
        accountId: '',
        firstName: '',
        secondName: '',
        nationalCode: '',
        mobile: '',
        email: '',
        bindGa: false,
        verifyStatus: 0,
        created: '',
        userStatus: 1,
        isFreezeLogin: 0,
        inviteUserId: '0',
      },
      listData: [],
      inviteFrom: { fromId: 0, lastId: '0', limit: 200 },
      columns: [
        {
          title: this.$lang('被邀请人账号'),
          minWidth: 160,
          render: (h, p) =>
            h('span', p.row.registerType == 1 ? p.row.mobile : p.row.email),
        },
        {
          title: this.$lang('被邀请人UID'),
          minWidth: 160,
          key: 'userId',
          render: (h, params) =>
            h('User', {
              props: {
                uid: params.row.userId,
              },
            }),
        },
        {
          title: this.$lang('邀请时间'),
          minWidth: 190,
          render: (h, params) =>
            h('span', this.newDate(params.row.registerDate).format()),
        },
        {
          title: this.$lang('邀请关系'),
          minWidth: 160,
          render: (h, p) =>
            h(
              'span',
              this.$lang(p.row.inviteType == 1 ? '直接邀请' : '间接邀请')
            ),
        },
      ],
    }
  },
  methods: {
    doRemove() {
      this.loading = true
      this.$axios
        .post('/api/v1/invite/cancel_invite_relation', {
          inviteUserId: this.searchForm.userId,
          invitedUserId: this.searchForm.userId,
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.removeWin = false
            this.load()
          }
        })
    },
    doAdd() {
      this.loading = true
      this.$axios
        .post('/api/v1/invite/rebuild_invite_relation', this.addForm)
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.addWin = false
            this.load()
          }
        })
    },
    add() {
      this.addForm.invitedUserId = this.searchForm.userId
      this.addWin = true
    },

    getFirstInviteRelation() {
      this.inviteFrom.fromId = 0
      this.getInviteRelation()
    },
    getNextInviteRelation() {
      this.inviteFrom.fromId = this.listData[this.listData.length - 1].inviteId
      this.getInviteRelation()
    },
    getInviteRelation() {
      this.loading = true
      return this.$axios
        .post(
          '/api/v1/invite/get_user_invite_relation',
          Object.assign(this.inviteFrom, this.searchForm)
        )
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.listData = result.data
          }
        })
    },
    load() {
      if (!this.searchForm.userId) {
        return
      }
      Object.keys(this.inviteInfo).forEach((el) => {
        this.inviteInfo[el] = ''
      })

      Object.assign(this.userInfo, {
        userId: '',
        accountId: '',
        firstName: '',
        secondName: '',
        nationalCode: '',
        mobile: '',
        email: '',
        bindGa: false,
        verifyStatus: 0,
        created: '',
        userStatus: 1,
        isFreezeLogin: 0,
        inviteUserId: '0',
      })
      this.$axios
        .post('/api/v1/invite/get_user_invite_info', this.searchForm)
        .then((result) => {
          if (result.code == 0) {
            Object.assign(this.inviteInfo, result.data)
          }
        })

      this.$axios
        .post('/api/v1/brokeruser/get_broker_user', this.searchForm)
        .then((result) => {
          if (result.code == 0) {
            Object.assign(this.userInfo, result.data)
          }
        })

      this.getInviteRelation()
    },
  },
  created() {
    this.load()

    if (this.isRoot) {
      this.columns = [
        ...this.columns,
        {
          title: this.$lang('间接邀请人数'),
          minWidth: 160,
          key: 'inviteIndirectCount',
        },
      ]
    }
  },
}
</script>
