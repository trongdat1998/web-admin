<template lang="pug">
.page-exchange
  Row.search(:gutter="20")
    Col(:span="4")
      Select(v-model="searchForm.index" filterable @on-change="changeIndex")
        Option(value="1") {{$lang("交易次数")}}-{{$lang("按用户")}}
        Option(value="2") {{$lang("交易次数")}}-{{$lang("按币对")}}
        Option(value="3") {{$lang("交易数量")}}-{{$lang("按币对")}}
    Col(:span="4")
      Select(v-model="searchForm.tradeType" filterable @on-change="changeTradeType")
        Option(:value="key" v-for="item,key in types" :key="key") {{$lang(item)}}
    Col(:span="4" v-show="searchForm.index==2||searchForm.index==3")
      Select(v-model="searchForm.symbolId" filterable @on-change="change()")
        Option(v-for="item in symbols[searchForm.tradeType]" :value="item.symbolId" :key="item.symbolId") {{item.symbolName}}
    Col(:span="6")
      DatePicker(type="daterange"  ,:options="dateRangeOptions", :editable="false" ,:placeholder="$lang('选择日期')"  format="yyyy-MM-dd" style="width:100%" v-model="tempDate", @on-change="change")
    Col(span="4")
      Button(:type="searchForm.timeUnit==='allTime'?'primary':'default'" long icon="md-checkmark-circle-outline" @click="allDate") {{$lang('全部时间')}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable")
  div(style="padding-top:30px")
  ButtonGroup(v-if='searchForm.index==2||searchForm.index==3')
    Button(icon="md-skip-backward" @click="first"  :disabled="!searchForm.lastIndex")
    Button(icon="ios-arrow-forward" @click="next"  :disabled="listData.length<searchForm.pageSize")
</template>
<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['tokens', 'dateOptions', 'dateRangeOptions']),
  },
  data() {
    return {
      listData: [],
      loadingTable: true,
      maps: {},
      baseMaps: {},
      urls: {
        1: '/api/v1/ods/top_data/dwTopTradeNumAccountSum',
        2: '/api/v1/ods/top_data/dwTopTradeNumSymbol',
        3: '/api/v1/ods/top_data/dwTopTradeQuantitySymbol',
      },
      types: {
        1: '币币',
        3: '合约',
        100: '法币',
      },
      symbols: {
        1: [],
        3: [],
        4: [],
        100: [],
      },
      tempDate: [],
      searchForm: {
        tradeType: '1',
        pageSize: 100,
        lastIndex: 0,
        symbolId: 'USDT',
        index: '1',
        startDate: '',
        endDate: '',
        timeUnit: '',
      },
      bakColumns: [
        {
          title: '#',
          type: 'index',
          minWidth: 140,
        },

        {
          title: 'accountId',
          minWidth: 200,
          key: 'accountId',
          render: (h, params) =>
            h('Account', {
              props: {
                id: params.row.accountId,
              },
            }),
        },
      ],
      columns: [],
      map: {},
      sourceData: {},
    }
  },
  methods: {
    next() {
      this.searchForm.lastIndex = this.listData[this.listData.length - 1].index
      this.loadData()
    },
    first() {
      this.searchForm.lastIndex = 0
      this.loadData()
    },
    changeIndex() {
      if (this.searchForm.index != 3) {
        this.columns = [
          ...this.bakColumns,
          {
            title: this.$lang('买入次数'),
            minWidth: 100,
            key: 'buyNum',
          },
          {
            title: this.$lang('卖出次数'),
            minWidth: 100,
            key: 'sellNum',
          },
          {
            title: this.$lang('交易次数'),
            minWidth: 100,
            key: 'usdtAmount',
            render: (h, params) =>
              h('span', Number(params.row.sellNum) + Number(params.row.buyNum)),
          },
        ]
      } else {
        this.columns = [
          ...this.bakColumns,
          {
            title: this.$lang('币种'),
            minWidth: 140,
            key: 'tokenId',
            render: (h) => {
              if (this.searchForm.tradeType == 1) {
                return h('span', this.baseMaps[this.searchForm.symbolId])
              }
              return h('span', this.maps[this.searchForm.symbolId])
            },
          },
          {
            title: this.$lang('买入数量'),
            minWidth: 140,
            key: 'buyQuantity',
          },
          {
            title: this.$lang('卖出数量'),
            minWidth: 140,
            key: 'sellQuantity',
          },
          {
            title: this.$lang('交易数量'),
            minWidth: 140,
            key: 'usdtAmount',
            render: (h, params) =>
              h(
                'span',
                (
                  Number(params.row.sellQuantity) +
                  Number(params.row.buyQuantity)
                ).cutFixed(2)
              ),
          },
        ]
      }

      this.changeTradeType()
    },

    changeTradeType() {
      this.searchForm.symbolId = this.symbols[this.searchForm.tradeType].length
        ? this.symbols[this.searchForm.tradeType][0].symbolId
        : ''
      this.change()
    },
    change() {
      //      if (date) {
      //        this.searchForm.date = date;
      //      }
      this.searchForm.lastIndex = 0
      this.searchForm.timeUnit = ''
      this.loadData()
    },
    allDate() {
      this.tempDate = ['', '']
      this.searchForm.timeUnit = 'allTime'
      this.loadData()
    },
    loadData() {
      this.loadingTable = true
      if (this.tempDate.length && this.tempDate[0] && this.tempDate[1]) {
        this.searchForm.startDate = new Date(this.tempDate[0]).format(
          'yyyy-MM-dd'
        )
        this.searchForm.endDate = new Date(this.tempDate[1]).format(
          'yyyy-MM-dd'
        )
      } else {
        this.searchForm.startDate = ''
        this.searchForm.endDate = ''
      }
      this.$axios
        .post(this.urls[this.searchForm.index], this.searchForm)
        .then((result) => {
          this.loadingTable = false
          this.listData = result.data
        })
    },
    /**
     * type: 1 - 币币
     */
    getSymbol(type) {
      this.$axios
        .post('/api/v1/symbol/query', {
          category: type,
          current: 1,
          pageSize: 1000,
        })
        .then((result) => {
          if (result.code == 0 && result.data.list.length) {
            let symbolsType = 1
            if (type === 3) {
              symbolsType = 2
            } else if (type === 4) {
              symbolsType = 3
            }
            this.symbols[symbolsType] = result.data.list
            result.data.list.forEach((el) => {
              this.maps[el.symbolId] = el.quoteTokenId
              this.baseMaps[el.symbolId] = el.baseTokenId
            })
          }
        })
    },
  },
  created() {
    this.$axios.post('/api/v1/otc/config/otc_tokens').then((result) => {
      if (result.code == 0) {
        this.symbols[100] = result.data.map((el) => {
          this.maps[el] = el
          return { symbolId: el, symbolName: el }
        })
      }
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      end.setTime(end.getTime() - 3600 * 1000 * 24)
      this.tempDate = [start, end]
      this.changeIndex()
    })
    ;[1, 3, 4].forEach((el) => this.getSymbol(el))
  },
}
</script>
