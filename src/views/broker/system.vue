<template lang="pug">
Main.page-exchange
  Row(:gutter="20")
    Col(v-for="item,key in types" :key="item" span="6")
      template(v-if="keys[key]")
        Card(:title="item" style="margin:0 0 30px" v-if="functions[keys[key]]")
          iSwitch(:disabled="isRead" size="small" v-model="groups[key]" true-value="true" false-value="false"  @on-change="editConfig(key)" :loading="loading || nextForm.key===key")
      template(v-else)
        Card(:title="item" style="margin:0 0 30px")
          iSwitch(:disabled="isRead" size="small" v-model="groups[key]" true-value="true" false-value="false"  @on-change="editConfig(key)" :loading="loading || nextForm.key===key")
  Modal(v-model="removeWin" :title="$lang('您确定要执行此操作吗？')" width="300" @on-cancel="nextForm.key = ''")
    p {{$lang(nextForm.value==="true"?"开启":"禁用")}}{{types[nextForm.key]}}
    Button(slot="footer" long type="error" @click="doNext" :loading="loading" :disabled="loading") {{$lang('确定')}}
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      removeWin: false,
      nextForm: {
        group: 'site.control.switch',
        value: 'false',
        key: '',
      },
      loading: false,
      types: {
        'stop.register': this.$lang('全站禁止注册'),
        'stop.login': this.$lang('全站禁止登录'),
        'stop.coin.trade': this.$lang('全站禁止币币交易'),
        'stop.otc.trade': this.$lang('全站禁止法币交易'),
        'stop.future.trade': this.$lang('全站禁止合约交易'),
        'stop.withdraw': this.$lang('全站禁止提现'),
        'force.audit.withdraw': this.$lang('全站提现转人工审核'),
        'stop.api.coin.trade': this.$lang('禁止币币API交易'),
        'stop.api.future.trade': this.$lang('禁止合约API交易'),
        'open.kyc.age.check': this.$lang('开启KYC年龄校验'),
      },
      groups: {
        'stop.register': 'false',
        'stop.login': 'false',
        'stop.coin.trade': 'false',
        'stop.otc.trade': 'false',
        'stop.future.trade': 'false',
        'stop.withdraw': 'false',
        'force.audit.withdraw': 'false',
        'stop.api.coin.trade': 'false',
        'stop.api.future.trade': 'false',
        'open.kyc.age.check': 'false',
      },
      keys: {
        'stop.coin.trade': 'exchange',
        'stop.otc.trade': 'otc',
        'stop.future.trade': 'futures',
        'stop.api.coin.trade': 'exchange',
        'stop.api.future.trade': 'futures',
      },
    }
  },
  computed: {
    ...mapState(['functions', 'isRead']),
  },
  methods: {
    editConfig(key) {
      this.removeWin = true
      this.nextForm.key = key
      this.nextForm.value = this.groups[key]
      setTimeout(() => {
        this.groups[key] = this.groups[key] === 'false' ? 'true' : 'false'
      }, 10)
    },
    doNext() {
      this.loading = true
      this.$axios
        .post('/api/v1/broker/config/common_config/edit_config', this.nextForm)
        .then((result) => {
          this.loading = false
          this.nextForm.key = ''
          if (result.code == 0) {
            this.removeWin = false
            this.loadData()
          }
        })
    },
    loadData() {
      this.loading = true
      this.$axios
        .post('/api/v1/broker/config/common_config/get_group_configs', {
          group: 'site.control.switch',
        })
        .then((result) => {
          if (result.code == 0) {
            this.loading = false
            result.data.forEach((el) => {
              this.groups[el.key] = el.value
            })
          }
        })
    },
  },
  created() {
    this.loadData()
  },
}
</script>
