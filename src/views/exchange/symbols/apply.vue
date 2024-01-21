<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="20") &nbsp;
    Col(span="4")
      Button(
        long,
        type="primary",
        @click="handleBtnAdd",
        :disabled="isRead",
        icon="md-add-circle",
        ghost
      ) {{ $lang('币对申请') }}
  Table(:loading="loading", :columns="columns", :data="listData")
  Page(
    :total="total",
    :page-size="searchForm.pageSize",
    style="margin-top:20px;",
    @on-change="load",
    v-if="total > searchForm.pageSize"
  )
  Modal(
    v-model="addWin",
    :title="$lang('币对申请')",
    @on-ok="handleTabsAdd",
    width="800",
    footer-hide,
    :mask-closable="false"
  )
    Form(:model="formData", :labelWidth="160")
      FormItem(:label="$lang('币对')")
        Tag(v-if="formData.id") {{ formData.baseToken }} / {{ formData.quoteToken }}
        template(v-else)
          Select(
            size="default",
            v-model="formData.baseToken",
            style="width:150px",
            filterable
          )
            Option(
              v-for="item in tokens",
              :key="item.tokenId",
              :value="item.tokenId"
            ) {{ item.tokenName }}
          |  - 
          Select(
            size="default",
            v-model="formData.quoteToken",
            style="width:150px",
            filterable
          )
            Option(
              v-for="item in tokens",
              :key="item.tokenId",
              :value="item.tokenId"
            ) {{ item.tokenName }}
      FormItem(:label="$lang('价格精度')")
        Input(
          size="default",
          v-model="formData.minPricePrecision",
          placeholder="minPricePrecision"
        )
          span(slot="append") {{ formData.quoteToken }}
        div {{ $lang('最小价格精度建议不大于8位。示例：0.01') }}
      FormItem(:label="$lang('数量精度')")
        Input(
          size="default",
          v-model="formData.basePrecision",
          placeholder="basePrecision"
        )
          span(slot="append") {{ formData.baseToken }}
        div {{ $lang('挂单数量的精度，同时用于市价卖单；撮合最小成交量。示例：0.01') }}
      FormItem(:label="$lang('最小交易数量')")
        Input(
          size="default",
          v-model="formData.minTradeQuantity",
          placeholder="minTradeQuantity"
        )
          span(slot="append") {{ formData.baseToken }}
        div {{ $lang('挂单数量的最小数量，最小数量控制在0.5$附近。示例：0.01') }}
      FormItem(:label="$lang('交易额精度')")
        Input(
          size="default",
          v-model="formData.quotePrecision",
          placeholder="quotePrecision"
        )
          span(slot="append") {{ formData.quoteToken }}
        div {{ $lang('交易额的精度，仅市价买单使用。示例：0.01') }}
      FormItem(:label="$lang('最小交易额')")
        Input(
          size="default",
          v-model="formData.minTradeAmt",
          placeholder="minTradeAmount"
        )
          span(slot="append") {{ formData.quoteToken }}
        div {{ $lang('只限制市价买单最小交易额。示例：0.01') }}
      FormItem(:label="$lang('深度合并')")
        Input(
          size="default",
          v-model="formData.mergeDigitDepth",
          :placeholder="$lang('(非必填)多个深度合并，用逗号分隔')"
        )
      Button(
        type="primary",
        size="default",
        long,
        @click="handleTabsAdd",
        :loading="loading"
      ) {{ $lang('申请') }}
</template>
<script>
import { mapState } from 'vuex'
export default {
  created() {
    this.load(1)
  },
  computed: {
    ...mapState(['isRead', 'tokens']),
  },
  data() {
    return {
      addWin: false,
      formData: {
        id: '',
        symbolId: '',
        baseToken: '',
        quoteToken: '',
        minPricePrecision: '',
        basePrecision: '',
        minTradeQuantity: '',
        quotePrecision: '',
        minTradeAmt: '',
        mergeDigitDepth: '',
      },
      loading: false,
      searchForm: {
        current: 1,
        pageSize: 100,
        category: 1,
      },
      total: 0,
      listData: [],

      columns: [
        {
          title: this.$lang('币对'),
          minWidth: 160,
          key: 'quoteTokenId',
          sortable: true,
          sortType: 'asc',
          render: (h, p) => h('span', p.row.baseToken + '/' + p.row.quoteToken),
        },
        {
          title: this.$lang('最小价格精度'),
          minWidth: 160,
          key: 'minPricePrecision',
        },
        {
          title: this.$lang('最小数量精度'),
          minWidth: 160,
          key: 'basePrecision',
        },
        {
          title: this.$lang('最小交易额'),
          minWidth: 160,
          key: 'minTradeAmt',
        },
        {
          title: this.$lang('最小交易数量'),
          minWidth: 160,
          key: 'minTradeQuantity',
        },
        {
          title: this.$lang('交易额精度'),
          minWidth: 160,
          key: 'quotePrecision',
        },
        {
          minWidth: 160,
          title: this.$lang('状态'),
          key: 'state',
          render: (h, params) => {
            let color = 'default'
            let text = '申请中'
            if (params.row.state === 1) {
              color = 'primary'
              text = '已通过'
            } else if (params.row.state === 2) {
              color = 'error'
              text = '已拒绝'
            }
            return h(
              'Tag',
              {
                attrs: {
                  color,
                },
              },
              this.$lang(text)
            )
          },
        },
        {
          minWidth: 80,
          title: this.$lang('操作'),
          fixed: 'right',
          render: (h, params) => {
            if (params.row.state === 0) {
              return h('span', '----')
            }
            return h(
              'a',
              {
                on: {
                  click: () => {
                    this.addWin = true
                    Object.assign(this.formData, params.row)
                  },
                },
              },
              this.$lang('修改')
            )
          },
        },
      ],
    }
  },
  methods: {
    handleBtnAdd() {
      this.addWin = true
      Object.keys(this.formData).forEach((el) => {
        this.formData[el] = ''
      })
    },
    handleTabsAdd() {
      !this.loading &&
        this.$axios
          .post('/api/v1/symbol/apply_spot_symbol', this.formData)
          .then((result) => {
            this.loading = false
            if (result.code === 0) {
              this.addWin = false
              this.$Notice.success({
                title: this.$lang(this.formData.id ? '修改成功' : '申请成功'),
              })
              this.load(1)
            }
          })
      this.loading = true
    },
    load(page = 1) {
      this.loading = true
      this.searchForm.current = page
      this.listData = []

      this.$axios
        .post('/api/v1/symbol/spot_symbol_apply_list', this.searchForm)
        .then((result) => {
          this.loading = false
          this.listData = result.data.list ? result.data.list : []
          this.total = result.data.total
        })
    },
  },
}
</script>
