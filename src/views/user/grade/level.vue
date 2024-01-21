<template lang="pug">
div
  Form.page-exchange
    Row.search(:gutter="15")
      Col(span="20") &nbsp;
      Col(span="4")
        Button(long  type="primary" to="/user/grade/create" icon="md-add-circle" ghost :disabled="isRead") {{$lang('新建')}}
    Table.user-table(:columns="columns", :data="listData", :loading="loading", style="margin-bottom:12px" border)
      div(slot-scope="{ row, index }" slot="action" style="line-height:1.8;padding:5px 0")
        template(v-if="isRead") ---
        template(v-else)
          router-link(:to="`/user/grade/create/${row.levelConfigId}`") {{$lang("修改")}}
          template(v-if="!row.isBaseLevel")  |
            a(@click="deleteData(row)") {{$lang("删除")}}
            br
            a(:href="`/user/grade/search/${row.levelConfigId}`") {{$lang("查看满足名单")}}
            br
            a(@click="addWhite(row)") {{$lang("白名单")}}
    Modal(v-model="removeAlert" :title="$lang('您确定要删除该等级吗？')" footer-hide width="300")
      Button(@click="remove" long type="error") {{$lang("确定")}}
    Modal(v-model="whiteDialog", :title="$lang('白名单')")
      Input(v-model='whitelist', :placeholder="$lang('每行对应一个UID')"  type="textarea", :rows="10")
      template(slot="footer")
        Button(@click="setWhitelist" :loading="loading" type="primary") {{$lang("确定")}}
    Fixed
      Row(:gutter="20")
        Col(span="18") &nbsp;
          a(href="https://xxxxx.zendesk.com/hc/zh-cn/articles/360048192073" targer="_blank") {{$lang("用户等级帮助")}}
        Col(span="6" style="text-align:right")
          strong {{$lang('用户等级体系状态')}} :&nbsp;&nbsp;&nbsp;&nbsp;
          iSwitch(v-model="showStatus", @on-change="change" :disabled="isRead")
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      currentRow: {},
      whitelist: '',
      whiteDialog: false,
      showStatus: false,
      deleteId: '',
      removeAlert: false,
      locale: this.$i18n.locale,
      loading: false,
      searchForm: {
        levelConfigId: '',
      },
      listData: [],
      columns: [],
    }
  },
  computed: {
    ...mapState(['lang', 'functions', 'isRead']),
  },
  methods: {
    formatStr(arr, key) {
      let str = '---'

      arr.forEach((el) => {
        if (key == el.key) {
          str = '≥ ' + el.minValue + (el.tokenId || 'BTC')
        }
      })

      return str
    },
    addWhite(row) {
      this.whiteDialog = true
      this.currentRow = row
      this.$axios
        .post('/api/v1/user_level/query_users', {
          levelConfigId: row.levelConfigId,
          queryWhiteList: true,
          lastId: 0,
          pageSize: 9999, // 设置一个较大的值，查询全部白名单
        })
        .then((result) => {
          if (result.code == 0) {
            this.whitelist = result.data.join('\n')
          }
        })
    },
    setWhitelist() {
      let userIds = []
      let ids = this.whitelist.split('\n')
      if (ids.length) {
        userIds = ids.filter((item) => {
          if (item.trim().length) {
            return item
          }
        })
      }
      this.loading = true
      this.$axios
        .post('/api/v1/user_level/add_white_list', {
          levelConfigId: this.currentRow.levelConfigId,
          userIds: userIds,
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.whiteDialog = false
            this.$Message.success(this.$lang('操作成功'))
          }
        })
    },
    loadData() {
      this.loadingTable = true
      this.$axios
        .post('/api/v1/user_level/query_configs', {})
        .then((result) => {
          this.loadingTable = false
          if (result.code === 0 && result.data) {
            this.listData = result.data
          }
        })

      this.$axios
        .post('/api/v1/broker/config/common_config/get_config', {
          group: 'user.level.config',
          key: 'open.switch',
        })
        .then((result) => {
          if (result.code == 0 && result.data) {
            this.showStatus = result.data.value === 'true' ? true : false
          }
        })
    },
    change() {
      this.$axios
        .post('/api/v1/broker/config/common_config/edit_config', {
          group: 'user.level.config',
          key: 'open.switch',
          value: this.showStatus,
        })
        .then(() => {
          this.$Message.success(this.$lang('操作成功'))
        })
    },
    deleteData(row) {
      this.deleteId = row.levelConfigId
      this.removeAlert = true
    },
    remove() {
      this.$axios
        .post('/api/v1/user_level/delete_config', {
          id: this.deleteId,
        })
        .then(() => {
          this.removeAlert = false
          this.loadData()
          this.$Message.success(this.$lang('操作成功'))
        })
    },
  },
  mounted() {
    let exchange = [
      {
        title: this.$lang('持币量'),
        align: 'center',
        minWidth: 100,
        render: (h, p) =>
          h(
            'span',
            this.formatStr(
              p.row.conditions ? p.row.conditions[0] : [],
              'balanceAmount'
            )
          ),
      },
      {
        title: this.$lang('30日币币交易额'),
        align: 'center',
        minWidth: 100,
        render: (h, p) =>
          h(
            'span',
            this.formatStr(
              p.row.conditions ? p.row.conditions[0] : [],
              '30dSpotTradeAmountBtc'
            )
          ),
      },
    ]

    let futures = [
      {
        title: this.$lang('持币量'),
        align: 'center',
        minWidth: 100,
        render: (h, p) =>
          h(
            'span',
            this.formatStr(
              p.row.conditions && p.row.conditions[1]
                ? p.row.conditions[1]
                : [],
              'balanceAmount'
            )
          ),
      },
      {
        title: this.$lang('30日合约交易额'),
        align: 'center',
        minWidth: 100,
        render: (h, p) =>
          h(
            'span',
            this.formatStr(
              p.row.conditions && p.row.conditions[1]
                ? p.row.conditions[1]
                : [],
              '30dContractTradeAmountBtc'
            )
          ),
      },
    ]

    let all = [
      {
        title: this.$lang('晋级方式') + '①',
        align: 'center',
        minWidth: 100,
        children: [...exchange],
      },
      {
        title: this.$lang('晋级方式') + '②',
        align: 'center',
        minWidth: 100,
        children: [...futures],
      },
    ]

    let locale = this.locale

    let condition = [
      {
        title: this.$lang('无'),
        align: 'center',
        width: 0,
        render: (h) => h('span', '---'),
      },
    ]
    if (this.functions.exchange && this.functions.futures) {
      condition = all
    } else if (this.functions.futures) {
      condition = futures
    } else if (this.functions.exchange) {
      condition = exchange
    }

    let columns = [
      {
        title: this.$lang('ID'),
        minWidth: 80,
        key: 'levelConfigId',
      },
      {
        title: this.$lang('等级名称'),
        minWidth: 120,
        render: (h, p) => {
          if (p.row.localeDetail.length) {
            let ret = p.row.localeDetail.filter((el) => el.language == locale)
            if (ret[0]) {
              return h('span', ret[0].levelName)
            }
          }
        },
      },
      {
        title: this.$lang('图标'),
        minWidth: 80,
        align: 'center',
        render: (h, params) => {
          return h('img', {
            attrs: {
              src: params.row.levelIcon,
              width: 40,
            },
          })
        },
      },
      {
        title: this.$lang('等级条件'),
        minWidth: 250,
        align: 'center',
        children: condition,
      },
      {
        title: this.$lang('币币折扣'),
        minWidth: 130,
        align: 'center',
        children: [
          {
            title: 'Maker',
            align: 'center',
            minWidth: 80,
            render: (h, p) => h('span', p.row.spotBuyMakerDiscount + '%'),
          },
          {
            title: 'Taker',
            align: 'center',
            minWidth: 80,
            render: (h, p) => h('span', p.row.spotBuyTakerDiscount + '%'),
          },
        ],
      },
      {
        title: this.$lang('合约折扣'),
        width: 130,
        align: 'center',
        children: [
          {
            title: 'Maker',
            align: 'center',
            minWidth: 80,
            render: (h, p) => h('span', p.row.contractBuyMakerDiscount + '%'),
          },
          {
            title: 'Taker',
            align: 'center',
            minWidth: 80,
            render: (h, p) => h('span', p.row.contractBuyTakerDiscount + '%'),
          },
        ],
      },
      {
        title: this.$lang('邀请返佣'),
        width: 100,
        key: 'inviteBonusStatus',
        align: 'center',
        render: (h, p) => {
          return h(
            'Tag',
            {
              attrs: {
                color: p.row.inviteBonusStatus ? 'success' : 'error',
              },
            },
            p.row.inviteBonusStatus ? this.$lang('是') : this.$lang('否')
          )
        },
      },
      {
        title: this.$lang('操作'),
        fixed: 'right',
        align: 'center',
        slot: 'action',
        minWidth: 120,
      },
    ]
    this.columns = columns
  },
  created() {
    this.loadData()
  },
}
</script>
