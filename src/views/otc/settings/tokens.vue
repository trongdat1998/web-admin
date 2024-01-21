<style lang="less" scoped>
.wrap {
  border: 1px dashed #dcdee2;
  padding: 15px;
}
.draggable {
  display: inline-block;
  padding: 8px 15px;
  border: 1px solid #dcdee2;
  margin: 10px;
  border-radius: 5px;
}
</style>
<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="12") &nbsp;
    Col(span="4")
      Button(:disabled="isRead" type="error" ghost long @click="sortWin=true") {{$lang("排序管理")}}
    Col(span="4")
      Button(type="warning" ghost long @click="editBuss") {{$lang("共享交易客服联系方式")}}
    Col(span="4")
      Button(:disabled="isRead" type="primary" long @click="createToken"  icon="md-add-circle" ghost) {{$lang("新建")}}
    
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{row, index }" slot="shareStatus")
      iSwitch(:disabled="isRead" size="small" v-model="row.shareStatus" :true-value="1" :false-value="0" @on-change="share(row,index)" :loading="index===editIndex" v-if="row.status")
      Tag(v-else) {{$lang('先启用币种')}}
    template(slot-scope="{row, index}" slot="status")
      iSwitch(:disabled="isRead" size="small" v-model="row.status" :true-value="1" :false-value="0" @on-change="setStatus(row,index)" :loading="index===editIndex")
    template(slot-scope="{row, index}" slot="fee")
      Tag {{$lang('买入')}}:{{row.feeRateOfBuy}}%
      Tag {{$lang('卖出')}}:{{row.feeRateOfSell}}%
    template(slot-scope="{row, index}" slot="range") {{row.downRange}}% - {{row.upRange}}%
    template(slot-scope="{row, index}" slot="action")
      Button(:disabled="isRead" type="primary" size="small" ghost @click="editToken(row)") {{$lang('修改')}}
  Modal(v-model="disableWin" :title="$lang('禁用OTC交易币种')" footer-hide @on-cancel="cancelDisable" width="350")
    div(style="padding:10px 0 20px")
      | {{$lang("请确认如下2点，方可禁止该交易币种")}}<br>
      | {{$lang("1.目前该币种没有本交易所商家挂的广告单；")}}<br>
      | {{$lang("2.该币种所有法币订单都已处理完，没有正在进行中的交易。")}}
    Button(@click="disableToken" long type="error" :loading="loading") {{$lang("确认并禁用该OTC交易币种")}}
  Modal(v-model="bussSetWin" :title="$lang('券商信息')" footer-hide)
    Form(:labelWidth="100")
      FormItem(:label="$lang('券商名字')")
        Input(type="text"  v-model="bussFormData.brokerName")
      FormItem(:label="$lang('联系方式')")
        Input(type="text"  v-model="bussFormData.phone" :placeholder="$lang('请提供24小时值班手机号')")
      Button(long type="success" @click="saveBussInfo" :loading="loading" :disabled="loading||isRead") {{$lang('确定')}}
  Modal(v-model="tokenWin" :title="$lang(tokenForm.brokerId?'修改OTC交易币种':'新建OTC交易币种')" footer-hide)
    Form(:labelWidth="120")
      FormItem(:label="$lang('OTC交易币种')")
        Input(v-if="tokenForm.brokerId" disabled :value="tokenForm.tokenName")
        Select(v-model="tokenForm.tokenId" v-else filterable)
          Option(:value="item.tokenId" v-for="item in tokens" :key="item.tokenId") {{item.tokenName}}
      FormItem(:label="$lang('买费率')")
        Input(type="text"  v-model="tokenForm.feeRateOfBuy")
          template(slot="append") %
        Alert {{$lang('仅向商家收取')}}
      FormItem(:label="$lang('卖出费率')")
        Input(type="text"  v-model="tokenForm.feeRateOfSell")
          template(slot="append") %
        Alert {{$lang('仅向商家收取')}}
      FormItem(:label="$lang('Token精度')")
        Select(v-model="tokenForm.scale")
          Option(:value="item" v-for="item in 10" :key="item") {{item}}
      FormItem(:label="$lang('最低交易数量')")
        Input(type="text"  v-model="tokenForm.minQuote")
          template(slot="append") {{tokenMap[tokenForm.tokenId]}}
      FormItem(:label="$lang('最高交易数量')")
        Input(type="text"  v-model="tokenForm.maxQuote")
          template(slot="append") {{tokenMap[tokenForm.tokenId]}}
      FormItem(:label="$lang('浮动价区间')")
        Row
          Col(span="10")
            Input(type="text"  v-model="tokenForm.downRange" placeholder="min")
              template(slot="append") %
          Col(span="4" style="text-align:center") -
          Col(span="10")
            Input(type="text"  v-model="tokenForm.upRange" placeholder="max")
              template(slot="append") %
      Button(long type="success" @click="saveToken" :loading="loading" :disabled="loading") {{$lang('确定')}}
  Modal(v-model="sortWin" :title="$lang('排序')")
    Alert {{$lang('选中后拖动鼠标进行排序')}}
    draggable.wrap(v-model="listData" draggable=".draggable" style="overflow:hidden")
      span.move.draggable(v-for="item in listData") {{item.tokenName}}
    Button(long type="success" @click="saveSort" :loading="loading" :disabled="loading" slot="footer") {{$lang('确定')}}
  Alert(style="margin-top:20px" v-html="$lang('otc.tokens.tip')")
