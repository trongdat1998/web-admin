<style lang="less" scoped>
.border {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 0 5px;
}
</style>
<template lang="pug">
div.page-exchange
  Row.search(:gutter="15")
    Col(span="24")
      Input(
        search,
        :placeholder="$lang('币种简称')",
        v-model="searchForm.tokenName",
        enter-button="",
        @on-search="search()"
      )
  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable"
  )
    template(slot-scope="{ row, index }", slot="name") {{ row.tokenId }}
      span.border(
        :style="objectStyle(row, 'isTest')",
        v-if="row.isTest"
      ) {{ $lang('测试')}}
      span.border(
        :style="objectStyle(row, 'isBaas')",
        v-if="row.isBaas"
      ) {{ $lang('Bass') }}
      span.border(
        :style="objectStyle(row, 'isAggregate')",
        v-if="row.isAggregate"
      ) {{ $lang('聚合') }}
    template(slot-scope="{ row, index }", slot="applyTokenName")
      Input(
        v-if="tokenIndex === index",
        v-model="tokenNameForm.toTokenName",
        size="small",
        style="top:0"
      )
        div(slot="append")
          a(
            v-if="tokenNameForm.toTokenName != tokenNameForm.tokenName",
            href="",
            @click.prevent="submitTokenName"
          ) {{ $lang('确定') }}
      div(v-else)
        | {{ row.tokenName }}
        | &nbsp;&nbsp;
        a(@click.prevent="editTokenName(row, index)" v-if="row.owner") {{ $lang('修改') }}
    template(slot-scope="{ row, index }", slot="applyTokenFullName")
      Input(
        v-if="fullTokenIndex === index",
        v-model="tokenFullNameForm.toTokenFullName",
        size="small",
        style="top:0"
      )
        div(slot="append")
          a(
            v-if="tokenFullNameForm.toTokenFullName != tokenFullNameForm.tokenFullName",
            href="",
            @click.prevent="submitTokenFullName"
          ) {{ $lang('确定') }}
      div(v-else)
        | {{ row.tokenFullName }}
        | &nbsp;&nbsp;
        a(@click.prevent="editTokenFullName(row, index)") {{ $lang('修改') }}
    template(slot-scope="{ row, index }", slot="deposit")
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.allowDeposit",
        :loading="index === editIndex",
        @on-change="deposit(row, index)",
        v-if="row.isPublished"
      )
      span(v-else) ---
    template(slot-scope="{ row, index }", slot="withdraw")
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.allowWithdraw",
        :loading="index === editIndex",
        @on-change="withdraw(row, index)",
        v-if="row.isPublished"
      )
      span(v-else) ---
    template(slot-scope="{ row, index }", slot="isHighRiskToken")
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.isHighRiskToken",
        :loading="index === editIndex",
        @on-change="setHighRiskToken(row, index)",
        v-if="row.isPublished"
      )
      span(v-else) ---
    template(slot-scope="{ row, index }", slot="publish")
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.isPublished",
        :loading="index === editIndex",
        @on-change="publish(row, index)"
      )
    template(slot-scope="{ row, index }", slot="fee")
      template(v-if="setIndex === index")
        Input(v-model="feeForm.fee")
          Button(
            type="text",
            slot="append",
            @click="setFee",
            :disabled="index === editIndex && index === setIndex",
            :loading="index === editIndex && index === setIndex"
          ) {{ $lang('确定') }}
      div(v-else)
        span(v-if="row.fee>0") {{ row.fee }} {{ row.tokenName }}
        | &nbsp;&nbsp;
        a(@click.prevent="editFee(row, index)") {{ row.fee>0 ? $lang('修改') : $lang('设置') }}
  Page(
    :total="total",
    :page-size="searchForm.pageSize",
    style="margin-top:20px;",
    @on-change="search",
    v-if="total > searchForm.pageSize"
  )
  Modal(v-model="settingsWinStatus", width="360", @on-cancel="cancel")
    p(slot="header", style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{ $lang('提示') }}
    p {{  action=="deposit" ? $lang('关闭币种充值操作后，如遇有用户在此时刻后的充值将不上账，也不支持找回，请确认后谨慎操作。'):$lang('关闭币种页面可见（启用）操作后，如遇有用户在此时刻后的充值将不上账，也不支持找回，请确认后谨慎操作。')  }}
    template(slot="footer")
      Button(@click="cancel") {{ $lang('取消') }}
      Button(type="error", @click="forbid") {{ $lang('确定') }}
