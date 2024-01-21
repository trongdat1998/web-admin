<style lang="less" scoped>
  .wrap {
    border: 1px dashed #dcdee2;
    padding: 15px;
  }
  .draggable {
    display: inline-block;
    padding: 8px 15px;
    border: 1px solid #dcdee2;
    margin: 8px;
    border-radius: 2px;
  }
  .border {
    border: 1px solid #ccc;
    display: inline-block;
    padding: 0 5px;
  }
</style>
<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="20")
      Input(
        search,
        :placeholder="$lang('合约简称')",
        v-model="searchForm.symbolName",
        enter-button="",
        @on-search="load"
      )
    Col(span="4")
      Button(
        long,
        :loading="symbolsLoading",
        :disabled="symbolsLoading || isRead",
        ghost,
        @click="getSymbol",
        type="primary"
      ) {{ $lang('合约排序') }}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
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
    template(slot-scope="{ row, index }", slot="name") {{ row.symbolName }}
      span.border(
        :style="objectStyle(tagsMap[row.labelId])",
        v-if="row.labelId > 1"
      ) {{ tagsMap[row.labelId].text }}
  Page(
    :total="total",
    :page-size="searchForm.pageSize",
    style="margin-top:20px;",
    @on-change="search",
    v-if="total > searchForm.pageSize",
    :current="searchForm.current"
  )
  // 开启/关闭交易所
  Modal(
    v-model="settingsWinStatus",
    :title="settingsTitle",
    footer-hide,
    width="300",
    @on-cancel="load"
  )
    div(style="padding:10px 0 20px") {{ $lang('您确定执行此操作吗？') }}
    Button(@click="settings", long, type="error", :loading="loading") {{ $lang('确定') }}
  Modal(v-model="viewWin", :title="$lang('详情')")
    List
      ListItem {{ $lang('合约') }}：
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
  Modal(v-model="sortWin", :title="$lang('排序')", width="800")
    Alert {{ $lang('选中后拖动鼠标进行排序') }}
    draggable.wrap(
      v-model="symbols",
      draggable=".draggable",
      style="overflow:hidden"
    )
      span.move.draggable(v-for="item in symbols") {{ item }}
    Button(
      long,
      type="success",
      @click="sortSymbol",
      :loading="loading",
      :disabled="loading",
      slot="footer"
    ) {{ $lang('确定') }}
  // 转发开启
  Modal(
    @on-cancel="cancel",
    v-model="openWin",
    :title="$lang('撮合券商')",
    footer-hide,
    width="300"
  )
    Input(v-model="openForm.matchBrokerName", :placeholder="$lang('请输入券商简称')")
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
    Input(
      v-model="closeForm.remark",
      :placeholder="$lang('请输入原因')",
      type="textarea",
      :rows="2"
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
  import { mapState } from 'vuex';
  import draggable from 'vuedraggable';
  export default {
    components: {
      draggable,
    },
    computed: {
      ...mapState(['height', 'isRead']),
    },
    data() {
      return {
        editIndex: null,
        openWin: false,

        openForm: {
          matchBrokerName: '',
          symbolId: '',
        },

        closeForm: {
          symbolId: '',
          remark: '',
        },

        closeWin: false,
        locale: this.$i18n.locale,
        tags: [],
        tagsMap: {},
        sortWin: false,
        symbolsLoading: false,
        symbols: [],
        markerAmountWin: false,
        markerAmountForm: [
          {
            id: '',
            orgId: '',
            accountId: '',
            symbolId: '',
          },
        ],
        viewData: {},
        viewWin: false,
        loading: false,
        total: 0,
        loadingTable: true,
        searchForm: {
          current: 1,
          pageSize: 100,
          symbolName: '',
        },
        listData: [],
        settingsTitle: '',
        settingsWinStatus: false,
        settingsUrl: '',
        settingsForm: {
          symbolId: '',
        },
        columns: [],
        defaultColumns: [
          {
            title: this.$lang('交易'),
            minWidth: 120,
            render: (h, params) => {
              return h('iSwitch', {
                props: {
                  value: params.row.allowTrade,
                  disabled: this.isRead,
                  size: 'small',
                },
                on: {
                  'on-change': (status) => {
                    this.settingsWinStatus = true;
                    this.settingsForm.symbolId = params.row.symbolId;
                    this.settingsForm.exchangeId = params.row.exchangeId;
                    if (status) {
                      this.settingsUrl = '/api/v1/swap/allow_trade';
                      this.settingsTitle = this.$lang('启用');
                    } else {
                      this.settingsUrl = '/api/v1/swap/forbid_trade';
                      this.settingsTitle = this.$lang('禁用');
                    }
                  },
                },
              });
            },
          },
          {
            title: this.$lang('页面可见'),
            minWidth: 120,
            render: (h, params) => {
              return h('iSwitch', {
                props: {
                  value: params.row.published,
                  disabled: this.isRead,
                  size: 'small',
                },
                on: {
                  'on-change': (status) => {
                    this.settingsWinStatus = true;
                    this.settingsForm.symbolId = params.row.symbolId;
                    this.settingsForm.exchangeId = params.row.exchangeId;
                    if (status) {
                      this.settingsUrl = '/api/v1/swap/allow_publish';
                      this.settingsTitle = this.$lang('启用');
                    } else {
                      this.settingsUrl = '/api/v1/swap/forbid_publish';
                      this.settingsTitle = this.$lang('禁用');
                    }
                  },
                },
              });
            },
          },
          {
            title: this.$lang('标签'),
            slot: 'tags',
            minWidth: 120,
          },
          {
            title: this.$lang('详情'),
            minWidth: 120,
            key: 'quoteTokenId',
            slot: 'detail',
            align: 'right',
          },
        ],
      };
    },
    created() {
      this.$axios
        .post('/api/v1/swap/query_custom_labels', {
          endId: 0,
          fromId: 0,
          limit: 1000,
        })
        .then((result) => {
          if (result.code == 0) {
            let map = {};
            this.tags = result.data.map((el) => {
              let text = el.localeDetail[0].labelValue;
              el.localeDetail.forEach((_el) => {
                if (_el.language == this.locale) {
                  text = _el.labelValue;
                }
              });

              return Object.assign(el, { text });
            });

            this.tags.forEach((el) => {
              map[el.labelId] = el;
            });

            this.tagsMap = map;
          }
        });
      this.load();
    },

    methods: {
      cancel() {
        this.listData = [...this.listData];
        this.editIndex = null;
      },
      exist(row, index) {
        this.editIndex = index;
        if (row.transferStatus === 1) {
          this.openWin = true;
          this.openForm.matchBrokerName = row.matchBrokerName;
          this.openForm.symbolId = row.symbolId;
        } else {
          this.closeWin = true;
          this.closeForm.symbolId = row.symbolId;
          this.closeForm.remark = '';
        }
      },

      open() {
        this.loading = true;
        this.$axios
          .post('/api/v1/swap/create_symbol_transfer', this.openForm)
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              this.load();
              this.openWin = false;
              this.editIndex = null;
            }
          });
      },
      close() {
        this.loading = true;
        this.$axios
          .post('/api/v1/swap/close_symbol_transfer', this.closeForm)
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              this.load();
              this.closeWin = false;
              this.editIndex = null;
            }
          });
      },
      objectStyle(row) {
        return {
          color: row.colorCode,
          borderColor: row.colorCode,
        };
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
              });
            }
          });
      },
      getSymbol() {
        this.symbolsLoading = true;
        this.$axios
          .post('/api/v1/swap/query_quote_symbols', {})
          .then((result) => {
            this.symbolsLoading = false;
            if (result.code == 0) {
              this.sortWin = true;
              this.symbols = result.data;
            }
          });
      },

      sortSymbol() {
        this.loading = true;
        this.$axios
          .post('/api/v1/swap/edit_quote_symbols', {
            symbols: this.symbols,
          })
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              this.sortWin = false;
              this.load();
            }
          });
      },
      getAmount(row) {
        this.loading = true;
        this.markerAmountWin = true;
        this.markerAmountForm = [
          {
            accountId: '0',
            symbolId: row.symbolId,
          },
        ];
        this.$axios
          .post('/api/v1/broker/fee/query/symbol/market/account/list', {
            symbolId: row.symbolId,
          })
          .then((result) => {
            this.loading = false;
            if (result.code == 0 && result.data.length) {
              this.markerAmountForm = result.data;
            }
          });
      },
      setMarkerAmount() {
        this.loading = true;
        this.$axios
          .post('/api/v1/broker/fee/save/symbol/market/account', {
            symbolMarketAccountList: this.markerAmountForm.filter((el) => {
              if (!el.accountId) {
                el.accountId = 0;
              }
              return el;
            }),
          })
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              this.markerAmountWin = false;
            }
          });
      },
      view(row) {
        Object.assign(this.viewData, row);
        this.viewWin = true;
      },
      search(page = 1) {
        this.searchForm.current = page;
        this.symbolsList();
        this.load();
      },

      load() {
        this.columns = [
          {
            title: this.$lang('合约名称'),
            minWidth: 120,
            key: 'quoteTokenId',
            sortable: true,
            slot: 'name',
          },
          ...this.defaultColumns,
        ];
        this.listData = [];
        let json = Object.assign({}, this.searchForm);
        json.symbolName = json.symbolName.replace(/\//g, '');
        this.loadingTable = true;
        this.$axios.post('/api/v1/swap/query', json).then((result) => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data.list ? result.data.list : [];
            this.total = result.data.total;
          }
        });
      },

      settings() {
        this.loading = true;
        this.$axios.post(this.settingsUrl, this.settingsForm).then((result) => {
          this.loading = false;
          if (result.code == 0) {
            this.settingsWinStatus = false;
            this.load();
          }
        });
      },
    },
  };
</script>
