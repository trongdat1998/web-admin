<style lang="less" scoped>
.wrap {
  border: 1px dashed #dcdee2;
  padding: 10px;
}
.draggable {
  margin: 8px;
}
/deep/ .demo-table-info-row {
  background: rgba(255, 102, 0, 0.2);
}
.border {
  border: 1px solid #ccc;
  display: inline-block;
  padding: 0 5px;
}
</style>
<template lang="pug">
.page-exchange
  .search
    Row(:gutter="15")
      Col(span="2") &nbsp;
      Col(span="4", v-if="searchForm.category == 1")
        Button(
          :disabled="isRead",
          long,
          ghost,
          icon="md-barcode",
          @click="loadUserList(3)",
          type="warning"
        ) {{ $lang('禁买白名单') }}
      Col(span="4", v-if="searchForm.category == 1")
        Button(
          :disabled="isRead",
          long,
          ghost,
          icon="md-barcode",
          @click="loadUserList(2)",
          type="error"
        ) {{ $lang('禁卖白名单') }}
      Col(span="4")
        Button(
          :disabled="isRead",
          long,
          ghost,
          @click="openApi",
          type="primary"
        ) {{ $lang('API交易白名单') }}
      Col(span="4")
        Button(
          :disabled="isRead",
          long,
          ghost,
          @click="openQuoteTokens",
          type="primary"
        ) {{ $lang('交易区管理') }}
      Col(span="4")
        Button(
          :disabled="isRead",
          long,
          ghost,
          to="/broker/tags",
          type="primary"
        ) {{ $lang('标签管理') }}
      Col(span="2") &nbsp;
    Divider
    Row(:gutter="15")
      Col(span="5")
        Select(v-model="searchForm.customerQuoteId", @on-change="search()")
          Option(value="ALL") {{ $lang('全部交易区') }}
          Option(v-for="item in quoteTokens", :key="item.id", :value="item.id") {{ quoteTokensName(item.contentlist) }}
      Col(span="14")
        Input(
          search,
          :placeholder="$lang('币对简称')",
          v-model="searchForm.symbolName",
          enter-button="",
          @on-search="loadData"
        )
      Col(span="5")
        Button(
          long,
          :loading="symbolsLoading",
          ghost,
          @click="getSymbol",
          type="primary",
          :disabled="symbolsLoading || searchForm.customerQuoteId === 'ALL' || isRead"
        ) {{ $lang('交易区币对管理/排序') }}

  Table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable",
    :row-class-name="rowClassName"
  )
    template(slot-scope="{row, index }", slot="transferStatus")
      iSwitch(
        :disabled="isRead",
        size="small",
        :true-value="1",
        :false-value="row.transferStatus === 0 ? 0 : 2",
        v-model="row.transferStatus",
        :loading="index === editIndex",
        @on-change="exist(row, index)"
      )
      template(v-if="row.transferStatus == 1")
        Tooltip(:content="row.transferBrokerName", placement="top")
          Icon(
            type="ios-information-circle-outline",
            size="18",
            style="margin-left:8px;vertical-align: bottom;margint-top:-2px"
          )
    template(slot-scope="{row, index }", slot="detail")
      Button(type="primary", ghost, @click="view(row, index)", size="small") {{ $lang('详情') }}
    template(slot-scope="{ row, index }", slot="published")
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.published",
        :loading="index === editIndex",
        @on-change="change(row, index, 'published')"
      )
    template(slot-scope="{ row, index }", slot="banSellStatus")
      Tag(v-if="!row.published") {{ $lang('需开启上架') }}
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.banSellStatus",
        :loading="index === editIndex",
        @on-change="change(row, index, 'banSellStatus')",
        v-else
      )
    template(slot-scope="{ row, index }", slot="banBuyStatus")
      Tag(v-if="!row.published") {{ $lang('需开启上架') }}
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.banBuyStatus",
        :loading="index === editIndex",
        @on-change="change(row, index, 'banBuyStatus')",
        v-else
      )
    template(slot-scope="{ row, index }", slot="showStatus")
      Tag(v-if="!row.published") {{ $lang('需开启上架') }}
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.showStatus",
        :loading="index === editIndex",
        @on-change="change(row, index, 'showStatus')",
        v-else
      )
    template(slot-scope="{ row, index }", slot="filterTopStatus")
      Tag(v-if="!row.published") {{ $lang('需开启上架') }}
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.filterTopStatus",
        :loading="index === editIndex",
        @on-change="change(row, index, 'filterTopStatus')",
        v-else
      )
    template(slot-scope="{ row, index }", slot="hideFromOpenapi")
      Tag(v-if="!row.published") {{ $lang('需开启上架') }}
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.hideFromOpenapi",
        :loading="index === editIndex",
        @on-change="change(row, index, 'hideFromOpenapi')",
        v-else
      )
    template(slot-scope="{ row, index }", slot="forbidOpenapiTrade")
      Tag(v-if="!row.published") {{ $lang('需开启上架') }}
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.forbidOpenapiTrade",
        :loading="index === editIndex",
        @on-change="change(row, index, 'forbidOpenapiTrade')",
        v-else
      )
    template(slot-scope="{ row, index }", slot="allowPlan")
      Tag(v-if="!row.published") {{ $lang('需开启上架') }}
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.allowPlan",
        :loading="index === editIndex",
        @on-change="change(row, index, 'allowPlan')",
        v-else
      )
    template(slot-scope="{ row, index }", slot="tags")
      Select(
        :disabled="isRead",
        v-model="row.labelId",
        @on-change="changeTag(row)"
      )
        Option(value="0") {{ $lang('无') }}
        Option(
          :value="item.labelId",
          v-for="item in tags",
          :key="item.labelId"
        ) {{ item.text }}
    template(slot-scope="{ row, index }", slot="name") 
      | {{ row.symbolName }}
      span.border(
        v-if="tagsMap[row.labelId] && row.labelId > 1"
        :style="objectStyle(tagsMap[row.labelId])",
      ) {{ tagsMap[row.labelId].text }}
  Page(
    :total="total",
    :page-size="searchForm.pageSize",
    style="margin-top:20px;",
    @on-change="search",
    v-if="total > searchForm.pageSize",
    :current="searchForm.current"
  )
  ManageQuoteTokens(
    v-model="manageQuoteTokensWin",
    :quoteTokensArea="quoteTokens"
  )

  Modal.page-exchange-win(
    v-model="whiteWin",
    :title="$lang(whiteData.listType == 2 ? '禁卖白名单' : '禁买白名单')"
  )
    Form
      FormItem(label="UID")
        Input(
          v-model="whiteData.userIds",
          type="textarea",
          :placeholder="$lang('每行对应一个UID')",
          :rows="8"
        )
      Alert(
        type="error",
        v-if="errorUserIds.length",
        style="word-break:break-all;",
        show-icon
      )
        | {{ $lang('UID不存在人数') }}：{{ errorUserIds.length }}
        Icon(type="ios-bulb-outline", slot="icon")
        template(slot="desc") {{ errorUserIds.join(',') }}
          p
            ButtonGroup
              Button(size="small", @click="filter('item')") {{ $lang('一键分组') }}
              Button(size="small", @click="filter('flag')") {{ $lang('一键标识') }}
              Button(size="small", @click="filter('clear')") {{ $lang('一键清除错误ID') }}
    Button(
      slot="footer",
      @click="doCreateWhite",
      :loading="loading",
      :disabled="loading",
      type="primary"
    ) {{ $lang('确定') }}
  // 开启/关闭券商
  Modal(
    v-model="settingsWin",
    :title="$lang(settingsForm.typeText) + settingsForm.symbolId",
    @on-cancel="cancel"
  )
    Alert(type="error", v-if="settingsForm.typeText == '下架'") {{ $lang('下架币对前，请在深度管理中手动撤销所有未成交用户委托后，再回此页面执行下架操作') }}
    Alert(v-else) {{ $lang('您确定执行此操作吗？') }}
    Input(
      v-model="settingsForm.remark",
      :placeholder="$lang('请输入原因')",
      type="textarea",
      :rows="4"
    )
    Alert(
      type="error",
      v-if="settingsForm.publishToken",
      style="margin-top:10px"
    ) {{ $lang('{tokenid}未开启,开启币种后才可以上架币对。').replace('{tokenid}', settingsForm.publishTokenId) }}
    template(slot="footer")
      Button(
        type="primary",
        @click="settings",
        :loading="loading",
        :disabled="loading",
        v-if="!settingsForm.publishToken"
      ) {{ $lang('确定') }}
      Button(
        type="success",
        @click="settings",
        :loading="loading",
        :disabled="loading",
        v-else,
        long
      ) {{  $lang("开启{tokenid}，并上架{symbolId}").replace('{tokenid}',settingsForm.publishTokenId).replace('{symbolId}',settingsForm.symbolId)  }}

  Modal(v-model="viewWin", :title="$lang('详情')")
    List
      ListItem {{ $lang('币对') }}：
        Tag {{ viewData.baseTokenId + '/' + viewData.quoteTokenId }}
      ListItem {{ $lang('最小价格精度') }}：
        Tag {{ viewData.minPricePrecision }}
      ListItem {{ $lang('最小数量精度') }}：
        Tag {{ viewData.basePrecision }}
      ListItem {{ $lang('最小交易额') }}：
        Tag {{ viewData.minTradeAmount }}
      ListItem {{ $lang('最小交易数量') }}：
        Tag {{ viewData.minTradeQuantity }}
  Modal(v-model="markerAmountWin", :title="$lang('做市账号')")
    Alert {{ $lang('若币对为转发币对时，则做市账号不生效。') }}
    Form
      FormItem(
        :label="'AccountId-' + (index + 1)",
        v-for="(item, index) in markerAmountForm",
        :key="index"
      )
        Input(v-model="item.accountId")
    Button(
      type="primary",
      @click="setMarkerAmount",
      :loading="loading",
      :disabled="loading",
      slot="footer"
    ) {{ $lang('确定') }}

  Modal(v-model="sortWin", :title="$lang('交易区币对管理/排序')", width="870")
    Row(:gutter="20")
      Col(span="6")
        Scroll
          CheckboxGroup(v-model="symbols")
            Checkbox(
              v-for="item in allSybols",
              :key="item",
              border,
              :label="item",
              style="width:90%;margin-bottom:5px"
            ) {{ item }}
      Col(span="18")
        Alert {{ $lang('选中后拖动鼠标进行排序') }}
        draggable.wrap(
          v-model="symbols",
          draggable=".draggable",
          style="overflow:hidden"
        )
          Tag.move.draggable(
            v-for="item in symbols",
            closable,
            @on-close="remmoveSymbols(item)",
            size="medium",
            :key="item"
          ) {{ item }}
    Button(
      long,
      type="success",
      @click="sortSymbol",
      :loading="loading",
      :disabled="loading",
      slot="footer"
    ) {{ $lang('确定') }}

  Modal(v-model="limitWin", :title="$lang('设置k线数据')", width="600")
    Row(:gutter="20")
      Col(span="22")
        Input(
          v-model="currentRow === null ? '' : currentRow.symbolName",
          disabled
        )
      Col(span="22", style="margin: 12px 0px 0px 0px")
        DatePicker(
          type="datetime",
          format="yyyy-MM-dd HH:mm",
          style="width:100%",
          v-model="webconfig.datatime",
          :options="options",
          :placeholder="$lang('设置k线数据')"
        )
        span &nbsp;{{ $lang('tip:请谨慎设置，用户设置此时间，则仅显示此时间之后的币对k线数据') }}
    Button(
      long,
      type="success",
      @click="setKlineLimit",
      :loading="loading",
      :disabled="loading",
      slot="footer"
    ) {{ $lang('确定') }}
  //  api交易白名单
  Modal.page-exchange-win(
    v-model="openApiWin",
    :title="$lang('API交易白名单')"
  )
    Form
      FormItem(:label="$lang('币对')")
        Select(v-model="apiWhiteData.symbolId", filterable, @on-change="changeCoinPair")
          Option(v-for="item in symbolData" :value="item.symbolId" :key="item.symbolId") {{item.symbolName}}
      FormItem(label="UID")
        Input(
          v-model="apiWhiteData.userIds",
          type="textarea",
          :placeholder="$lang('每行对应一个UID')",
          :rows="8"
        )
    Button(
      slot="footer",
      @click="doCreateApiWhite",
      :loading="loading",
      :disabled="loading",
      type="primary"
    ) {{ $lang('确定') }}
  // 转发开启
  Modal(
    @on-cancel="cancel",
    v-model="openWin",
    :title="$lang('撮合券商')",
    footer-hide,
    width="300"
  )
    Input(v-model="openForm.symbolName", disabled)
    Input(v-model="openForm.matchBrokerName", :placeholder="$lang('请输入券商简称')" style="margin-top: 12px")
    Button(
      :loading="loading",
      :disabled="loading",
      type="primary",
      long,
      @click="open",
      style="margin-top:15px"
    ) {{ $lang('确定') }}
  // 转发关闭
  Modal(
    @on-cancel="cancel",
    v-model="closeWin",
    :title="$lang('关闭')",
    footer-hide,
    width="300"
  )
    Alert {{ $lang('您确定执行此操作吗？') }}
    Input(v-model="openForm.symbolName", disabled)
    Input(
      v-model="closeForm.remark",
      :placeholder="$lang('请输入原因')",
      type="textarea",
      :rows="2",
      style="margin-top: 12px"
    )
    Button(
      :loading="loading",
      :disabled="loading",
      type="primary",
      long,
      @click="close",
      style="margin-top:15px"
    ) {{ $lang('确定') }}
