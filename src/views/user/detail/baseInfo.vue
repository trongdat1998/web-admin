<template lang="pug">
div
  Card(dis-hover :title="$lang('基础信息')" :style="{background:backgroud[remark.value.status]}")
    Button(slot="extra" @click.prevent="loadLog" type="primary" size="small") {{$lang('修改记录')}}
    Row(:gutter="30")
      Col(span="8")
        List(size="small" border)
          listItem UID：{{currentUserInfo.userId}}
          listItem {{types['disable.userlogin']}}：
            iSwitch(:disabled="isRead" v-model="currentUserInfo.userStatus", :false-value="1", :true-value="2" @on-change="settingsHub('disable.userlogin')" size="small")
          Poptip(trigger="hover" :content="`${groupsName['frozen.user.coin.trade']} ${$lang('禁止')} ${newDate(groupsCreated['frozen.user.coin.trade']).format()}`" placement="top" :disabled="!groups['frozen.user.coin.trade']")
            listItem(v-if="functions.exchange") {{types['frozen.user.coin.trade']}}：
              iSwitch(:disabled="isRead" v-model="groups['frozen.user.coin.trade']"  @on-change="settingsHub('frozen.user.coin.trade')" size="small")
          br
          Poptip(trigger="hover" :content="`${groupsName['frozen.user.otc.trade']} ${$lang('禁止')} ${newDate(groupsCreated['frozen.user.otc.trade']).format()}`" placement="top" :disabled="!groups['frozen.user.otc.trade']")
            listItem(v-if="functions.otc") {{types['frozen.user.otc.trade']}}：
              iSwitch(:disabled="isRead" v-model="groups['frozen.user.otc.trade']"  @on-change="settingsHub('frozen.user.otc.trade')" size="small")
          listItem  {{$lang("GA")}}：{{$lang(currentUserInfo.bindGa ? "已绑定" : "未绑定")}} &nbsp;&nbsp;
            Button(:disabled="isRead" size="small" type="error" v-if="currentUserInfo.bindGa" @click="unbindInfo('ga')") {{$lang('解绑')}}
          //- listItem {{$lang("24小时登录冻结")}}：
          //-   Button(size="small" type="error" v-if="currentUserInfo.isFreezeLogin" @click="unFreezeLogin") {{$lang('解除冻结')}}
          //-   template(v-else) {{$lang('正常')}}
          listItem {{$lang('上级邀请人')}}：
            User(:uid="currentUserInfo.inviteUserId" v-if="currentUserInfo.inviteUserId>0") {{currentUserInfo.inviteUserId}}
            template(v-else) {{$lang('无')}}
            | &nbsp;&nbsp;
            a(:href="'/broker/inviteRelation/'+ currentUserInfo.userId " target="_blank") {{isRead ?$lang('查看'):$lang('修改')}}
          listItem(v-if="functions.userLevel") {{$lang('用户等级')}}：{{levelInfo.levelName}}
      Col(span="8")
        List(size="small" border)
          listItem  AccountID：{{currentUserInfo.accountId}}
          listItem {{types['withdraw.whitelist']}}：
            iSwitch(v-model="WHITE_CONFIG", :false-value="0", :true-value="1" @on-change="settingsHub('withdraw.whitelist')" :disabled="!!BLACK_CONFIG||isRead" size="small")
            | &nbsp;&nbsp;
            Poptip(trigger="hover" :content="$lang('临时关闭提现时，该用户仍可通过提现URL访问并提现')" placement="top")
              Icon(type="md-help-circle")
          Poptip(trigger="hover" :content="`${groupsName['frozen.user.future.trade']} ${$lang('禁止')} ${newDate(groupsCreated['frozen.user.future.trade']).format()}`" placement="top" :disabled="!groups['frozen.user.future.trade']")
            listItem(v-if="functions.futures")  {{types['frozen.user.future.trade']}}：
              iSwitch(:disabled="isRead" v-model="groups['frozen.user.future.trade']"  @on-change="settingsHub('frozen.user.future.trade')" size="small")
          br
          Poptip(trigger="hover" :content="`${groupsName['frozen.user.bonus.trade']} ${$lang('禁止')} ${newDate(groupsCreated['frozen.user.bonus.trade']).format()}`" placement="top" :disabled="!groups['frozen.user.bonus.trade']")
            listItem(v-if="functions.bonus") {{types['frozen.user.bonus.trade']}}：
              iSwitch(:disabled="isRead" v-model="groups['frozen.user.bonus.trade']"  @on-change="settingsHub('frozen.user.bonus.trade')" size="small")
          br
          Poptip(trigger="hover" :content="`${groupsName['force.audit.user.withdraw']} ${$lang('禁止')} ${newDate(groupsCreated['force.audit.user.withdraw']).format()}`" placement="top" :disabled="!groups['force.audit.user.withdraw']")
            listItem {{types['force.audit.user.withdraw']}}：
              iSwitch(:disabled="isRead" v-model="groups['force.audit.user.withdraw']"  @on-change="settingsHub('force.audit.user.withdraw')" size="small")
              | &nbsp;&nbsp;
              Poptip(trigger="hover" :content="$lang('不论提现数额大小都需要人工审核')" placement="top")
                Icon(type="md-help-circle")
          listItem {{$lang('手机号')}}：{{currentUserInfo.mobile ? currentUserInfo.mobile : $lang("未绑定")}} &nbsp;&nbsp;
            Button(size="small" type="primary" @click="getUserMobile('kyc')" v-if="currentUserInfo.mobile") {{$lang("查看")}}
            | &nbsp;&nbsp;
            Button(:disabled="isRead" size="small" type="error" v-if="currentUserInfo.email&&currentUserInfo.mobile" @click="unbindInfo('mobile')") {{$lang('解绑')}}
      Col(span="8")
        List(size="small" border)
          listItem  {{newDate(currentUserInfo.created).format()}}
          listItem {{types['withdraw.blacklist']}}：
            iSwitch(v-model="BLACK_CONFIG", :false-value="0", :true-value="1" @on-change="settingsHub('withdraw.blacklist')" :disabled="!!WHITE_CONFIG||isRead" size="small")
            | &nbsp;&nbsp;
            Poptip(trigger="hover" :content="$lang('限制用户提现及OTC卖出')" placement="top")
              Icon(type="md-help-circle")
          Poptip(trigger="hover" :content="`${groupsName['frozen.user.option.trade']} ${$lang('禁止')} ${newDate(groupsCreated['frozen.user.option.trade']).format()}`" placement="top" :disabled="!groups['frozen.user.option.trade']")
            listItem(v-if="functions.option") {{types['frozen.user.option.trade']}}：
              iSwitch(:disabled="isRead" v-model="groups['frozen.user.option.trade']"  @on-change="settingsHub('frozen.user.option.trade')" size="small")
          br
          Poptip(trigger="hover" :content="`${groupsName['frozen.user.api.coin.trade']} ${$lang('禁止')} ${newDate(groupsCreated['frozen.user.api.coin.trade']).format()}`" placement="top" :disabled="!groups['frozen.user.api.coin.trade']")
            listItem {{types['frozen.user.api.coin.trade']}}：
              iSwitch(:disabled="isRead" v-model="groups['frozen.user.api.coin.trade']"  @on-change="settingsHub('frozen.user.api.coin.trade')" size="small")
          listItem {{$lang('冻结杠杆账户')}}：
            iSwitch(:disabled="isRead" v-model="marginAccoutStatus.curStatus" :true-value="1" :false-value="0" @on-change="toFrozen" size="small")
          listItem {{$lang('邮箱')}}：{{currentUserInfo.email ? currentUserInfo.email : $lang("未绑定")}} &nbsp;&nbsp;
            Button(size="small" type="primary" @click="getUserEmail('kyc')" v-if="currentUserInfo.email") {{$lang("查看")}}
            | &nbsp;&nbsp;
            Button(:disabled="isRead" size="small" type="error" v-if="currentUserInfo.email&&currentUserInfo.mobile" @click="unbindInfo('email')") {{$lang('解绑')}}
          listItem {{$lang('经纪人')}}：
            Tag(color="error") {{currentUserInfo.agentLevel}}
    Divider(orientation="left") {{$lang('累计手续费')}}：{{total}} USDT
    Row(:gutter="30")
      Col(span="8" v-if="functions.exchange")
        List(size="small" border)
          listItem {{$lang('30日币币交易额')}}：{{levelInfo.monthTradeAmountInBtc["1"]||0}} BTC
          listItem {{$lang('币币现货手续费')}}：{{levelInfo.tradeFeeInUsdt["1"]||0}} USDT
      Col(span="8" v-if="functions.futures")
        List(size="small" border)
          listItem {{$lang('30日合约交易额')}}：{{levelInfo.monthTradeAmountInBtc["3"]||0}} BTC
          listItem {{$lang('合约手续费')}}：{{levelInfo.tradeFeeInUsdt["3"]||0}} USDT
    Divider(orientation="left") {{$lang('用户备注')}}
    Row(:gutter="30")
      Col(span="16")
        Input(type="textarea" :rows="4" v-model="remark.value.value")
        Tag(v-if="remark.updated") {{$lang("标日期")}}：{{new Date(remark.updated*1).format()}}
        Tag(v-if="remark.adminUserName") {{$lang("标记人")}}：{{remark.adminUserName}}
      Col(span="8")
        RadioGroup(v-model="remark.value.status")
          Radio(:disabled="isRead" border :label="1") {{$lang('一般')}}
          Radio(:disabled="isRead" border :label="2") {{$lang('预警')}}
          Radio(:disabled="isRead" border :label="3") {{$lang('高能')}}
        p(style="padding-top:24px")
          Button(long type="primary" @click="saveRemark" :loading="loading" :disabled="loading||isRead") {{$lang('确定')}}
    Divider(orientation="left" v-if="riskData.length") {{$lang('系统风控信息')}}
    Table(:columns="riskColumns", :data="riskData" :loading="riskLoading" v-if="riskData.length")
      template(slot-scope="{row, index}" slot="action")
        Button(type="primary" size="small" ghost, @click="unFrozen(row)" :disabled="isRead") {{$lang('解锁')}}
  Modal(v-model="unFrozenWin" :title="$lang('解除限制')" width="500" footer-hide)
    Form(:labelWidth="100")
      FormItem(:label="$lang('备注')")
        Input( v-model='formData.remark', :placeholder="$lang('备注')" type="textarea", :rows="2")
      FormItem(:label="$lang('谷歌验证码')" v-if="userInfo.bindGA" required)
        Input( v-model='formData.verifyCode', :placeholder="$lang('谷歌验证码')")
      FormItem(:label="$lang('手机验证码')" v-else required)
        Row
          Col(span="14")
            Input(v-model="formData.verifyCode" type="text" :placeholder="$lang('手机验证码')", :maxlength="6")
          Col(span="2" style="text-align: center") -
          Col(span="8")
            Button(v-if="time" disabled long) {{time}}s
            Button(v-else @click="getCode" long type="primary" ghost :disabled="isRead") {{$lang("获取验证码")}}
    Button(long type="error" @click="unLimit") {{$lang('确定')}}
  Modal(v-model="unbindWin" :title="$lang('解除绑定')" width="300" footer-hide)
    p(style="margin-bottom:20px;font-size:14px") {{$lang('您确定执行此操作吗？')}}
    Button(long type="error" @click="unbind") {{$lang('确定')}}
  Modal(v-model="confirmWin" :title="types[confirmForm.type]" width="400" @on-cancel="cancel")
    Input(v-model="confirmForm.remark" type="textarea" :rows="6" :placeholder="$lang('备注')")
    Button(long type="error" @click="editConfig" slot="footer") {{$lang('确定')}}
  Modal(v-model="confirmMarginWin" :title="$lang('杠杆账户')" width="400" @on-cancel="cancelMargin")
    p(style="margin-bottom:20px;font-size:14px") {{$lang('您确定执行此操作吗？')}}
    Button(long type="error" @click="doFrozen" slot="footer") {{$lang('确定')}}
  Modal(v-model="logWin", :title="$lang('修改记录')" width="800" fullscreen)
    RadioGroup(v-model="logForm.opType" type="button" @on-change="changeType")
      template(v-for="item,key in types" )
        template(v-if="keys[key]")
          Radio(:label="key" v-if="functions[keys[key]]") {{item}}
        Radio(:label="key" v-else) {{item}}
    Divider
    Table(:columns="logColumns", :data="logData" :loading="loadingTable")
    div(style="padding-top:30px")
    ButtonGroup
      Button(icon="md-skip-backward" @click="first"  :disabled="!logForm.lastId")
      Button(icon="ios-arrow-forward" @click="next"  :disabled="logData.length<logForm.pageSize")