</template>
<script>
import { mapState } from 'vuex'
export default {
  computed: { ...mapState(['isRead']) },
  created() {
    this.loadData()
  },
  methods: {
    editFee(row, index) {
      this.setIndex = index
      this.feeForm.fee = row.fee
      this.feeForm.tokenId = row.tokenId
    },
    setFee() {
      this.editIndex = this.setIndex
      this.$axios
        .post('/api/v1/token/set_token_withdraw_fee', this.feeForm)
        .then((result) => {
          this.editIndex = null
          if (result.code == 0) {
            this.$Notice.success({
              title: this.$lang('修改成功'),
            })
            this.setIndex = null
            this.loadData()
          }
        })
    },
    search(page = 1) {
      this.searchForm.current = page
      this.loadData()
    },
    loadData() {
      this.loadingTable = true
      this.$axios
        .post('/api/v1/token/query', this.searchForm)
        .then((result) => {
          this.loadingTable = false
          if (result.code === 0) {
            this.listData = result.data.list ? result.data.list : []
            this.total = result.data.total
          }
        })
    },
    forbid() {
      this.$axios
        .post('/api/v1/token/forbid_' + this.action, {
          tokenId: this.tokenId,
        })
        .then((result) => {
          if (result.code == 0) {
            this.editIndex = null
            this.settingsWinStatus = false
          }
        })
    },
    deposit(row, index) {
      this.editIndex = index
      if (row.allowDeposit) {
        this.$axios
          .post('/api/v1/token/allow_deposit', {
            tokenId: row.tokenId,
          })
          .then((result) => {
            this.editIndex = null
            if (result.code != 0) {
              this.listData = [...this.listData]
            }
          })
      } else {
        this.tokenId = row.tokenId
        this.settingsWinStatus = true
        this.action = 'deposit'
      }
    },
    withdraw(row, index) {
      this.editIndex = index
      this.$axios
        .post(
          row.allowWithdraw
            ? '/api/v1/token/allow_withdraw'
            : '/api/v1/token/forbid_withdraw',
          {
            tokenId: row.tokenId,
          }
        )
        .then((result) => {
          this.editIndex = null
          if (result.code != 0) {
            this.listData = [...this.listData]
          }
        })
    },
    publish(row, index) {
      this.editIndex = index
      if (row.isPublished) {
        this.$axios
          .post('/api/v1/token/allow_publish', {
            tokenId: row.tokenId,
          })
          .then((result) => {
            this.editIndex = null
            if (result.code != 0) {
              this.listData = [...this.listData]
            }
          })
      } else {
        this.tokenId = row.tokenId
        this.settingsWinStatus = true
        this.action = 'publish'
      }
    },
    setHighRiskToken(row, index) {
      this.editIndex = index
      this.$axios
        .post('/api/v1/token/set_high_risk_token', {
          tokenId: row.tokenId,
          isHighRiskToken: row.isHighRiskToken,
        })
        .then((result) => {
          this.editIndex = null
          if (result.code != 0) {
            this.listData = [...this.listData]
          }
        })
    },
    cancel() {
      this.settingsWinStatus = false
      this.listData = [...this.listData]
      this.editIndex = null
    },
    editTokenName(row, index) {
      this.tokenNameForm.tokenId = row.tokenId
      this.tokenNameForm.tokenName = row.tokenName
      this.tokenNameForm.toTokenName = row.tokenName
      this.tokenIndex = index
    },
    editTokenFullName(row, index) {
      this.tokenFullNameForm.tokenId = row.tokenId
      this.tokenFullNameForm.tokenFullName = row.tokenFullName
      this.tokenFullNameForm.toTokenFullName = row.tokenFullName
      this.fullTokenIndex = index
    },
    submitTokenName() {
      Object.assign(this.tokenNameForm, {
        tokenName: this.tokenNameForm.toTokenName,
      })
      this.$axios
        .post('/api/v1/token/edit_token_name', this.tokenNameForm)
        .then((result) => {
          if (result.code == 0) {
            this.$Notice.success({
              title: this.$lang('修改成功'),
            })
            this.loadData(this.searchForm.current)
            this.tokenIndex = null
          }
        })
    },
    submitTokenFullName() {
      Object.assign(this.tokenFullNameForm, {
        tokenFullName: this.tokenFullNameForm.toTokenFullName,
      })
      this.$axios
        .post('/api/v1/token/edit_token_full_name', this.tokenFullNameForm)
        .then((result) => {
          if (result.code == 0) {
            this.$Notice.success({
              title: this.$lang('修改成功'),
            })
            this.loadData(this.searchForm.current)
            this.fullTokenIndex = null
          }
        })
    },
    objectStyle(row, type) {
      if (row.isTest && type === 'isTest') {
        return {
          color: '#d23434',
          borderColor: '#d23434',
        }
      } else if (row.isBaas && type === 'isBaas') {
        return {
          color: '#ff9900',
          borderColor: '#ff9900',
        }
      } else if (row.isAggregate && type === 'isAggregate') {
        return {
          color: '#4299FF',
          borderColor: '#4299FF',
        }
      }
    },
  },
  data() {
    return {
      setIndex: null,
      tokenId: '',
      action: '',
      editIndex: null,
      tokenIndex: null,
      fullTokenIndex: null,
      settingsWinStatus: false,
      total: 0,
      loadingTable: true,
      searchForm: {
        current: 1,
        pageSize: 100,
        tokenName: '',
        category: 1,
      },
      feeForm: {
        tokenId: '',
        fee: '',
      },
      tokenNameForm: {
        tokenId: '',
        tokenName: '',
        toTokenName: '',
      },
      tokenFullNameForm: {
        tokenId: '',
        tokenFullName: '',
        toTokenFullName: '',
      },
      columns: [
        {
          title: this.$lang('币种ID'),
          key: 'tokenId',
          minWidth: 90,
          slot: 'name',
        },
        {
          title: this.$lang('币种简称'),
          key: 'tokenName',
          minWidth: 200,
          slot: 'applyTokenName',
        },
        {
          title: this.$lang('币种全称'),
          key: 'tokenFullName',
          minWidth: 200,
          slot: 'applyTokenFullName',
        },
        {
          title: this.$lang('标识'),
          minWidth: 80,
          render: (h, params) => {
            return h('img', {
              attrs: {
                src: params.row.tokenIcon,
                width: 40,
                style: 'padding:5px;',
              },
            })
          },
        },
        {
          title: this.$lang('提现券商加收手续费'),
          minWidth: 200,
          slot: 'fee',
        },
        {
          title: this.$lang('充值'),
          align: 'center',
          width: 120,
          slot: 'deposit',
        },
        {
          title: this.$lang('提现'),
          align: 'center',
          width: 120,
          slot: 'withdraw',
        },
        {
          title: this.$lang('风险币种'),
          align: 'center',
          width: 120,
          slot: 'isHighRiskToken',
        },

        {
          title: this.$lang('页面可见'),
          align: 'center',
          width: 120,
          fixed: 'right',
          slot: 'publish',
        },
      ],
      listData: [],
    }
  },
}
</script>
