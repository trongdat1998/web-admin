<template lang="pug">
Main.page-exchange
  Row.search(:grtter="15")
    Col(span="20") &nbsp;
    Col(span="4")
      Button(type="primary" ghost @click="create" icon="md-add-circle" long :disabled="isRead") {{$lang("新建")}}
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable" border)
  .page-pages(v-if="total>searchForm.pageSize")
    Page(:current.sync="searchForm.current", :total="total", :pageSize="searchForm.pageSize" @on-change="loadData")

  // 创建修改券商
  Modal.page-exchange-win(v-model="creatWinStatus", :title="$lang('折扣配置')" width="800" :footer-hide="isRead")
    Form(:label-width='120' ref="form" :model="formData" :rules="ruleValidate")
      Row(:gutter="40")
        Col(span="12")
          FormItem(:label="$lang('组名称')")
            Input(v-model='formData.name', :placeholder="$lang('组名称')")
        Col(span="12")
          FormItem(:label="$lang('状态')")
            Checkbox(v-model="formData.status" :true-value="1" :false-value="0" border) {{$lang(formData.status? "已启用" : "未启用")}}
      Row(:gutter="40" v-if="handlerType === 'add'")
        Col(span="12")
          FormItem(:label="$lang('类型')")
            Select(v-model="type" @on-change="loadSymbol")
              Option(value="0") {{$lang('全部')}}
              Option(value="1") {{$lang('币币')}}
              Option(value="4") {{$lang('合约')}}
        Col(span="12")
          FormItem(:label="$lang('币对')" prop="symbolId")
            Select(v-model="formData.symbolId" :disabled="type === '0'")
              Option(v-for="(item,index) in tokens" :value="item.symbolId" :key="index") {{item.symbolName}}
      Row(:gutter="40" v-if="handlerType === 'edit'")
        Col(span="12")
          FormItem(:label="$lang('类型')")
            span {{type == 0 ? $lang('全部') : type == 1 ? $lang('币币') : $lang('合约')}}
        Col(span="12")
          FormItem(:label="$lang('币对')" prop="symbolId")
            span {{type == 0 ? '--' : formData.symbolId}}
      Row(:gutter="40")
        Col(:span="type === '1'? 16 : 8" v-if="type === '1' || type === '0'")
          Divider(orientation="left") {{$lang('币币交易')}}
          FormItem(:label="$lang('Taker买费率')")
            Input(v-model='formData.coinTakerBuyFeeDiscount', :placeholder="$lang('Taker买费率')")
              template(slot="append") %
          FormItem(:label="$lang('Taker卖费率')")
            Input(v-model='formData.coinTakerSellFeeDiscount', :placeholder="$lang('Taker卖费率')")
              template(slot="append") %
          FormItem(:label="$lang('Maker买费率')")
            Input(v-model='formData.coinMakerBuyFeeDiscount', :placeholder="$lang('Maker买费率')")
              template(slot="append") %
          FormItem(:label="$lang('Maker卖费率')")
            Input(v-model='formData.coinMakerSellFeeDiscount', :placeholder="$lang('Maker卖费率')")
              template(slot="append") %
        Col(:span="type === '4'? 16 : 8" v-if="type === '4' || type === '0'")
          Divider(orientation="left") {{$lang('合约交易')}}
          FormItem(:label="$lang('Taker买费率')")
            Input(v-model='formData.contractTakerBuyFeeDiscount', :placeholder="$lang('Taker买费率')")
              template(slot="append") %
          FormItem(:label="$lang('Taker卖费率')")
            Input(v-model='formData.contractTakerSellFeeDiscount', :placeholder="$lang('Taker卖费率')")
              template(slot="append") %
          FormItem(:label="$lang('Maker买费率')")
            Input(v-model='formData.contractMakerBuyFeeDiscount', :placeholder="$lang('Maker买费率')")
              template(slot="append") %
          FormItem(:label="$lang('Maker卖费率')")
            Input(v-model='formData.contractMakerSellFeeDiscount', :placeholder="$lang('Maker卖费率')")
              template(slot="append") %
        Col(span="8")
          Row(:gutter="40")
            Col(span="24")
              Divider(orientation="left") {{$lang('UID')}}
              Input(v-model='formData.userList', :placeholder="$lang('每行对应一个UID')",  type="textarea", :rows="5")
              Alert(type="error" v-if="errorUser" style="margin-top:15px") {{errorUser}} {{$lang('已在其他组存在')}}
          Row(:gutter="40")
            Col(span="24")
              Divider(orientation="left") {{$lang('备注')}}
              Input(v-model='formData.mark', :placeholder="$lang('备注')",  type="textarea", :rows="2")
    Button(@click="doNext" :loading="loading" :disable="loading" type="primary" slot="footer") {{$lang('确定')}}
