<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="6")
      Button(:type="searchForm.timeUnit==='H'?'primary':'default'" long icon="md-checkmark-circle-outline" @click="last24H") {{$lang('最近24小时')}}
    Col(span="6")
      DatePicker(type="daterange"  :options="dateRangeOptions", :editable="false" :placeholder="$lang('选择日期')"  format="yyyy-MM-dd" style="width:100%" v-model="tempDate", @on-change="changeDate" )
    Col(span="12")
      Select(@on-change="formDatas" v-model="token" filterable multiple :max-tag-count="7")
        Option(v-for="item in tokens" :value="item" :key="item") {{item}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable" :max-height="height-238")

</template>
<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['height', 'dateRangeOptions']),
  },
  data() {
    return {
      token: [],
      tokens: [],
      listData: [],
      lineChart: null,
      tempDate: [],
      loadingTable: true,
      searchForm: {
        group: 'balance.token.group',
        timeUnit: 'H',
        startTime: '',
        endTime: '',
      },
      formData: {},
      columns: [],
      sourceData: {},
    }
  },
  methods: {
    changeDate() {
      this.searchForm.timeUnit = 'd'
      this.loadData()
    },
    last24H() {
      this.tempDate = []
      this.searchForm.timeUnit = 'H'
      this.loadData()
    },

    formDatas() {
      //列表数据
      let tokens = []
      let columns = [
        {
          title: this.$lang('日期'),
          minWidth: 140,
          key: 'd',
          sortable: true,
          sortType: 'desc',
          render: (h, p) =>
            h(
              'span',
              this.searchForm.timeUnit == 'H'
                ? new Date(Number(p.row.d)).format('MM-dd hh:mm')
                : p.row.d
            ),
        },
      ]
      let json = this.sourceData[
        ['balance.token', this.searchForm.timeUnit].join('.')
      ]

      if (json) {
        Object.keys(json).forEach((el) => {
          if (el != 'ALL') {
            tokens.push(el)
          }
        })
      }

      this.token.forEach((el) => {
        columns.push({
          title: el,
          minWidth: 140,
          key: el,
          render: (h, p) =>
            h(
              'span',
              json[el][p.index].q ? json[el][p.index].q.cutFixed(2) * 1 : '---'
            ),
        })
      })

      this.columns = columns

      this.tokens = tokens
      if (!this.token.length) {
        tokens.forEach((el) => {
          if (
            [
              'BTC',
              'ETH',
              'USDT',
              'BCH',
              'LTC',
              'ETC',
              'EOS',
              'TRX',
              'XRP',
            ].indexOf(el) > -1
          ) {
            this.token.push(el)
          }
        })
      }

      this.listData = json[tokens[0]]
    },
    loadData() {
      this.token = []
      this.loadingTable = true
      this.sourceData = {}
      if (this.tempDate.length && this.tempDate[0] && this.tempDate[1]) {
        this.searchForm.startTime = new Date(this.tempDate[0]).format(
          'yyyy-MM-dd'
        )
        this.searchForm.endTime = new Date(this.tempDate[1]).format(
          'yyyy-MM-dd'
        )
      } else {
        this.searchForm.startTime = ''
        this.searchForm.endTime = ''
      }
      this.$axios
        .post('/api/v1/ods/token/balance', this.searchForm)
        .then((result) => {
          this.loadingTable = false

          if (result.code === 0 && result.data) {
            this.sourceData = Object.assign(this.sourceData, result.data)
            this.formDatas()
          }
        })
    },
  },
  created() {
    this.loadData()
  },
}
</script>
