<template lang="pug">
	Main.page-exchange

		Row.monitor-header(:gutter="15")
			Col(span="4")
				Card(dis-hover)
					h2 {{$lang('平均风险度')}}
					p {{riskTotalData.averageSafety || '--'}}%
			Col(span="4")
				Card(dis-hover)
					h2 {{$lang('借贷市值/WU')}}
					p {{riskTotalData.loanValue | thousandFixed(2)}}
			Col(span="4")
				Card(dis-hover)
					h2 {{$lang('总市值/WU')}}
					p {{riskTotalData.allValue | thousandFixed(2)}}
			Col(span="3")
				Card(dis-hover)
					h2 {{$lang('用户数')}}
					p {{riskTotalData.userNum}}
			Col(span="3")
				Card(dis-hover)
					h2 {{$lang('借贷中人数')}}
					p {{riskTotalData.loanUserNum}}
			Col(span="3")
				Card(dis-hover)
					h2 {{$lang('借贷笔数')}}
					p {{riskTotalData.loanOrderNum}}
			Col(span="3")
				Card(dis-hover)
					h2 {{$lang('当日借贷笔数')}}
					p {{riskTotalData.todayLoanOrderNum}}
			Spin(size="large", v-if="loadingRiskTotal", fix)

		div(:class="monitorStatusClass")
			span {{monitorStatusStr}}
		coin-pool(:show-type="2")
		div.safe
			Card.card(dis-hover)
				p(slot="title") {{$lang('用户安全度')}}
				Button(icon="ios-search", slot="extra", type="text",style="color:#2D8CF0", @click="showModal")  {{$lang('用户详情查询')}}
				Button(slot="extra", type="text",style="color:#2D8CF0", @click="showForceRecordModal")  {{$lang('强平记录查询')}}
				Alert
					CheckboxGroup(v-model="checkboxOptions" @on-change="changeBox")
						Checkbox(label="warning")
							span {{$lang('预警')}}({{statisticsData.warnNum}})
							span.tag-warning &nbsp;
						Checkbox(label="append")
							span {{$lang('追加')}}({{statisticsData.appendNum}})
							span.tag-append &nbsp;
						Checkbox(label="close")
							span {{$lang('平仓')}}({{statisticsData.closeNum}})
							span.tag-close &nbsp;
				Table(:row-class-name="riskRowClassName", :disabled-hover="true", :columns="riskColumns", :data="riskData", :loading="loadingRiskTable", height="580")
					template(slot-scope="{row, index}" slot="action")
						Button( :disabled="isRead" v-if="row.borrowed != 0",type="error" size="small" ghost, @click="tipHandle(row)") {{$lang('强平')}}

		Modal(v-model="closeWin" :title="$lang('')" width="300")
			h3 {{$lang('您确定要执行强平操作吗？')}}
			Button(slot="footer" long type="error" @click="doHandle" :loading="forceCloseLoading" :disabled="forceCloseLoading") {{$lang('确定')}}

		Modal(v-model="detailShow" :scrollable="true" title="用户详情查询",:footer-hide="true" width="90")
			Row.search(:gutter="15")
				Col(span="8")
					Input(v-model="searchForm.userId" placeholder="UserID")
				Col(span="8")
					Input(v-model="searchForm.accountId", placeholder="AccountID")
				Col(span="8")
					Button(type="primary" @click="loadDeatilData" icon="md-search") {{$lang('搜索')}}
			div
				Tabs(:value="detailTab" style="margin-top:12px")
					TabPane(:label="$lang('借贷记录')" name="tab1")
						Table(:columns="borrowRecordColumns", :data="borrowRecordData", :loading="loadingDetailTable")
						ButtonGroup(style="padding-top:30px")
							Button(@click="getFirstBorrowData" :disabled="searchForm.fromLoanId===''" icon="ios-skip-backward")
							Button(@click="getNextBorrowData" :disabled="borrowRecordData.length<searchForm.limit" icon="ios-arrow-forward")
					TabPane(:label="$lang('还币记录')" name="tab2")
						Table(:columns="repayRecordColumns", :data="repayRecordData", :loading="loadingDetailTable")
						ButtonGroup(style="padding-top:30px")
							Button(@click="getFirstRecordData" :disabled="searchForm.fromRepayId===''" icon="ios-skip-backward")
							Button(@click="getNextRecordData" :disabled="repayRecordData.length<searchForm.limit" icon="ios-arrow-forward")
				Tabs(:value="detailTab" style="margin-top:12px;margin-bottom:48px")
					TabPane(:label="$lang('持仓记录')" name="tab1")
						Table(:columns="positionRecordColumns", :data="positionRecordData", :loading="loadingDetailTable")

		Modal(v-model="forceRecordWin" :scrollable="true" :title="$lang('强平记录查询')",:footer-hide="true" width="90")
			Row.search(:gutter="15")
				Col(span="6")
					DatePicker(type="datetimerange" format="yyyy-MM-dd HH:mm" style="width:100%" v-model="tempDate", :placeholder="$lang('时间')")
				Col(span="6")
					Input(v-model="forceForm.userId" placeholder="UserID")
				Col(span="6")
					Input(v-model="forceForm.accountId", placeholder="AccountID")
				Col(span="6")
					Button(type="primary" @click="forceRecord" icon="md-search") {{$lang('搜索')}}
				Col(span="24" style="margin-top:24px")
					Table(:columns="forceRecordColumns", :data="forceRecordData", :loading="loadingForceRecord")
					ButtonGroup(style="padding-top:30px")
						Button(@click="getFirstData" :disabled="forceForm.fromId===''" icon="ios-skip-backward")
						Button(@click="getNextData" :disabled="forceRecordData.length<forceForm.limit" icon="ios-arrow-forward")
