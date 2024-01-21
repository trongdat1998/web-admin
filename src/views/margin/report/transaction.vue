<template lang="pug">
	.page-exchange
		Table(:columns="columns", :data="listData", :loading="loading", style="minWidth:100%")
			template(slot-scope="{ row, index }" slot="action")
				a(@click.prevent="detail(row)") {{$lang('详情')}}
		Row(:gutter="20" style="padding-top:30px")
			Col(span="10")
				ButtonGroup
					Button(@click="getFirstData" :disabled="searchForm.toTime===''" icon="ios-skip-backward")
					Button(@click="getNextData" :disabled="listData.length<searchForm.limit" icon="ios-arrow-forward")
</template>

<script>
  import TransactionDetail from './transaction-detail'
  import { thousandFormatNumber } from "@/libs/common.js";

  export default {
    components: {
      TransactionDetail,
    },
    data () {
      return {
        loading: true,
        datetime: '',
        searchForm: {
          limit: 20,
          toTime: 0,
        },
        columns: [{
          type: 'expand',
          minWidth: 50,
          render: (h, params) => {
            return h(TransactionDetail, { props: { rid: params.row.id } })
          }
        }, {
          title: this.$lang('日期'),
          minWidth: 100,
          key: 'createTime',
          render: (h, params) => {
            return h('span', new newDate(params.row.createTime).format('yyyy-MM-dd'))
          }
        }, {
          title: this.$lang('交易人数'),
          minWidth: 100,
          key: 'tradePeopleNum'

        }, {
          title: this.$lang('买入人数'),
          minWidth: 100,
          key: 'buyPeopleNum'

        }, {
          title: this.$lang('卖出人数'),
          minWidth: 100,
          key: 'sellPeopleNum'

        }, {
          title: this.$lang('交易总笔数'),
          minWidth: 100,
          key: 'tradeNum'

        }, {
          title: this.$lang('买入笔数'),
          minWidth: 100,
          key: 'buyTradeNum'

        }, {
          title: this.$lang('卖出笔数'),
          minWidth: 100,
          key: 'sellTradeNum'

        }, {
          title: `${this.$lang('手续费折合')}(USDT)`,
          minWidth: 120,
          key: 'fee',
          render: (h, { row }) => {
            return h('span', thousandFormatNumber(row.fee, 2));
          }

        }, {
          title: `${this.$lang('交易额折合')}(USDT)`,
          minWidth: 120,
          key: 'amount',
          render: (h, { row }) => {
            return h('span', thousandFormatNumber(row.amount, 2));
          }
        }],
        listData: [],
      }
    },
    mounted () {
      this.queryData()
    },
    methods: {
      onChangeDate () {
        if (this.datetime) {
          this.searchForm.toTime = new Date(
            new Date(this.datetime.format('yyyy-MM-dd')).toGMTString()
          ).getTime()
        }
      },
      queryData () {
        this.loading = true
        this.$axios.get('/api/v1/margin/rpt/margin_trade', {
          params: {
            toTime: this.searchForm.toTime,
            limit: this.searchForm.limit,
          }
        }).then(ret => {
          this.loading = false
          if (ret.code == 0) {
            this.listData = ret.data
          }
        })
      },
      getNextData () {
        this.searchForm.toTime = this.listData[this.listData.length - 1].createTime
        this.queryData()
      },
      getFirstData () {
        this.searchForm.toTime = 0
        this.queryData()
      }
    }
  }
</script>
<style lang="less">

</style>
