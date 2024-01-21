<template lang="pug">
	.page-exchange
		Table(:columns="columns", :data="listData", :loading="loading")
			template(slot-scope="{ row, index }" slot="action")
				a(@click.prevent="detail(row)") {{$lang('详情')}}
		Row(:gutter="20" style="padding-top:30px")
			Col(span="10")
				ButtonGroup
					Button(@click="getFirstData" :disabled="searchForm.toTime===''" icon="ios-skip-backward")
					Button(@click="getNextData" :disabled="listData.length<searchForm.limit" icon="ios-arrow-forward")
</template>


<script>
	import { thousandFormatNumber } from '@/libs/common.js'

	export default {
		data () {
			return {
				datetime: '',
				searchForm: {
					toTime: 0,
					limit: 20,
				},
				columns: [{
					title: this.$lang('日期'),
					minWidth: 100,
					key: 'date',
					render: (h, params) => {
						return h('span', this.newDate(params.row.date).format('yyyy-MM-dd'))
					}
				}, {
					title: this.$lang('平均风险度'),
					minWidth: 120,
					key: 'averageSafety',
					render: (h, params) => {
						return h('span', params.row.averageSafety + '%')
					}
				}, {
					title: `${this.$lang('借贷市值')}(USDT)`,
					minWidth: 180,
					key: 'usdtLoanValue',
					render: (h, { row }) => {
						return h('span', thousandFormatNumber(row.usdtLoanValue, 2))
					}

				}, {
					title: `${this.$lang('总市值')}(USDT)`,
					minWidth: 180,
					key: 'usdtAllValue',
					render: (h, { row }) => {
						return h('span', thousandFormatNumber(row.usdtAllValue, 2))
					}
				}, {
					title: this.$lang('用户数'),
					minWidth: 120,
					key: 'userNum'
				}, {
					title: this.$lang('借贷中人数'),
					minWidth: 80,
					key: 'loanUserNum'
				}, {
					title: this.$lang('借贷中笔数'),
					minWidth: 80,
					key: 'loanOrderNum'
				}, {
					title: this.$lang('当日借贷笔数'),
					minWidth: 80,
					key: 'todayLoanOrderNum'
				}, {
					title: this.$lang('当日借贷人数'),
					minWidth: 80,
					key: 'todayLoanUserNum'
				}
				],
				listData: [],
				loading: true,
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
				this.$axios.get('/api/v1/margin/rpt/daily_statistics', {
					params: {
						limit: this.searchForm.limit,
						toTime: this.searchForm.toTime,
					},
				}).then(ret => {
					this.loading = false
					this.listData = ret.data
				}).catch(() => {
					this.loading = false
				})
			},
			getNextData () {
				this.searchForm.toTime = this.listData[this.listData.length - 1].date
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
