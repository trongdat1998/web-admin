<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="6")
      Button(:type="searchForm.timeUnit==='H'?'primary':'default'" long icon="md-checkmark-circle-outline" @click="last24H") {{$lang('最近24小时')}}
    Col(span="6")
      DatePicker(type="daterange"  :options="dateRangeOptions", :editable="false" :placeholder="$lang('选择日期')"  format="yyyy-MM-dd" style="width:100%" v-model="tempDate", @on-change="changeDate")
    Col(span="6")
      Select(@on-change="changeType" v-model="type")
        Option(value="trade.1.symbol") {{$lang('币币交易')}}
        Option(value="trade.4.symbol") {{$lang('合约交易')}}
    Col(span="6")
      Select(@on-change="formDatas" v-model="token" filterable)
        Option(value="ALL") {{$lang('全部')}}
        Option(v-for="item in tokens" :value="item" :key="item") {{item}}
  Row(:gutter="15")
    Col(style="position: relative;" span="24")
      canvas(id="myChart" height="80")
  Table(:columns="columns", :data="listData" , :loading="loadingTable")

</template>
<script>
import Chart from 'chart.js'
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['backgroundColor', 'borderColor', 'dateRangeOptions']),
  },
  data() {
    return {
      type: 'trade.1.symbol',
      token: 'ALL',

      tokens: [],
      listData: [],

      lineChart: null,
      tempDate: [],
      loadingTable: true,
      searchForm: {
        group: 'trade.symbol.group',
        timeUnit: 'H',
        startTime: '',
        endTime: '',
      },
      formData: {},
      columns: [
        {
          title: this.$lang('日期'),
          minWidth: 140,
          key: 'd',
        },
        {
          title: this.$lang('交易人数'),
          minWidth: 140,
          key: 'uc',
          chart: true,
        },
        {
          title: this.$lang('买入人数'),
          minWidth: 140,
          key: 'buc',
        },
        {
          title: this.$lang('卖出人数'),
          minWidth: 140,
          key: 'suc',
        },
        {
          title: this.$lang('交易总笔数'),
          minWidth: 140,
          key: 'no',
          chart: true,
        },
        {
          title: this.$lang('买入笔数'),
          minWidth: 140,
          key: 'bno',
        },
        {
          title: this.$lang('卖出笔数'),
          minWidth: 140,
          key: 'sno',
        },
        {
          title: this.$lang('交易量(前币种)'),
          minWidth: 140,
          key: 'bq',
          chart: true,
          render: (h, params) =>
            h(
              'span',
              this.token === 'ALL' ? '---' : params.row.bq.cutFixed(2) * 1
            ),
        },
        {
          title: this.$lang('交易额(后币种)'),
          minWidth: 140,
          key: 'qq',
          chart: true,
          render: (h, params) =>
            h(
              'span',
              this.token === 'ALL' ? '---' : params.row.qq.cutFixed(2) * 1
            ),
        },
        {
          title: this.$lang('折合交易量') + 'USDT',
          minWidth: 140,
          render: (h, params) =>
            h(
              'span',
              this.token === 'ALL' ? '---' : params.row.bu.cutFixed(2) * 1
            ),
        },
        {
          title: this.$lang('折合交易额') + 'USDT',
          minWidth: 140,
          key: 'qu',
          chart: true,
          render: (h, params) => h('span', params.row.qu.cutFixed(2) * 1),
        },
      ],
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
    changeType() {
      this.token = 'ALL'
      this.formDatas()
    },
    renderLine(labels, data) {
      let config = {
        type: 'line',
        data: {
          labels: labels,
          datasets: data,
        },
        options: {
          responsive: true,
          tooltips: {
            mode: 'index',
            intersect: false,
          },
          hover: {
            mode: 'nearest',
            intersect: true,
          },
          scales: {
            yAxes: [
              {
                type: 'linear',
                display: true,
                position: 'left',
                id: 'y-axis-1',
                ticks: {
                  beginAtZero: true,
                },
              },
              {
                type: 'linear',
                display: true,
                position: 'right',
                id: 'y-axis-2',

                // grid line settings
                gridLines: {
                  drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      }
      if (this.lineChart) {
        this.lineChart.config = config
        this.lineChart.update()
      } else {
        this.lineChart = new Chart(
          document.getElementById('myChart').getContext('2d'),
          config
        )
      }
    },

    formDatas() {
      //列表数据
      let tokens = []
      let listData = []
      let json = this.sourceData[
        [this.type, this.searchForm.timeUnit].join('.')
      ]

      //绘图数据

      let labels = []
      let data = []
      let index = 0

      this.columns.forEach((el) => {
        if (el.chart) {
          let tmp = {}

          // 全部下使用折合数量
          if (this.token === 'ALL' && el.key !== 'qq' && el.key !== 'bq') {
            Object.assign(tmp, el)

            // 非全部下使用交易数量
          } else if (
            this.token !== 'ALL' &&
            el.key !== 'bu' &&
            el.key !== 'qu'
          ) {
            Object.assign(tmp, el)
          }

          if (tmp.title) {
            data.push({
              label: tmp.title,
              borderColor: this.borderColor[
                index % this.backgroundColor.length
              ],
              data: [],
              fill: false,
              key: tmp.key,
              yAxisID:
                tmp.key === 'no' || tmp.key === 'uc' ? 'y-axis-1' : 'y-axis-2',
            })
            index++
          }
        }
      })

      if (json) {
        Object.keys(json).forEach((el) => {
          if (el != 'ALL') {
            tokens.push(el)
          }
        })
      }

      if (json && json[this.token]) {
        //表格数据
        json[this.token].forEach((el) => {
          let tmp = Object.assign(
            {
              bbq: '0', // 买入前币对数量
              bbu: '0', // 买入前币对折合USDT数量
              bno: 0, // 买入笔数
              bq: '0', //前币对笔数
              bqq: '0', //买入后币对数量
              bqu: '0', //买入后币对折合USDT数量
              bu: '0', //前币对USDT
              buc: 0, //买入人数
              d: '0', //日期
              no: 0, //买入/卖出总笔数
              qq: '0', //买入/卖出后币对数量
              qu: '0', //后币对USDT
              sbq: '0', // 卖出前币对数量
              sbu: '0', // 卖出前币对折合USDT数量
              sno: 0, // 卖出笔数
              sqq: '0', //卖出后币对数量
              squ: '0', //卖出后币对折合USDT数量
              suc: 0, //卖出人数
              uc: 0, //总人数
            },
            el,
            {
              d:
                this.searchForm.timeUnit == 'H'
                  ? new Date(Number(el.d)).format('hh:mm')
                  : el.d,
            }
          )
          listData.unshift(tmp)

          //绘图数据
          data.forEach((_el) => {
            _el.data.push(tmp[_el.key])
          })
          labels.push(tmp.d)
        })
      }

      this.tokens = tokens
      this.listData = listData

      this.renderLine(labels, data)
    },
    loadData() {
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
        .post('/api/v1/ods/symbol/trade', this.searchForm)
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