</template>
<script>
import { mapState } from 'vuex'
import draggable from 'vuedraggable'
export default {
  components: {
    draggable,
  },
  data() {
    return {
      sortWin: false,
      disableWin: false,
      tokenWin: false,
      postStatusData: {},
      tokenForm: {
        tokenId: '',
        tokenName: '',
        minQuote: '', //最低限额
        maxQuote: '', //最高限额
        scale: '',
        feeRateOfBuy: '', //购买手续费率
        feeRateOfSell: '', //出售手续费率
        brokerId: '',
        downRange: '',
        upRange: '',
      },
      tokens: [],
      tokenMap: {},
      loading: false,
      editIndex: null,
      loadingTable: true,

      bussSetWin: false,
      bussFormData: {
        phone: '', //必须
        brokerName: '', //忽略
        brokerId: '', //忽略,
      },
      sourceBussFormData: {
        phone: '', //必须
        brokerName: '', //忽略
        brokerId: '', //忽略,
      },
      columns: [
        {
          title: this.$lang('币种'),
          key: 'tokenName',
          minWidth: 100,
        },
        {
          title: this.$lang('交易费率-仅向商家收取'),
          key: 'feeRateOfSell',
          minWidth: 190,
          slot: 'fee',
        },
        {
          title: this.$lang('Token精度'),
          key: 'scale',
          minWidth: 100,
        },
        {
          title: this.$lang('最低交易数量'),
          key: 'minQuote',
          minWidth: 140,
        },
        {
          title: this.$lang('最高交易数量'),
          key: 'maxQuote',
          minWidth: 140,
        },
        {
          title: this.$lang('浮动价区间'),
          key: 'downRange',
          minWidth: 140,
          slot: 'range',
        },

        {
          title: this.$lang('状态'),
          minWidth: 100,
          slot: 'status',
        },
        // {
        //   title: this.$lang("共享"),
        //   minWidth: 100,
        //   slot: "shareStatus"
        // },
        {
          title: this.$lang('操作'),
          minWidth: 100,
          slot: 'action',
        },
      ],
      listData: [],
    }
  },
  computed: {
    ...mapState(['isRead']),
  },
  created() {
    this.getExtInfo()
    this.$axios.post('/api/v1/otc/config/token/select').then((result) => {
      if (result.code == 0) {
        this.tokens = result.data
        this.tokens.forEach((el) => {
          this.tokenMap[el.tokenId] = el.tokenName
        })
      }
    })
  },
  methods: {
    cancelDisable() {
      this.editIndex = null
      this.listData = [...this.listData]
    },
    disableToken() {
      this.postStatus(this.listData[this.editIndex])
    },
    editBuss() {
      this.bussSetWin = true
      Object.assign(this.bussFormData, this.sourceBussFormData)
    },
    saveSort() {
      this.loading = true
      let list = this.listData.map((el) => el.tokenId)
      this.$axios
        .post('/api/v1/otc/config/token/sort', { list })
        .then((result) => {
          this.loading = false
          if (result.code === 0) {
            this.sortWin = false
          }
        })
    },
    editToken(row) {
      this.tokenWin = true
      Object.assign(this.tokenForm, row)
    },
    createToken() {
      this.tokenWin = true
      Object.assign(this.tokenForm, {
        tokenId: this.tokens[0].tokenId,
        tokenName: '',
        minQuote: '', //最低限额
        maxQuote: '', //最高限额
        scale: '',
        feeRateOfBuy: '', //购买手续费率
        feeRateOfSell: '', //出售手续费率
        brokerId: '',
      })
    },
    saveToken() {
      this.loading = true
      if (!this.tokenForm.brokerId) {
        this.tokenForm.tokenName = this.tokenMap[this.tokenForm.tokenId]
      }
      this.$axios
        .post('/api/v1/otc/config/broker/token/save', this.tokenForm)
        .then((result) => {
          this.loading = false
          if (result.code === 0) {
            location.reload()
          }
        })
    },
    loadData() {
      this.loadingTable = true
      this.$axios.post('/api/v1/otc/config/token/list').then((result) => {
        this.loadingTable = false
        if (result.code === 0) {
          this.listData = result.data
          this.editIndex = null
        }
      })
    },
    setStatus(row, index) {
      this.editIndex = index
      Object.assign(this.postStatusData, row)
      if (row.status) {
        this.postStatus()
      } else {
        this.disableWin = true
      }
    },

    postStatus() {
      this.$axios
        .post('/api/v1/otc/config/token/setStatus', this.postStatusData)
        .then((result) => {
          this.editIndex = null
          this.disableWin = false
          if (result.code != 0) {
            this.listData = [...this.listData]
          } else {
            this.disableWin = false
          }
        })
    },
    setShare(shareStatus, row) {
      this.$axios
        .post('/api/v1/otc/config/token/setShareStatus', {
          shareStatus,
          tokenId: row.tokenId,
        })
        .then((result) => {
          this.editIndex = null
          if (result.code == 0) {
            row.shareStatus = shareStatus
          } else {
            this.listData = [...this.listData]
          }
        })
    },
    saveBussInfo() {
      this.loading = true
      this.$axios
        .post('/api/v1/otc/config/broker/ext/save', this.bussFormData)
        .then((result) => {
          this.loading = false
          if (result.code === 0) {
            this.bussSetWin = false
            Object.assign(this.sourceBussFormData, this.bussFormData)
          }
        })
    },

    share(row, index) {
      this.editIndex = index
      if (row.shareStatus) {
        if (this.sourceBussFormData.phone) {
          this.setShare(1, row)
        } else {
          this.editIndex = null
          this.bussSetWin = true
          setTimeout(() => {
            this.listData = [...this.listData]
          }, 100)
        }
      } else {
        this.setShare(0, row)
      }
    },
    getExtInfo() {
      this.$axios.post('/api/v1/otc/config/broker/ext/get').then((result) => {
        if (result.code == 0 && result.data) {
          Object.assign(this.sourceBussFormData, result.data)
        }
        this.loadData()
      })
    },
  },
}
</script>
