<template lang="pug">
div
  ButtonGroup
    Button(v-for="item in accounts" :type="accountId==item.accountId?'primary':'default'" @click="getData(item.accountId)" :key="item.accountId") {{type[item.accountType]}}
      template(v-if="item.index") ({{$lang('子账户')}}:{{item.accountName}})
  Divider
  Alert
    Checkbox(v-model="hide") {{$lang('隐藏资产为0的币种')}}。
    | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    | AccountId :
    template(v-for="item in accounts" v-if="accountId==item.accountId") {{item.accountId}}
      template(v-if="item.index") ({{$lang('子账户')}} : {{item.accountName}})
  Table(:columns="columns", :data="listDataFilter" :loading="loading")
</template>
<script>
export default {
  props: {
    searchForm: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  computed: {
    listDataFilter() {
      if (this.hide) {
        return this.listData.filter((el) => el.available > 0 || el.locked > 0)
      } else {
        return this.listData
      }
    },
  },
  methods: {
    getData(accountId) {
      this.accountId = accountId
      this.load()
    },
    load() {
      this.loading = true
      this.$axios
        .post(
          '/api/v1/brokeruser/get_sub_user_asset',
          Object.assign({ accountId: this.accountId }, this.searchForm)
        )
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.listData = result.data
          }
        })
    },
  },
  data() {
    return {
      loading: false,
      hide: true,
      accountId: '',
      listData: [],
      accounts: [],
      type: {
        1: this.$lang('钱包账户'),
        3: this.$lang('合约账户'),
        27: this.$lang('杠杆账户'),
      },
      columns: [
        {
          title: this.$lang('币种'),
          minWidth: 160,
          key: 'tokenId',
        },
        {
          title: this.$lang('全称'),
          minWidth: 160,
          key: 'tokenFullName',
        },
        {
          title: this.$lang('可用'),
          minWidth: 160,
          key: 'available',
        },
        {
          title: this.$lang('冻结'),
          minWidth: 160,
          key: 'locked',
        },
        {
          title: this.$lang('操作'),
          minWidth: 160,
          render: (h, params) => {
            if (params.row.locked > 0) {
              return h(
                'a',
                {
                  attrs: {
                    href: '/user/lock/' + this.searchForm.userId,
                    target: '_blank',
                  },
                },
                this.$lang('解锁')
              )
            } else {
              return h('span', '----')
            }
          },
        },
      ],
    }
  },
  created() {
    this.loading = true

    this.$axios
      .post('/api/v1/brokeruser/get_sub_users', this.searchForm)
      .then((result) => {
        if (result.code == 0) {
          this.accounts = result.data
          this.accountId = result.data[0].accountId
          this.load()
        }
      })
  },
}
</script>