</template>
<script>
  import { mapState } from 'vuex'

  // 当前币池
  import CoinPool from './coinPool';

  export default {
    components: {
      CoinPool,
    },
    computed: {
      ...mapState(['isRead']),
      monitorStatusClass () {
        const { warnNum, appendNum, closeNum } = this.statisticsData
        return [
          'monitor-status',
          {
            safety: warnNum <= 0 && appendNum <= 0 && closeNum <= 0,
            warning: warnNum > 0 && appendNum <= 0 && closeNum <= 0,
            serious: appendNum > 0 && closeNum <= 0,
            danger: closeNum > 0,
          },
        ]
      },
      monitorStatusStr () {
        const { warnNum, appendNum, closeNum } = this.statisticsData
        if (closeNum > 0) {
          return `${this.$t('有强平')}(${closeNum || 0 })`;
        }
        if (appendNum > 0) {
          return `${this.$t('有追加')}(${appendNum || 0 })`;
        }
        if (warnNum > 0) {
          return `${this.$t('有预警')}(${warnNum || 0})`
        }
        return this.$t('正常')
      },
    },
    data () {
      return {
        loading: true,
        tempDate: [],
        closeWin: false,
        currentRow: null,
        statisticsData: {
          warnNum: '', // 预警数量
          appendNum: '', // 追加数量
          closeNum: '', // 平仓数量
        },
        riskTotalData: {},
        lineData: {
          withdrawLine: '',
          warnLine: '',
          appendLine: '',
          stopLine: '',
        },
        checkboxOptions: [],
        detailTab: 'tab1',
        searchForm: {
          userId: '',
          accountId: '',
          fromLoanId: '',
          fromRepayId: '',
          fromOrderId: '',
          limit: 10,
        },
        forceForm: {
          userId: '',
          accountId: '',
          fromId: '',
          limit: 10,
        },
        detailShow: false,
        forceRecordWin: false,
        poolData: [],
        riskAllData: [],
        riskData: [],
        recordData: [],
        borrowRecordData: [],
        positionRecordData: [],
        repayRecordData: [],
        closeRecordData: [],
        forceRecordData: [],
        forceCloseLoading: false,
        loadingRiskTotal: false,
        loadingPoolTable: false,
        loadingRiskTable: false,
        loadingRecordTable: false,
        loadingDetailTable: false,
        loadingForceRecord: false,

        riskColumns: [
          {
            title: 'UserId',
            key: 'userId',
            minWidth: 170,
            render: (h, params) =>
              h('User', {
                props: {
                  uid: params.row.userId,
                },
              }),
          },
          {
            title: 'AccountId',
            key: 'accountId',
            minWidth: 170,
          },
          {
            title: this.$lang('已借资产(BTC)'),
            key: 'borrowed',
            render: (h, params) => h('span', params.row.borrowed.cutFixed(8)),
            minWidth: 150,
          },
          {
            title: this.$lang('总资产(BTC)'),
            key: 'total',
            render: (h, params) => h('span', params.row.total.cutFixed(8)),
            minWidth: 150,
          },
          {
            title: this.$lang('安全度%'),
            key: 'safety',
            minWidth: 150,
          },
          {
            title: this.$lang('操作'),
            slot: 'action',
            minWidth: 100,
            fixed: 'right',
            align: 'center',
          },
        ],
        // recordColumns: [
        //   {
        //     title: this.$lang("用户ID"),
        //     key:"accountName",
        //   },
        //   {
        //     title: this.$lang("操作时间"),
        //     key:"accountId",
        //     render: (h, params) =>
        //       h("span", this.newDate(params.row.updated).format())
        //   },
        //   {
        //     title: this.$lang("操作类型"),
        //     key:"accountName",
        //   },
        //   {
        //     title: this.$lang("操作描述"),
        //     key:"accountId",
        //   },
        // ],
        // 借贷记录
        borrowRecordColumns: [
          {
            title: this.$lang('借贷订单ID'),
            key: 'loanOrderId',
          },
          {
            title: this.$lang('借贷时间'),
            key: 'createdAt',
            render: (h, params) =>
              h('span', this.newDate(params.row.createdAt).format()),
          },
          {
            title: this.$lang('币种'),
            key: 'tokenId',
          },
          {
            title: this.$lang('借贷数量'),
            key: 'loanAmount',
          },
          {
            title: this.$lang('已还数量'),
            key: 'repaidAmount',
          },
          {
            title: this.$lang('未还数量'),
            key: 'unpaidAmount',
          },
          {
            title: this.$lang('未还利息'),
            key: 'interestUnpaid',
          },
          {
            title: this.$lang('已还利息'),
            key: 'interestPaid',
          },
        ],
        // 持仓记录
        positionRecordColumns: [
          {
            title: this.$lang('币种'),
            key: 'tokenId',
          },
          {
            title: this.$lang('可用'),
            key: 'available',
          },
          {
            title: this.$lang('冻结'),
            key: 'locked',
          },
          {
            title: this.$lang('已借'),
            key: 'borrowed', // todo 后台提供字段
          },
        ],
        // 还币记录
        repayRecordColumns: [
          {
            title: this.$lang('还币记录ID'),
            key: 'repayOrderId',
          },
          {
            title: this.$lang('还币时间'),
            key: 'createdAt',
            render: (h, params) =>
              h('span', this.newDate(params.row.createdAt).format()),
          },
          {
            title: this.$lang('币种'),
            key: 'tokenId',
          },
          {
            title: this.$lang('还币数量'),
            key: 'amount',
          },
          {
            title: this.$lang('还息数量'),
            key: 'interest',
          },
          {
            title: this.$lang('借贷订单ID'),
            key: 'loanOrderId',
          },
        ],
        // 强平记录
        forceRecordColumns: [
          {
            title: this.$lang('强平ID'),
            key: 'forceId',
            minWidth: 130,
          },
          {
            title: this.$lang('创建时间'),
            key: 'created',
            minWidth: 180,
            render: (h, params) =>
              h('span', this.newDate(params.row.created).format()),
          },
          {
            title: this.$lang('完成时间'),
            key: 'updated',
            minWidth: 180,
            render: (h, params) =>
              h('span', this.newDate(params.row.updated).format()),
          },
          {
            title: this.$lang('机构ID'),
            key: 'orgId',
            minWidth: 80,
          },
          {
            title: this.$lang('操作人ID'),
            key: 'adminUserId',
            minWidth: 100,
          },
          {
            title: this.$lang('用户ID'),
            key: 'userId',
            minWidth: 100,
            render: (h, params) =>
              h('User', {
                props: {
                  uid: params.row.userId,
                },
              }),
          },
          {
            title: this.$lang('AccountID'),
            key: 'accountId',
            minWidth: 100,
          },
          {
            title: this.$lang('安全度'),
            key: 'safety',
            minWidth: 100,
          },
          {
            title: this.$lang('总持仓(BTC)'),
            key: 'allPosition',
            minWidth: 120,
          },
          {
            title: this.$lang('总借贷(BTC)'),
            key: 'allLoan',
            minWidth: 120,
          },
          {
            title: this.$lang('强平类型'),
            key: 'forceType',
            minWidth: 100,
            render: (h, params) =>
              h(
                'span',
                this.$lang(
                  params.row.forceType == 1
                    ? this.$lang('自动强平')
                    : this.$lang('手动强平')
                )
              ),
          },
          {
            title: this.$lang('处理结果'),
            key: 'dealStatus',
            minWidth: 100,
            render: (h, params) =>
              h(
                'span',
                this.$lang(
                  params.row.dealStatus == 1
                    ? this.$lang('未完成')
                    : this.$lang('已完成')
                )
              ),
          },
          // {
          //   title: this.$lang("强平描述"),
          //   key: "forceDesc",
          //   minWidth: 100,
          // },
        ],
      }
    },
    methods: {
      tipHandle (row) {
        this.currentRow = row
        this.closeWin = true
      },
      doHandle () {
        let row = this.currentRow
        this.forceCloseLoading = true
        this.$axios
          .post('/api/v1/margin/risk/close', {
            accountId: row.accountId,
          })
          .then((result) => {
            this.forceCloseLoading = false;
            if (result.code == 0) {
              this.closeWin = false
              this.$Notice.success({
                title: this.$lang('操作成功，系统处理中'),
              })
            }
          })
          .catch(() => {
            this.forceCloseLoading = false
          })
      },
      showModal () {
        this.detailShow = true
      },
      loadDeatilData () {
        if (this.searchForm.accountId.trim() || this.searchForm.userId.trim()) {
          this.loadingDetailTable = true
          this.borrowRecord()
          this.positionRecord()
          this.repayRecord()
        }
      },

      riskRowClassName (row) {
        let line = this.lineData
        if (Number(row.safety) <= line.stopLine) {
          return 'warn-row'
        } else if (
          Number(row.safety) > line.stopLine &&
          Number(row.safety) <= line.appendLine
        ) {
          return 'orange-row'
        } else if (
          Number(row.safety) > line.appendLine &&
          Number(row.safety) <= line.warnLine
        ) {
          return 'yellow-row'
        }
        return ''
      },
      /**
       * 统计用户风险度
       */
      searchRiskStatistics () {
        this.$axios
          .get('/api/v1/margin/risk/user_statistics', {})
          .then((result) => {
            if (result.code == 0 && result.data) {
              this.statisticsData = result.data
            }
          })
      },

      /**
       * 查询用户安全度
       *       // 30s轮询一次
       */
      searchUserRisk () {
        this.loadingRiskTable = true;
        this.$axios.get('/api/v1/margin/risk/user_query', {}).then((result) => {
          this.loadingRiskTable = false
          if (result.code == 0 && result.data) {
            this.riskAllData = result.data
            this.doFilter(this.checkboxOptions)
          }
        })
      },
      changeBox (row) {
        this.doFilter(row)
      },
      doFilter (row) {
        let data = this.riskAllData
        if (row && row.length) {
          let line = this.lineData
          let filterData = data.filter((item) => {
            if (
              Number(item.safety) <= line.stopLine &&
              row &&
              row.includes('close')
            ) {
              return true
            } else if (
              Number(item.safety) > line.stopLine &&
              Number(item.safety) <= line.appendLine &&
              row &&
              row.includes('append')
            ) {
              return true
            } else if (
              Number(item.safety) > line.appendLine &&
              Number(item.safety) <= line.warnLine &&
              row &&
              row.includes('warning')
            ) {
              return true
            }
            return false
          })
          this.riskData = filterData
        } else {
          this.riskData = data
        }
      },
      /**
       * 风险监控统计
       */
      searchRiskTotal () {
        this.loadingRiskTotal = true;
        this.$axios.get('/api/v1/margin/risk/statistics', {}).then((result) => {
          this.loadingRiskTotal = false;
          if (result.code == 0 && result.data) {
            this.riskTotalData = result.data
          }
        })
      },
      // 风控线一般不变动，120s轮询一次
      searchRiskLine () {
        this.$axios.get('/api/v1/margin/risk/get/config', {}).then((result) => {
          if (result.code == 0 && result.data.length) {
            Object.assign(this.lineData, result.data[0])
          }
        })
      },

      // -------- 详情查询 ----------
      borrowRecord () {
        this.$axios
          .get('/api/v1/margin/risk/get/cross_loan_order', {
            params: {
              ...this.searchForm,
            },
          })
          .then((result) => {
            this.loadingDetailTable = false
            if (result.code == 0 && result.data) {
              this.borrowRecordData = result.data
            }
          })
      },
      getFirstBorrowData () {
        this.searchForm.fromLoanId = ''
        this.borrowRecord()
      },
      getNextBorrowData () {
        this.searchForm.fromLoanId = this.borrowRecordData.slice(
          -1
        )[0].loanOrderId
        this.borrowRecord()
      },
      repayRecord () {
        this.$axios
          .get('/api/v1/margin/risk/get/repay_record', {
            params: {
              ...this.searchForm,
            },
          })
          .then((result) => {
            this.loadingDetailTable = false
            if (result.code == 0 && result.data) {
              this.repayRecordData = result.data
            }
          })
      },
      getFirstRecordData () {
        this.searchForm.fromRepayId = ''
        this.repayRecord()
      },
      getNextRecordData () {
        this.searchForm.fromRepayId = this.repayRecordData.slice(
          -1
        )[0].repayOrderId
        this.repayRecord()
      },
      positionRecord () {
        this.$axios
          .get('/api/v1/margin/risk/user_position_detail/query', {
            params: {
              ...this.searchForm,
            },
          })
          .then((result) => {
            this.loadingDetailTable = false
            if (result.code == 0 && result.data) {
              this.positionRecordData = result.data
            }
          })
      },
      showForceRecordModal () {
        this.forceRecordWin = true
      },
      forceRecord () {
        if (this.tempDate.length && this.tempDate[0] && this.tempDate[1]) {
          this.forceForm.startTime = new Date(this.tempDate[0]).getTime()
          this.forceForm.endTime = new Date(this.tempDate[1]).getTime()
        } else {
          this.forceForm.startTime = ''
          this.forceForm.endTime = ''
        }
        this.$axios
          .get('/api/v1/margin/risk/query/force_recode', {
            params: {
              ...this.forceForm,
            },
          })
          .then((result) => {
            if (result.code == 0 && result.data) {
              this.forceRecordData = result.data
            }
          })
      },
      getFirstData () {
        this.forceForm.fromId = ''
        this.forceRecord()
      },
      getNextData () {
        this.forceForm.fromId = this.forceRecordData.slice(-1)[0].id
        this.forceRecord()
      },
    },
    created () {
      this.searchRiskLine()

      this.searchRiskLineInterval = setInterval(() => {
        this.searchRiskLine()
      }, 120000);
    },
    mounted () {
      this.loadingRiskTable = true
      this.searchRiskTotal()
      this.searchRiskStatistics()
      this.searchUserRisk()

      this.searchRiskTotalInterval = setInterval(() => {
        this.searchRiskTotal()
      }, 60000)
      this.searchInterval = setInterval(() => {
        this.searchRiskStatistics();
        this.searchUserRisk();
      }, 30000);
    },

    beforeDestroy () {
      if (this.searchRiskLineInterval) {
        clearInterval(this.searchRiskLineInterval)
      }
      if (this.searchRiskTotalInterval) {
        clearInterval(this.searchRiskTotalInterval)
      }
      if (this.searchInterval) {
        clearInterval(this.searchInterval)
      }

    },
  }