</template>
<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['isRead']),
  },
  data() {
    const checkEmpty = (rule, value, callback) => {
      const formRule = this.$lang('不能为空')
      if (value === '' && this.type != 0) {
        callback(new Error(formRule))
      } else {
        callback()
      }
    }
    return {
      ruleValidate: {
        symbolId: [{ required: true, validator: checkEmpty, trigger: 'blur' }],
      },
      exchangeId: 0,
      handlerType: '',
      type: '0', // 0全部，1币币，4合约
      tokens: [],
      coinTokens: [],
      contractTokens: [],
      loading: false,
      loadingTable: true,
      total: 0,
      searchForm: {
        current: 1,
        pageSize: 100,
      },
      listData: [],
      errorUser: '',

      creatWinStatus: false,
      // create创建 / edit修改
      nextType: '',
      // 创建/修改/查看共用
      formData: {
        status: 1,
        id: 0,
        coinTakerBuyFeeDiscount: '100',
        coinTakerSellFeeDiscount: '100',
        coinMakerBuyFeeDiscount: '100',
        coinMakerSellFeeDiscount: '100',
        optionTakerBuyFeeDiscount: '100',
        optionTakerSellFeeDiscount: '100',
        optionMakerBuyFeeDiscount: '100',
        optionMakerSellFeeDiscount: '100',
        contractTakerBuyFeeDiscount: '100',
        contractTakerSellFeeDiscount: '100',
        contractMakerBuyFeeDiscount: '100',
        contractMakerSellFeeDiscount: '100',
        name: '',
        mark: '',
        userList: '',
        symbolId: '',
      },
      columns: [
        // {
        //   title: "ID",
        //   minWidth: 60,
        //   key: "id",
        //   align: "center"
        // },
        {
          title: this.$lang('名称'),
          minWidth: 140,
          key: 'name',
          align: 'center',
        },
        {
          title: this.$lang('币对'),
          minWidth: 140,
          key: 'symbolId',
          align: 'center',
          render: (h, p) => h('span', p.row.type ? p.row.symbolId : '--'),
        },
        {
          title: this.$lang('币币交易'),
          minWidth: 140,
          align: 'center',
          children: [
            {
              title: 'Taker',
              align: 'center',
              minWidth: 100,
              children: [
                {
                  title: this.$lang('买费率'),
                  key: 'coinTakerBuyFeeDiscount',
                  align: 'center',
                  minWidth: 100,
                  render: (h, p) =>
                    h(
                      'span',
                      p.row.type != 4
                        ? p.row.coinTakerBuyFeeDiscount + '%'
                        : '--'
                    ),
                },
                {
                  title: this.$lang('卖费率'),
                  key: 'coinTakerSellFeeDiscount',
                  align: 'center',
                  minWidth: 100,
                  className: 'off-fee-sell',
                  render: (h, p) =>
                    h(
                      'span',
                      p.row.type != 4
                        ? p.row.coinTakerSellFeeDiscount + '%'
                        : '--'
                    ),
                },
              ],
            },
            {
              title: 'Maker',
              align: 'center',
              minWidth: 100,
              children: [
                {
                  title: this.$lang('买费率'),
                  key: 'coinMakerBuyFeeDiscount',
                  align: 'center',
                  minWidth: 100,
                  render: (h, p) =>
                    h(
                      'span',
                      p.row.type != 4
                        ? p.row.coinMakerBuyFeeDiscount + '%'
                        : '--'
                    ),
                },
                {
                  title: this.$lang('卖费率'),
                  key: 'coinMakerSellFeeDiscount',
                  align: 'center',
                  className: 'off-fee-sell',
                  minWidth: 100,
                  render: (h, p) =>
                    h(
                      'span',
                      p.row.type != 4
                        ? p.row.coinMakerSellFeeDiscount + '%'
                        : '--'
                    ),
                },
              ],
            },
          ],
        },
        {
          title: this.$lang('合约交易'),
          minWidth: 140,
          align: 'center',
          children: [
            {
              title: 'Taker',
              align: 'center',
              minWidth: 100,
              children: [
                {
                  title: this.$lang('买费率'),
                  key: 'contractTakerBuyFeeDiscount',
                  align: 'center',
                  minWidth: 100,
                  render: (h, p) =>
                    h(
                      'span',
                      p.row.type != 1
                        ? p.row.contractTakerBuyFeeDiscount + '%'
                        : '--'
                    ),
                },
                {
                  title: this.$lang('卖费率'),
                  key: 'contractTakerSellFeeDiscount',
                  className: 'off-fee-sell',
                  align: 'center',
                  minWidth: 100,
                  render: (h, p) =>
                    h(
                      'span',
                      p.row.type != 1
                        ? p.row.contractTakerSellFeeDiscount + '%'
                        : '--'
                    ),
                },
              ],
            },
            {
              title: 'Maker',
              align: 'center',
              minWidth: 100,
              children: [
                {
                  title: this.$lang('买费率'),
                  key: 'contractMakerBuyFeeDiscount',
                  align: 'center',
                  minWidth: 100,
                  render: (h, p) =>
                    h(
                      'span',
                      p.row.type != 1
                        ? p.row.contractMakerBuyFeeDiscount + '%'
                        : '--'
                    ),
                },
                {
                  title: this.$lang('卖费率'),
                  className: 'off-fee-sell',
                  key: 'contractMakerSellFeeDiscount',
                  align: 'center',
                  minWidth: 100,
                  render: (h, p) =>
                    h(
                      'span',
                      p.row.type != 1
                        ? p.row.contractMakerSellFeeDiscount + '%'
                        : '--'
                    ),
                },
              ],
            },
          ],
        },
        {
          title: this.$lang('人数'),
          fixed: 'right',
          align: 'center',
          minWidth: 80,
          render: (h, p) =>
            h('span', p.row.userList ? p.row.userList.split(',').length : 0),
        },
        {
          title: this.$lang('状态'),
          fixed: 'right',
          align: 'center',
          minWidth: 80,
          render: (h, p) =>
            p.row.status
              ? h('Icon', {
                  props: {
                    type: 'md-checkmark-circle',
                    color: 'green',
                    size: 18,
                  },
                })
              : h('span', '--'),
        },
        {
          title: this.$lang('操作'),
          fixed: 'right',
          align: 'center',
          minWidth: 80,
          render: (h, params) => {
            return h(
              'a',
              {
                on: {
                  click: () => {
                    this.update()
                    Object.assign(this.formData, params.row)
                    this.type = `${params.row.type}`
                    this.formData.userList = params.row.userList
                      .split(',')
                      .join('\n')
                  },
                },
              },
              this.$lang(this.isRead ? '查看' : '修改')
            )
          },
        },
      ],
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadSymbol() {
      if (this.type === '1') {
        this.tokens = this.coinTokens
      } else if (this.type === '4') {
        this.tokens = this.contractTokens
      } else {
        this.formData.symbolId = ''
      }
    },
    loadData() {
      this.loadingTable = true
      this.$axios
        .post('/api/v1/broker/fee/query/discount/config/list')
        .then((result) => {
          this.loadingTable = false
          if (result.code === 0) {
            this.listData = result.data ? result.data : []
          }
        })
      this.$axios
        .post('/api/v1/symbol/query', {
          current: 1,
          pageSize: 1000,
        })
        .then((result) => {
          if (result.code === 0) {
            this.coinTokens = result.data ? result.data.list : []
            if (result.data && result.data.list.length) {
              this.exchangeId = result.data.list[0].exchangeId
            }
          }
        })
      this.$axios
        .post('/api/v1/swap/query', {
          current: 1,
          pageSize: 1000,
        })
        .then((result) => {
          if (result.code === 0) {
            this.contractTokens = result.data ? result.data.list : []
          }
        })
    },
    update() {
      this.handlerType = 'edit'
      this.prepareData()
    },
    create() {
      this.handlerType = 'add'
      this.formData.symbolId = ''
      this.prepareData()
    },
    prepareData() {
      this.$refs.form.resetFields()
      Object.assign(this.formData, {
        status: 1,
        id: 0,
        coinTakerBuyFeeDiscount: '100',
        coinTakerSellFeeDiscount: '100',
        coinMakerBuyFeeDiscount: '100',
        coinMakerSellFeeDiscount: '100',
        optionTakerBuyFeeDiscount: '100',
        optionTakerSellFeeDiscount: '100',
        optionMakerBuyFeeDiscount: '100',
        optionMakerSellFeeDiscount: '100',
        contractTakerBuyFeeDiscount: '100',
        contractTakerSellFeeDiscount: '100',
        contractMakerBuyFeeDiscount: '100',
        contractMakerSellFeeDiscount: '100',
        name: '',
        mark: '',
        userList: '',
      })
      this.errorUser = ''
      this.creatWinStatus = true
    },
    doNext() {
      this.$refs.form.validate((valid) => {
        if (valid || this.type === '0' || this.handlerType === 'edit') {
          this.loading = true
          this.errorUser = ''
          if (this.type === '0') {
            // 全部类型市场给0
            this.formData.exchangeId = 0
          } else {
            this.formData.exchangeId = this.exchangeId
          }
          let json = Object.assign({}, this.formData)
          json.userList = this.formData.userList.split('\n').join(',')

          this.$axios
            .post('/api/v1/broker/fee/add/discount/config', json)
            .then((result) => {
              this.loading = false
              if (result.code == 0) {
                if (result.data) {
                  this.errorUser = result.data
                  this.$Message.error(
                    result.data + this.$lang('已在其他组存在')
                  )
                } else {
                  this.creatWinStatus = false
                  this.loadData()
                }
              }
            })
        }
      })
    },
  },
}
</script>