</template>
<script>
import { mapState } from 'vuex'
export default {
  props: {
    searchForm: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--
        }, 1000)
      }
    },
  },
  computed: {
    ...mapState(['functions', 'isRead', 'isRoot', 'userInfo']),
    total() {
      let c = 0

      if (this.functions.exchange && this.levelInfo.tradeFeeInUsdt['1']) {
        c += Number(this.levelInfo.tradeFeeInUsdt['1'])
      }

      if (this.functions.option && this.levelInfo.tradeFeeInUsdt['2']) {
        c += Number(this.levelInfo.tradeFeeInUsdt['2'])
      }

      if (this.functions.futures && this.levelInfo.tradeFeeInUsdt['3']) {
        c += Number(this.levelInfo.tradeFeeInUsdt['3'])
      }
      return c
    },
  },
  data() {
    return {
      marginAccoutStatus: {
        curStatus: 0,
      },
      curStatus: '',
      frozenTypes: {
        1: this.$lang('禁止登录'),
        2: this.$lang('禁止提币'),
        3: this.$lang('禁止找回密码'),
        4: this.$lang('禁止收红包'),
        5: this.$lang('禁止发红包'),
        6: this.$lang('禁止OTC出金'),
        7: this.$lang('禁止跨用户转账'),
      },
      frozenReason: {
        1: this.$lang('登录密码输入错误次数过多'),
        2: this.$lang('找回登录密码'),
        3: this.$lang('资金密码输入错误次数过多'),
        4: this.$lang('修改资金密码'),
        5: this.$lang('系统冻结'),
        6: this.$lang('风控冻结'),
        7: this.$lang('修改登录密码'),
        8: this.$lang(' 解绑邮箱'),
        9: this.$lang('解绑手机'),
        10: this.$lang('解绑GA'),
        11: this.$lang('解除KYC认证'),
        12: this.$lang('红包密码错误'),
        13: this.$lang('重新绑定邮箱'),
        14: this.$lang('重新绑定手机'),
        15: this.$lang('重新绑定GA'),
        16: this.$lang('杠杆风控冻结'),
      },
      formData: {},
      time: 0,
      logWin: false,
      riskLoading: false,
      loadingTable: false,
      logForm: {
        opType: 'disable.userlogin',
        pageSize: 100,
        lastId: 0,
        userId: this.$route.params.userId,
      },
      logData: [],
      riskData: [],
      riskColumns: [
        {
          title: this.$lang('风控类型'),
          minWidth: 160,
          key: 'frozenType',
          render: (h, p) => h('span', this.frozenTypes[p.row.frozenType]),
        },
        {
          title: this.$lang('风控原因'),
          minWidth: 190,
          key: 'frozenReason',
          render: (h, p) => h('span', this.frozenReason[p.row.frozenReason]),
        },
        {
          title: this.$lang('开始时间'),
          minWidth: 190,
          key: 'startTime',
          render: (h, p) => h('span', this.newDate(p.row.startTime).format()),
        },
        {
          title: this.$lang('截止时间'),
          minWidth: 190,
          key: 'endTime',
          render: (h, p) => h('span', this.newDate(p.row.endTime).format()),
        },
        {
          title: this.$lang('操作'),
          minWidth: 100,
          slot: 'action',
        },
      ],
      logColumns: [
        {
          title: this.$lang('时间'),
          minWidth: 190,
          key: 'title',
          render: (h, p) => h('span', this.newDate(p.row.created).format()),
        },
        {
          title: this.$lang('操作人'),
          minWidth: 120,
          key: 'username',
        },
        {
          title: this.$lang('状态'),
          minWidth: 120,
          key: 'switchOpen',
          render: (h, p) =>
            h('span', this.$lang(p.row.switchOpen ? '开启' : '关闭')),
        },
        {
          title: this.$lang('备注'),
          minWidth: 120,
          key: 'remark',
        },
      ],

      confirmWin: false,
      confirmMarginWin: false,
      confirmForm: {
        type: '',
        remark: '',
      },
      backgroud: {
        1: '',
        2: 'rgba(255, 153, 0,.2)',
        3: 'rgba(237, 64, 20,.2)',
      },
      BLACK_CONFIG: 0, //提币黑名单 0-否 1-是，
      WHITE_CONFIG: 0, //提币白名单 0-否 1-是
      type: '',
      currentRow: null,
      unFrozenWin: false,
      unbindWin: false,
      currentUserInfo: {},
      levelInfo: {
        monthTradeAmountInBtc: {
          1: '', //近一个月币币交易数据
          3: '', //近一个月合约交易数据
        },
        tradeFeeInUsdt: {
          1: '', //币币手续费
          3: '', //合约手续费
        },
        levelName: '',
      },

      keys: {
        'frozen.user.coin.trade': 'exchange',
        'frozen.user.option.trade': 'option',
        'frozen.user.future.trade': 'futures',
        'frozen.user.otc.trade': 'otc',
        'frozen.user.bonus.trade': 'bonus',
      },
      types: {
        'disable.userlogin': this.$lang('账户冻结'),
        'force.audit.user.withdraw': this.$lang('提现关注'),
        'withdraw.blacklist': this.$lang('禁止出金'),
        'withdraw.whitelist': this.$lang('提币白名单'),
        'frozen.user.coin.trade': this.$lang('禁止币币交易'),
        'frozen.user.option.trade': this.$lang('禁止期权交易'),
        'frozen.user.future.trade': this.$lang('禁止合约交易'),
        'frozen.user.otc.trade': this.$lang('禁止OTC交易'),
        'frozen.user.bonus.trade': this.$lang('禁止币多多交易'),
        'frozen.user.api.coin.trade': this.$lang('禁止API交易'),
      },
      groups: {
        'frozen.user.coin.trade': false,
        'frozen.user.future.trade': false,
        'frozen.user.option.trade': false,
        'frozen.user.otc.trade': false,
        'frozen.user.bonus.trade': false,
        'frozen.user.api.coin.trade': false,
        'force.audit.user.withdraw': false,
      },
      groupsCreated: {
        'frozen.user.coin.trade': '',
        'frozen.user.future.trade': '',
        'frozen.user.option.trade': '',
        'frozen.user.otc.trade': '',
        'frozen.user.bonus.trade': '',
        'frozen.user.api.coin.trade': '',
        'force.audit.user.withdraw': '',
      },
      groupsName: {
        'frozen.user.coin.trade': '',
        'frozen.user.future.trade': '',
        'frozen.user.option.trade': '',
        'frozen.user.otc.trade': '',
        'frozen.user.bonus.trade': '',
        'frozen.user.api.coin.trade': '',
        'force.audit.user.withdraw': '',
      },
      loading: false,
      remark: {
        group: 'user.service.remark',
        value: {
          value: '',
          status: 1,
        },
        key: this.searchForm.userId,
        status: 1,
        adminUserName: '',
        updated: '',
      },
    }
  },
  methods: {
    getCode() {
      !this.time &&
        this.$axios
          .post('/api/v1/user/send_a_sms_verify_code', {})
          .then((result) => {
            if (result.code == 0) {
              this.time = 60
            }
          })
    },
    changeType() {
      this.logForm.lastId = 0
      this.loadLog()
    },
    next() {
      this.logForm.lastId = this.logData[this.logData.length - 1].id
      this.loadLog()
    },
    first() {
      this.logForm.lastId = 0
      this.loadLog()
    },

    loadLog() {
      this.logWin = true
      this.logData = []
      this.loadingTable = true

      this.$axios
        .post('/api/v1/brokeruser/query_risk_logs', this.logForm)
        .then((result) => {
          this.loadingTable = false
          if (result.code === 0) {
            this.logData = result.data
          }
        })
    },

    cancel() {
      let value = this.confirmForm.type
      if (value == 'disable.userlogin') {
        this.currentUserInfo.userStatus =
          this.currentUserInfo.userStatus == 2 ? 1 : 2
      } else if (value == 'withdraw.whitelist') {
        this.WHITE_CONFIG = this.WHITE_CONFIG == 0 ? 1 : 0
      } else if (value == 'withdraw.blacklist') {
        this.BLACK_CONFIG = this.BLACK_CONFIG == 0 ? 1 : 0
      } else {
        this.groups[value] = !this.groups[value]
      }
    },
    cancelMargin() {
      this.marginAccoutStatus.curStatus =
        this.marginAccoutStatus.curStatus == 0 ? 1 : 0
    },
    settingsHub(type) {
      this.confirmWin = true
      this.confirmForm.remark = ''
      this.confirmForm.type = type
    },
    toFrozen() {
      this.confirmMarginWin = true
    },
    doFrozen() {
      this.loading = true
      this.$axios
        .post('/api/v1/brokeruser/margin/change_position_status', {
          changeToStatus: this.marginAccoutStatus.curStatus,
          userId: this.searchForm.userId,
          curStatus: this.curStatus,
        })
        .then(() => {
          this.loading = false
          this.confirmMarginWin = false
          this.loadMarginAccoutStatus()
        })
    },
    saveRemark() {
      this.loading = true
      this.$axios
        .post('/api/v1/broker/config/common_config/edit_config', {
          group: 'user.service.remark',
          key: this.searchForm.userId,
          status: 1,
          value: JSON.stringify(this.remark.value),
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.getConfig()
          }
        })
    },
    editConfig() {
      let value = this.confirmForm.type

      if (value == 'disable.userlogin') {
        return this.userLogin()
      } else if (value == 'withdraw.whitelist') {
        return this.withdrawWhiteConfig()
      } else if (value == 'withdraw.blacklist') {
        return this.withdrawBlackConfig()
      }

      this.$axios
        .post('/api/v1/broker/config/common_config/edit_config', {
          group: value,
          value: this.groups[value],
          key: this.searchForm.userId,
          status: this.groups[value] ? 1 : 0,
          remark: this.confirmForm.remark,
        })
        .then((result) => {
          if (result.code == 0) {
            this.confirmWin = false
            this.loadUserSwitches()
            //location.reload();
          }
        })
    },
    withdrawWhiteConfig() {
      this.$axios
        .post(`/api/v1/brokeruser/user_withdraw_setting`, {
          bwType: 2,
          userId: this.currentUserInfo.userId,
          status: this.WHITE_CONFIG,
          remark: this.confirmForm.remark,
        })
        .then((result) => {
          if (result.code == 0) {
            this.confirmWin = false
            location.reload()
          }
        })
    },

    withdrawBlackConfig() {
      this.$axios
        .post(`/api/v1/brokeruser/user_withdraw_setting`, {
          bwType: 1,
          userId: this.currentUserInfo.userId,
          status: this.BLACK_CONFIG,
          remark: this.confirmForm.remark,
        })
        .then((result) => {
          if (result.code == 0) {
            this.confirmWin = false
            location.reload()
          }
        })
    },
    // unFreezeLogin() {
    //   this.$axios
    //     .post(`/api/v1/brokeruser/unfreeze_user`, {
    //       userId: this.currentUserInfo.userId
    //     })
    //     .then(() => {
    //       location.reload();
    //     });
    // },
    unbindInfo(type) {
      this.unbindWin = true
      this.type = type
    },
    unbind() {
      this.$axios
        .post(`/api/v1/brokeruser/unbind_${this.type}`, {
          userId: this.currentUserInfo.userId,
        })
        .then(() => {
          location.reload()
        })
    },

    userLogin() {
      this.$axios
        .post(
          this.currentUserInfo.userStatus == 1
            ? '/api/v1/brokeruser/reopen_user_login'
            : '/api/v1/brokeruser/disable_user_login',
          Object.assign({ remark: this.confirmForm.remark }, this.searchForm)
        )
        .then((result) => {
          if (result.code == 0) {
            this.confirmWin = false
            location.reload()
          }
        })
    },
    getUserMobile(pageSource) {
      this.searchForm.pageSource = pageSource
      this.$axios
        .post('/api/v1/brokeruser/get_whole_phone', this.searchForm)
        .then((result) => {
          if (result.code == 0) {
            this.currentUserInfo.mobile = result.data
          }
        })
    },
    getUserEmail(pageSource) {
      this.searchForm.pageSource = pageSource
      this.$axios
        .post('/api/v1/brokeruser/get_whole_email', this.searchForm)
        .then((result) => {
          if (result.code == 0) {
            this.currentUserInfo.email = result.data
          }
        })
    },

    getConfig() {
      this.$axios
        .post('/api/v1/broker/config/common_config/get_config', {
          group: 'user.service.remark',
          key: this.searchForm.userId,
        })
        .then((result) => {
          if (result.code == 0 && result.data) {
            result.data.value = JSON.parse(result.data.value)
            Object.assign(this.remark, result.data)
          }
        })
    },

    unFrozen(row) {
      this.currentRow = row
      this.unFrozenWin = true
    },
    unLimit() {
      let authType = this.userInfo.bindGA ? 1 : 2
      Object.assign(
        this.formData,
        { authType: authType },
        { userId: this.currentUserInfo.userId },
        { frozenType: this.currentRow.frozenType }
      )
      this.loading = true
      this.$axios
        .post('/api/v1/brokeruser/unfreeze_user', this.formData)
        .then((result) => {
          this.loading = false
          if (result.code === 0) {
            this.unFrozenWin = false
            this.$Notice.success({
              title: this.$lang('成功'),
            })
            location.reload()
          }
        })
    },

    loadUserSwitches() {
      this.$axios
        .post(
          '/api/v1/brokeruser/user_switches',
          Object.assign(
            {
              groups: Object.keys(this.groups),
            },
            this.searchForm
          )
        )
        .then((result) => {
          if (result.code == 0) {
            result.data.forEach((el) => {
              this.groups[el.group] = el.open
              this.groupsName[el.group] = el.username
              this.groupsCreated[el.group] = el.created
            })
          }
        })
    },
    loadMarginAccoutStatus() {
      this.$axios
        .post('/api/v1/brokeruser/margin/position_status', this.searchForm)
        .then((result) => {
          if (result.code == 0) {
            this.marginAccoutStatus = result.data
            this.curStatus = result.data.curStatus
          }
        })
    },
  },

  created() {
    this.loadUserSwitches()
    this.loadMarginAccoutStatus()
    this.getConfig()
    this.$axios
      .post('/api/v1/brokeruser/get_broker_user', this.searchForm)
      .then((result) => {
        if (result.code == 0) {
          this.currentUserInfo = result.data
          this.riskData = result.data.frozenInfos
        }
      })

    this.$axios
      .post('/api/v1/brokeruser/user_level_info', {
        id: this.searchForm.userId,
      })
      .then((result) => {
        if (result.code == 0) {
          Object.assign(this.levelInfo, result.data)
        }
      })

    this.$axios
      .post('/api/v1/brokeruser/get_user_withdraw_setting', this.searchForm)
      .then((result) => {
        if (result.code == 0) {
          this.BLACK_CONFIG = result.data.BLACK_CONFIG
          this.WHITE_CONFIG = result.data.WHITE_CONFIG
        }
      })
  },
}
</script>