</script>
<style lang="less" scoped>
	.monitor-header {
		/deep/ .ivu-card {
			background: #515a6e;
			height: 90px;
			text-align: center;
		}

		padding-bottom: 20px;

		h2 {
			height: 24px;
			font-size: 14px;
			color: rgba(255, 255, 255, 0.58);
		}

		p {
			height: 40px;
			font-size: 28px;
			color: rgba(255, 255, 255, 1);
		}
	}

	.monitor-status {
		border-radius: 2px;
		height: 84px;
		padding: 32px;
		text-align: center;

		&.danger {
			background: #E02020;
		}

		&.serious {
			background: #F27E10;

		}

		&.warning {
			background: #FFCC17;
		}

		&.safety {
			background: #2AB930;
		}

		span {
			width: 120px;
			height: 24px;
			font-size: 16px;
			font-weight: 600;
			color: rgba(255, 255, 255, 0.85);
			line-height: 22px;
		}
	}

	.tag-warning {
		background: #FFCC17;
		border-radius: 1px;
	}

	.tag-append {
		background: #F27E10;
		border-radius: 1px;
	}

	.tag-close {
		background: #E02020;
		border-radius: 1px;
	}

	/deep/ .ivu-tabs-nav-scroll {
		background: rgba(248, 248, 248, 1);
	}

	/deep/ .ivu-table .warn-row td {
		background-color: #ffadad;
		color: #505a6e;
	}

	/deep/ .ivu-table .orange-row td {
		background-color: rgba(255, 99, 0, 0.3);
		color: #505a6e;
	}

	/deep/ .ivu-table .yellow-row td {
		background-color: rgba(255, 187, 0, 0.3);
		color: #505a6e;
	}
</style>
