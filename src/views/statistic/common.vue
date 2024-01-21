<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="6")
      Button(:type="searchForm.timeUnit==='H'?'primary':'default'" long icon="md-checkmark-circle-outline" @click="last24H") {{$lang('最近24小时')}}
    Col(span="6")
      DatePicker(type="daterange"  :options="dateRangeOptions", :editable="false" :placeholder="$lang('选择日期')"  format="yyyy-MM-dd" style="width:100%" v-model="tempDate", @on-change="changeDate")
  Row(:gutter="15")
    Col(style="position: relative;padding-bottom:15px" :span="key=='c' ? 24 : 12" v-for="item,key in boards" :key="key")
      Card(dis-hover :title="$lang(item.name)")
        canvas(:id="key" :height="key=='c' ? 75 : 150")
  
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
      boards: {
        a: {
          name: '用户数据',
          datasets: [],
          index: 0,
          lineChart: null,
        },

        b: {
          name: '充提数据',
          datasets: [],
          index: 0,
          lineChart: null,
        },
        c: {
          name: '交易数据',
          datasets: [],
          index: 0,
          lineChart: null,
        },
        // ,
        // d: {
        //   name: "费率数据",
        //   datasets: [],
        //   index: 0,
        //   lineChart: null
        // }
      },
      listData: [],
      tempDate: [
        new Date(new Date().getTime() - 14 * 86400000).format('yyyy-MM-dd'),
        new Date(new Date().getTime() - 86400000).format('yyyy-MM-dd'),
      ],
      loadingTable: true,
      searchForm: {
        group: 'user.group',
        timeUnit: 'd',
        startTime: '',
        endTime: '',
      },
      formData: {},
      columns: [
        {
          title: this.$lang('日期'),
          minWidth: 120,
          key: 'd',
        },
        {
          title: this.$lang('注册人数'),
          minWidth: 120,
          key: 'regNumber',
          chart: 'a',
        },
        {
          title: this.$lang('登录人数'),
          minWidth: 120,
          key: 'loginNumber',
          chart: 'a',
        },
        {
          title: this.$lang('KYC通过数'),
          minWidth: 120,
          key: 'kycNumber',
          chart: 'a',
        },
        {
          title: this.$lang('充值人数'),
          minWidth: 120,
          key: 'dNumber',
          chart: 'b',
        },
        {
          title: this.$lang('提现人数'),
          minWidth: 120,
          key: 'wNumber',
          chart: 'b',
        },

        {
          title: this.$lang('充值金额') + 'USDT',
          minWidth: 140,
          key: 'du',
          chart: 'b',
          render: (h, params) => h('span', params.row.du.cutFixed(2) * 1),
        },

        {
          title: this.$lang('提现金额') + 'USDT',
          minWidth: 140,
          key: 'wu',
          chart: 'b',
          render: (h, params) => h('span', params.row.wu.cutFixed(2) * 1),
        },
        {
          title: this.$lang('币币交易人数'),
          minWidth: 120,
          key: 't1Number',
          chart: 'c',
        },
        {
          title: this.$lang('合约交易人数'),
          minWidth: 120,
          key: 't4Number',
          chart: 'c',
        },
        {
          title: this.$lang('币币交易额') + 'USDT',
          minWidth: 140,
          key: 't1qu',
          chart: 'c',
          render: (h, params) => h('span', params.row.t1qu.cutFixed(2) * 1),
        },
        {
          title: this.$lang('合约交易额') + 'USDT',
          minWidth: 140,
          key: 't4qu',
          chart: 'c',
          render: (h, params) => h('span', params.row.t4qu.cutFixed(2) * 1),
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
    renderLine(labels, key) {
      let data = this.boards[key]
      let config = {
        type: 'line',
        data: {
          labels: labels,
          datasets: data.datasets,
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
                id: 'y-left',
                ticks: {
                  beginAtZero: true,
                },
              },
              {
                type: 'linear',
                display: true,
                position: 'right',
                id: 'y-right',

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
      if (data.lineChart) {
        data.lineChart.config = config
        data.lineChart.update()
      } else {
        data.lineChart = new Chart(
          document.getElementById(key).getContext('2d'),
          config
        )
      }
    },

    formDatas() {
      //列表数据
      let listData = []
      //绘图数据
      let labels = []

      Object.keys(this.boards).forEach((el) => {
        this.boards[el].index = 0
        this.boards[el].datasets = []
      })

      this.columns.forEach((el) => {
        if (el.chart) {
          let tmp = {}
          Object.assign(tmp, el)
          this.boards[el.chart].datasets.push({
            label: tmp.title,
            borderColor: this.borderColor[
              this.boards[el.chart].index % this.backgroundColor.length
            ],
            fill: false,
            data: [],
            key: tmp.key,
            yAxisID: /Number/.test(tmp.key) ? 'y-left' : 'y-right',
          })
          this.boards[el.chart].index++
        }
      })

      let loopData = this.sourceData['deposit.' + this.searchForm.timeUnit]
      if (loopData.length) {
        loopData.forEach((el, index) => {
          //表格数据组装
          let tmp = {
            d:
              this.searchForm.timeUnit == 'H'
                ? new Date(Number(el.d)).format('hh:mm')
                : new Date(el.d).format('MM/dd'),
          }

          let t1 = this.sourceData['trade.1.' + this.searchForm.timeUnit]
          if (t1 && t1[index]) {
            let w = t1[index]
            Object.assign(tmp, {
              t1qu: w.qu || '0',
              t1Number: w.uc || '0',
            })
          }

          let t3 = this.sourceData['trade.3.' + this.searchForm.timeUnit]
          if (t3 && t3[index]) {
            let w = t3[index]
            Object.assign(tmp, {
              t3qu: w.qu || '0',
              t3Number: w.uc || '0',
            })
          }

          let t4 = this.sourceData['trade.4.' + this.searchForm.timeUnit]
          if (t4 && t4[index]) {
            let w = t4[index]
            Object.assign(tmp, {
              t4qu: w.qu || '0',
              t4Number: w.uc || '0',
            })
          }

          let deposit = this.sourceData['deposit.' + this.searchForm.timeUnit]
          if (deposit && deposit[index]) {
            let w = deposit[index]
            Object.assign(tmp, {
              du: w.u || '0',
              dNumber: w.uc || '0',
            })
          }

          let withdrawal = this.sourceData[
            'withdrawal.' + this.searchForm.timeUnit
          ]
          if (withdrawal && withdrawal[index]) {
            let w = withdrawal[index]
            Object.assign(tmp, {
              wu: w.u || '0',
              wNumber: w.uc || '0',
            })
          }

          let register = this.sourceData['register.' + this.searchForm.timeUnit]
          if (register && register[index]) {
            tmp['regNumber'] = register[index].uc || 0
          }

          let login = this.sourceData['login.' + this.searchForm.timeUnit]
          if (login && login[index]) {
            tmp['loginNumber'] = login[index].uc || 0
          }

          let kyc = this.sourceData['kycpassed.' + this.searchForm.timeUnit]
          if (kyc && kyc[index]) {
            tmp['kycNumber'] = kyc[index].no || 0
          }

          listData.unshift(tmp)

          //绘图数据
          Object.keys(this.boards).forEach((_el) => {
            this.boards[_el].datasets.forEach((__el) => {
              __el.data.push(tmp[__el.key])
            })
          })
          labels.push(tmp.d)
        })
      }

      this.listData = listData

      Object.keys(this.boards).forEach((key) => {
        this.renderLine(labels, key)
      })
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
        .post('/api/v1/ods/common/userstat', this.searchForm)
        .then((result) => {
          this.loadingTable = false

          if (result.code === 0 && result.data) {
            Object.assign(this.sourceData, result.data)
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