</template>
<script>
let types = {
  banSellStatus: 1,
  banBuyStatus: 2,
  showStatus: 4,
  filterTopStatus: 6,
  allowPlan: 7,
  hideFromOpenapi: 100,
  forbidOpenapiTrade: 200,
}

let swTyps = {
  1: '禁卖',
  2: '禁买',
  4: '前端展示',
  6: '涨幅黑名单',
  7: '计划委托可见',
  100: '禁止API交易',
  200: 'API隐藏',
}

import { mapState } from 'vuex'
import draggable from 'vuedraggable'
import ManageQuoteTokens from './components/manageQuoteTokens'
export default {
  components: {
    draggable,
    ManageQuoteTokens,
  },
  computed: {
    userIdsStr() {
      if (this.whiteData.userIds) {
        return this.whiteData.userIds.replace(/ /g, '').split('\n')
      } else {
        return []
      }
    },
    ...mapState(['lang', 'isRead']),
  },
  data() {
    return {
      openWin: false,

      openForm: {
        matchBrokerName: '',
        symbolId: '',
        symbolName: '',
      },

      closeForm: {
        symbolId: '',
        remark: '',
      },

      closeWin: false,
      locale: this.$i18n.locale,
      tags: [],
      tagsMap: {},
      webconfig: {
        datatime: '',
      },
      options: {
        disabledDate(date) {
          return (
            date &&
            date.valueOf() >
              new Date(new Date().toLocaleDateString()).getTime() + 86400000 * 7
          )
        },
      },
      lastSymbolId: sessionStorage.lastSymbolId || '',
      allSybols: [],
      limitWin: false,
      currentRow: null,
      manageQuoteTokensWin: false,
      openApiWin: false,
      symbolData: [],
      sortWin: false,
      symbolsLoading: false,
      symbols: [],
      quoteTokens: [],
      markerAmountWin: false,
      markerAmountForm: [
        {
          id: '',
          orgId: '',
          accountId: '',
          symbolId: '',
        },
      ],
      loading: false,
      editIndex: null,
      viewData: {},
      viewWin: false,
      total: 0,
      loadingTable: true,

      whiteWin: false,
      searchForm: {
        current: 1,
        pageSize: 100,
        symbolName: '',
        exchangeId: '',
        category: 1,
        customerQuoteId: 'ALL',
      },
      errorUserIds: [],
      listData: [],

      whiteData: {
        userIds: '',
        bwType: 2,
        listType: '',
      },
      apiWhiteData: {
        userIds: '',
        symbolId: '',
      },

      settingsWin: false,
      settingsForm: {
        symbolId: '',
        exchangeId: '',
        switchType: '',
        remark: '',
        open: '',
        category: '',
        publishToken: false,
        publishTokenId: '',
        //页面展示左右
        typeText: '',
      },
      columns: [],
      defaultColumns: [
        {
          title: this.$lang('禁买'),
          slot: 'banBuyStatus',
          minWidth: 120,
        },
        {
          title: this.$lang('禁卖'),
          slot: 'banSellStatus',
          minWidth: 120,
        },
        {
          title: this.$lang('页面可见'),
          slot: 'showStatus',
          minWidth: 120,
        },
        {
          title: this.$lang('上架/下架'),
          slot: 'published',
          key: 'published',
          minWidth: 120,
          sortable: true,
        },
        {
          title: this.$lang('状态'),
          minWidth: 90,
          render: (h, params) => {
            let updateStatus = ''
            let status = {
              1: this.$lang('上架中'),
              2: this.$lang('上架失败'),
              3: this.$lang('下架中'),
              4: this.$lang('下架失败'),
            }
            if (params.row.updatingStatus == 0) {
              updateStatus = params.row.published
                ? this.$lang('已上架')
                : this.$lang('未上架')
            } else {
              updateStatus = status[params.row.updatingStatus]
            }
            return h('span', updateStatus)
          },
        },
        {
          title: this.$lang('API隐藏'),
          slot: 'hideFromOpenapi',
          key: 'hideFromOpenapi',
          minWidth: 120,
        },
        {
          title: this.$lang('禁止API交易'),
          slot: 'forbidOpenapiTrade',
          key: 'forbidOpenapiTrade',
          minWidth: 120,
        },
        {
          title: this.$lang('涨幅黑名单'),
          slot: 'filterTopStatus',
          minWidth: 120,
        },
        {
          title: this.$lang('计划委托可见'),
          slot: 'allowPlan',
          minWidth: 120,
        },
        {
          title: this.$lang('标签'),
          slot: 'tags',
          minWidth: 120,
        },
        {
          title: this.$lang('k线数据限制'),
          minWidth: 180,
          render: (h, params) =>
            h(
              'span',
              params.row.filterTime != 0
                ? this.newDate(params.row.filterTime).format()
                : this.$lang('不限制')
            ),
        },
        {
          title: this.$lang('操作'),
          minWidth: 100,
          align: 'center',
          render: (h, params) => {
            return h(
              'Button',
              {
                on: {
                  click: () => {
                    this.showKlineLimit(params.row)
                  },
                },
                attrs: {
                  size: 'small',
                  ghost: true,
                  type: 'primary',
                  disabled: this.isRead,
                },
              },
              this.$lang('设置')
            )
          },
        },
        {
          title: this.$lang('详情'),
          minWidth: 100,
          key: 'quoteTokenId',
          slot: 'detail',
          align: 'right',
        },
      ],
    }
  },
  created() {
    this.loadData()
    this.$axios
      .post('/api/v1/symbol/query_custom_labels', {
        endId: 0,
        fromId: 0,
        limit: 1000,
      })
      .then((result) => {
        if (result.code == 0) {
          let map = {}
          this.tags = result.data.map((el) => {
            let text = el.localeDetail[0].labelValue
            el.localeDetail.forEach((_el) => {
              if (_el.language == this.locale) {
                text = _el.labelValue
              }
            })

            return Object.assign(el, { text })
          })

          this.tags.forEach((el) => {
            map[el.labelId] = el
          })

          this.tagsMap = map
        }
      })
    this.$axios
      .post('/api/v1/symbol/query_cumstomer_quote_tokens')
      .then((result) => {
        if (result.code == 0) {
          this.quoteTokens = result.data
        }
      })
    this.$axios
      .post('/api/v1/symbol/query_cumstomer_quote_symbols', {
        customerQuoteId: '',
      })
      .then((result) => {
        if (result.code == 0) {
          this.allSybols = result.data
        }
      })
  },

  methods: {
    exist(row, index) {
      this.editIndex = index
      this.openForm.symbolName = row.symbolName
      if (row.transferStatus === 1) {
        this.openWin = true
        this.openForm.matchBrokerName = row.matchBrokerName
        this.openForm.symbolId = row.symbolId
      } else {
        this.closeWin = true
        this.closeForm.symbolId = row.symbolId
        this.closeForm.remark = ''
      }
    },

    open() {
      this.loading = true
      this.$axios
        .post('/api/v1/symbol/create_symbol_transfer', this.openForm)
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.loadData()
            this.openWin = false
            this.editIndex = null
          }
        })
    },
    close() {
      this.loading = true
      this.$axios
        .post('/api/v1/symbol/close_symbol_transfer', this.closeForm)
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.loadData()
            this.closeWin = false
            this.editIndex = null
          }
        })
    },
    objectStyle(row) {
      return row
        ? {
            color: row.colorCode,
            borderColor: row.colorCode,
          }
        : {}
    },
    changeTag(row) {
      this.$axios
        .post('/api/v1/symbol/edit_symbol_custom_label', {
          symbolId: row.symbolId,
          labelId: row.labelId,
        })
        .then((result) => {
          if (result.code == 0) {
            this.$Notice.success({
              title: this.$lang('成功'),
            })
          }
        })
    },
    showKlineLimit(row) {
      this.limitWin = true
      this.currentRow = row
      this.webconfig.datatime =
        row.filterTime == '0' ? '' : this.newDate(row.filterTime).format()
    },
    setKlineLimit() {
      this.loading = true
      this.$axios
        .post('/api/v1/symbol/edit_symbol_filter_time', {
          filterTime: this.webconfig.datatime
            ? this.webconfig.datatime.getTime()
            : 0,
          symbol: this.currentRow.symbolId,
        })
        .then((resp) => {
          this.loading = false
          if (resp.code === 0) {
            this.limitWin = false
            this.$Notice.success({
              title: this.$lang('成功'),
            })
            this.loadData()
          }
        })
    },
    rowClassName(row) {
      if (row.symbolId === this.lastSymbolId) {
        return 'demo-table-info-row'
      }
      return ''
    },
    remmoveSymbols(symbol) {
      this.symbols = this.symbols.filter((el) => el != symbol)
    },
    quoteTokensName(list) {
      let name = list[0].tabName
      list.forEach((el) => {
        if (el.locale == this.$i18n.locale) {
          name = el.tabName
        }
      })
      return name || list[0].locale
    },

    openQuoteTokens() {
      this.manageQuoteTokensWin = true
    },
    openApi() {
      this.openApiWin = true
    },
    doCreateApiWhite() {
      this.loading = true
      let uIds = ''
      if (this.apiWhiteData.userIds.trim()) {
        uIds = this.apiWhiteData.userIds.split('\n').join(',')
      }
      this.$axios
        .post('/api/v1/symbol/edit_api_config', {
          group: 'open.api.coin.symbol.white',
          key: this.apiWhiteData.symbolId,
          value: uIds,
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.openApiWin = false
            this.loadData()
          }
        })
    },
    changeCoinPair() {
      this.apiWhiteData.userIds = ''
      this.$axios
        .post('/api/v1/symbol/get_api_group_configs', {
          group: 'open.api.coin.symbol.white',
          key: this.apiWhiteData.symbolId,
        })
        .then((result) => {
          if (result.code == 0 && result.data.length) {
            this.apiWhiteData.userIds = result.data[0].value
              .split(',')
              .join('\n')
          }
        })
    },
    getSymbol() {
      this.symbolsLoading = true
      this.$axios
        .post('/api/v1/symbol/query_cumstomer_quote_symbols', {
          customerQuoteId: this.searchForm.customerQuoteId,
        })
        .then((result) => {
          this.symbolsLoading = false
          if (result.code == 0) {
            this.sortWin = true
            this.symbols = result.data
          }
        })
    },

    sortSymbol() {
      this.loading = true
      this.$axios
        .post('/api/v1/symbol/edit_cumstomer_quote_symbols', {
          customerQuoteId: this.searchForm.customerQuoteId,
          symbols: this.symbols,
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.sortWin = false
            this.loadData()
          }
        })
    },

    getAmount(row) {
      this.loading = true
      this.markerAmountWin = true
      this.markerAmountForm = [
        {
          accountId: '0',
          symbolId: row.symbolId,
        },
      ]
      this.$axios
        .post('/api/v1/broker/fee/query/symbol/market/account/list', {
          symbolId: row.symbolId,
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0 && result.data.length) {
            this.markerAmountForm = result.data
          }
        })
    },
    setMarkerAmount() {
      this.loading = true
      this.$axios
        .post('/api/v1/broker/fee/save/symbol/market/account', {
          symbolMarketAccountList: this.markerAmountForm.filter((el) => {
            if (!el.accountId) {
              el.accountId = 0
            }
            return el
          }),
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.markerAmountWin = false
          }
        })
    },
    filter(type) {
      let before = []
      let after = []
      let check = {}

      this.errorUserIds.forEach((el) => (check[el] = true))

      this.userIdsStr.forEach((el) => {
        if (check[el] || type == 'flag') {
          before.push(check[el] && type == 'flag' ? +el + ' <-----' : el)
        } else {
          after.push(el)
        }
      })
      if (type == 'flag') {
        this.whiteData.userIds = before.join('\n')
      } else if (type == 'clear') {
        this.whiteData.userIds = after.join('\n')
      } else {
        this.whiteData.userIds = [before.join('\n'), after.join('\n')].join(
          `\n↓↓↓↓↓↓↓↓↓↓↓↓↓${this.$lang('正常数据')}↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓\n`
        )
      }
      this.errorUserIds = []
    },
    loadUserList(listType) {
      this.whiteWin = true
      this.whiteData.listType = listType
      this.whiteData.userIds = ''
      this.loading = true
      this.$axios
        .post('/api/v1/symbol/get_bw_list_userids', this.whiteData)
        .then((result) => {
          if (result.code == 0) {
            this.loading = false
            this.whiteData.userIds = result.data.join('\n')
          }
        })
    },
    cancel() {
      this.listData = [...this.listData]
      this.editIndex = null
    },
    change(row, index, type) {
      this.settingsWin = true
      this.editIndex = index

      Object.assign(this.settingsForm, {
        exchangeId: row.exchangeId,
        category: this.searchForm.category,
        symbolId: row.symbolId,
        remark: '',
        typeText: '',
        publishToken: false,
        publishTokenId: '',
      })

      if (type == 'published') {
        if (row.published) {
          this.settingsForm.settingsUrl = '/api/v1/symbol/allow_publish'
          this.settingsForm.typeText = '上架'
        } else {
          this.settingsForm.typeText = '下架'
          this.settingsForm.settingsUrl = '/api/v1/symbol/forbid_publish'
        }
      } else if (type === 'hideFromOpenapi') {
        Object.assign(this.settingsForm, {
          settingsUrl: '/api/v1/symbol/hide_from_openapi',
          symbolId: row.symbolId,
          hideFromOpenapi: row[type],
          typeText: (row[type] ? '开启' : '关闭') + swTyps[types[type]],
        })
      } else if (type === 'forbidOpenapiTrade') {
        Object.assign(this.settingsForm, {
          settingsUrl: '/api/v1/symbol/forbid_openapi_trade',
          symbolId: row.symbolId,
          forbidOpenapiTrade: row[type],
          typeText: (row[type] ? '开启' : '关闭') + swTyps[types[type]],
        })
      } else {
        Object.assign(this.settingsForm, {
          settingsUrl: '/api/v1/symbol/symbol_switch',
          switchType: types[type],
          open: row[type],
          typeText: (row[type] ? '开启' : '关闭') + swTyps[types[type]],
        })
      }
    },
    view(row) {
      Object.assign(this.viewData, row)
      this.viewWin = true
    },
    search(page = 1) {
      this.searchForm.current = page
      this.loadData()
    },

    loadData() {
      this.columns = [
        {
          title: this.$lang('币对'),
          minWidth: 140,
          key: 'symbolId',
          sortable: true,
          align: 'right',
          slot: 'name',
        },
        ...this.defaultColumns,
      ]
      this.listData = []
      let json = Object.assign({}, this.searchForm)
      json.symbolName = json.symbolName.replace(/\//g, '')
      if (json.customerQuoteId == 'ALL') {
        json.customerQuoteId = ''
      }
      this.loadingTable = true
      this.$axios.post('/api/v1/symbol/query', json).then((result) => {
        this.loadingTable = false
        if (result.code === 0) {
          this.listData = result.data.list ? result.data.list : []
          this.total = result.data.total
          let ret = []
          result.data.list.forEach((item) => {
            ret.push(item)
          })
          this.symbolData = ret
        }
      })
    },

    settings() {
      this.loading = true
      this.$axios
        .post(this.settingsForm.settingsUrl, this.settingsForm)
        .then((result) => {
          this.lastSymbolId = this.settingsForm.symbolId
          sessionStorage.lastSymbolId = this.lastSymbolId
          this.loadData()
          this.loading = false
          if (result.code == 0) {
            this.editIndex = null
            this.settingsWin = false
          } else if (result.code == 100001) {
            this.settingsForm.publishToken = true
            this.settingsForm.publishTokenId = result.data
          }
        })
    },

    doCreateWhite() {
      this.loading = true
      let json = Object.assign({}, this.whiteData)
      if (json.userIds.trim()) {
        json.userIds = json.userIds.split('\n')
      } else {
        json.userIds = []
      }

      this.$axios.post('/api/v1/symbol/edit_bw_list', json).then((result) => {
        this.loading = false
        if (result.code == 0) {
          this.whiteWin = false
        } else {
          this.errorUserIds = result.data
        }
      })
    },
  },
}
</script>
