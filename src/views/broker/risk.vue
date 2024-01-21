<template lang="pug">
Main.page-exchange
  Tabs(v-model="searchForm.rcType" @on-click="getData")
    template(v-for="item,key in types" )
      template(v-if="keys[key]")
        TabPane(:type="searchForm.rcType==key?'primary':'default'" :label="item" :name="key"  v-if="functions[keys[key]]")
      template(v-else)
        TabPane(:type="searchForm.rcType==key?'primary':'default'" :label="item" :name="key")
  Row.search(:gutter="15")
    Col(span="20")
      Input(:placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')}`" v-model="inputInfo" search enter-button="" @on-search="search")
    Col(span="4")
      Button(type="primary" long ghost @click="newOne" :disabled="isRead" icon="md-add-circle") {{$lang('新建')}}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
  Row.page-pages(v-show="listData.length==searchForm.pageSize")
    Col(span="4")
      Button(long @click="more" type="primary" ghost) {{$lang('下一页')}}
  Modal(v-model="removeWin" :title="$lang('删除') + types[searchForm.rcType]" width="300")
    Alert(type="error")
      | USERID: {{nextForm.userId}}<br><br>
      | EMAIL: {{nextForm.email}}<br><br>
      | MOBILE: {{nextForm.mobile}}<br>
    Button(slot="footer" long type="error" @click="doRemove" :loading="loading" :disabled="loading") {{$lang('删除')}}
  Modal(v-model="addWin" :title="$lang('新建') + ' (' +types[searchForm.rcType] + ')'" width="300")
    Input(v-model="nextForm.userId" placeholder="UID")
    Button(slot="footer" long type="success" @click="doAdd" :loading="loading" :disabled="loading") {{$lang('添加')}}
</template>
<script>
import { formatParams } from '@/libs/common.js'
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['functions', 'isRead']),
  },
  data() {
    return {
      addWin: false,
      removeWin: false,
      nextForm: {
        userId: '',
        mobile: '',
        email: '',
      },
      searchForm: {
        userId: '',
        phone: '',
        email: '',
        rcType: 'disable.userlogin',
        lastId: 0,
        pageSize: 20,
      },
      inputInfo: '',
      loading: false,
      loadingTable: false,

      types: {
        'disable.userlogin': this.$lang('账户冻结'),
        'force.audit.user.withdraw': this.$lang('提现关注'),
        'withdraw.blacklist': this.$lang('禁止出金'),
        'withdraw.whitelist': this.$lang('提币白名单'),
        'frozen.user.coin.trade': this.$lang('禁止币币交易'),
        'frozen.user.future.trade': this.$lang('禁止合约交易'),
        'frozen.user.otc.trade': this.$lang('禁止OTC交易'),
        'frozen.user.bonus.trade': this.$lang('禁止币多多交易'),
        'frozen.user.api.coin.trade': this.$lang('禁止API交易'),
      },
      keys: {
        'frozen.user.coin.trade': 'exchange',
        'frozen.user.future.trade': 'futures',
        'frozen.user.otc.trade': 'otc',
        'frozen.user.bonus.trade': 'bonus',
      },
      columns: [
        {
          type: 'index',
          minWidth: 100,
        },
        {
          title: 'UID',
          minWidth: 190,
          render: (h, params) =>
            h('User', {
              props: {
                uid: params.row.userId,
              },
            }),
        },
        {
          title: this.$lang('时间'),
          minWidth: 190,
          render: (h, params) =>
            h('span', this.newDate(params.row.created).format()),
        },
        {
          title: this.$lang('手机号'),
          minWidth: 160,
          key: 'mobile',
          render: (h, params) =>
            h('span', params.row.mobile ? params.row.mobile : '----'),
        },
        {
          title: 'Email',
          minWidth: 160,
          key: 'email',
          render: (h, params) =>
            h('span', params.row.email ? params.row.email : '----'),
        },
        {
          title: this.$lang('备注'),
          minWidth: 160,
          key: 'remark',
          render: (h, params) =>
            h('span', params.row.remark ? params.row.remark : '----'),
        },
        {
          title: this.$lang('操作'),
          minWidth: 160,
          render: (h, params) =>
            h(
              'Button',
              {
                attrs: {
                  size: 'small',
                  ghost: true,
                  type: 'error',
                  disabled: this.isRead,
                },
                on: {
                  click: () => {
                    this.removeWin = true
                    Object.assign(this.nextForm, params.row)
                  },
                },
              },
              this.$lang('删除')
            ),
        },
      ],
      listData: [],
    }
  },
  methods: {
    newOne() {
      this.nextForm.userId = ''
      this.addWin = true
    },

    withdraw(bwType, status) {
      // BLACK_CONFIG: 0, //禁止出金 0-否 1-是，
      // WHITE_CONFIG: 0, //提币白名单 0-否 1-是

      this.$axios
        .post(`/api/v1/userrisk/user_withdraw_setting`, {
          userId: this.nextForm.userId,
          bwType,
          status,
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.removeWin = false
            this.addWin = false
            this.loadData()
          }
        })
    },

    userLogin(status) {
      this.$axios
        .post(
          status
            ? '/api/v1/userrisk/reopen_user_login'
            : '/api/v1/userrisk/disable_user_login',
          this.nextForm
        )
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.removeWin = false
            this.addWin = false
            this.loadData()
          }
        })
    },

    editConfig(value) {
      this.$axios
        .post('/api/v1/broker/config/common_config/edit_config', {
          group: this.searchForm.rcType,
          value,
          key: this.nextForm.userId,
          status: value ? 1 : 0,
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.removeWin = false
            this.addWin = false
            this.loadData()
          }
        })
    },

    doRemove() {
      this.loading = true
      if (this.searchForm.rcType == 'disable.userlogin') {
        this.userLogin(true)
      } else if (this.searchForm.rcType == 'withdraw.blacklist') {
        this.withdraw(1, 0)
      } else if (this.searchForm.rcType == 'withdraw.whitelist') {
        this.withdraw(2, 0)
      } else {
        this.editConfig(false)
      }
    },

    doAdd() {
      this.loading = true
      if (this.searchForm.rcType == 'disable.userlogin') {
        this.userLogin(false)
      } else if (this.searchForm.rcType == 'withdraw.blacklist') {
        this.withdraw(1, 1)
      } else if (this.searchForm.rcType == 'withdraw.whitelist') {
        this.withdraw(2, 1)
      } else {
        this.editConfig(true)
      }
    },

    getData(rcType) {
      this.searchForm.rcType = rcType
      this.search()
    },

    search() {
      this.searchForm.lastId = 0
      this.loadData()
    },

    loadData() {
      this.loadingTable = true
      this.$axios
        .post(
          '/api/v1/userrisk/user_rc_records',
          Object.assign(this.searchForm, formatParams(this.inputInfo))
        )
        .then((result) => {
          if (result.code == 0) {
            this.listData = result.data
          }
          this.loadingTable = false
        })
    },

    more() {
      this.searchForm.lastId = this.listData[this.listData.length - 1].id
      this.loadData()
    },
  },
  created() {
    this.loadData()
  },
}
</script>
