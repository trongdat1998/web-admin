<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="20") &nbsp;
    Col(span="4")
      Button(
        long,
        type="primary",
        @click="newOne",
        :disabled="isRead",
        icon="md-add-circle",
        ghost
      ) {{ $lang('合约申请') }}
  Table.user-table(:loading="loading", :columns="columns", :data="listData")
  Modal(v-model="createWin", width="900")
    Form(:labelWidth="120", :disabled="isView")
      Row(:gutter="40")
        Col(span="24")
          Divider {{ $lang('基本信息') }}
          FormItem(:label="$lang('合约名称')")
            Alert
              Checkbox(
                v-for="(item, index) in formData.symbolNameLocaleList",
                v-model="item.enable",
                :key="index"
              ) {{ lang[item.locale] }}
        Col(span="12")
          FormItem(:label="$lang('合约类型')")
            RadioGroup(v-model="formData.isReverse", border)
              Radio(:label="0") {{ $lang('正向合约') }}
              Radio(:label="1") {{ $lang('反向合约') }}
          FormItem(:label="$lang('标的名称')")
            Select(
              size="default",
              v-model="formData.displayUnderlyingId",
              filterable
            )
              Option(
                v-for="item in tokens",
                :key="item.tokenId",
                :value="item.tokenId"
              ) {{ item.tokenName }}
          FormItem(:label="$lang('计价单位')")
            Select(size="default", v-model="formData.currency", filterable)
              Option(
                v-for="item in tokens",
                :key="item.tokenId",
                :value="item.tokenId"
              ) {{ item.tokenName }}
        Col(span="12")
          FormItem(
            :label="$lang('合约名称')",
            v-for="item in formData.symbolNameLocaleList",
            v-if="item.enable",
            :key="item.locale"
          )
            Input(
              v-model="item.name",
              :placeholder="$lang('合约名称') + '(' + lang[item.locale] + ')'"
            )
      Row(:gutter="40")
        Col(span="12")
          Divider {{ $lang('详细配置') }}
          FormItem(:label="$lang('最小交易量')")
            Input(v-model="formData.minTradeQuantity")
          FormItem(:label="$lang('数量精度')")
            Input(v-model="formData.basePrecision")
          FormItem(:label="$lang('价格精度')")
            Input(v-model="formData.minPricePrecision")
          FormItem(:label="$lang('保证金精度')")
            Input(v-model="formData.marginPrecision")

          FormItem(:label="$lang('合约乘数')")
            Input(v-model="formData.contractMultiplier")
          FormItem(:label="$lang('合并深度')")
            Input(
              v-model="formData.digitMergeList",
              :placeholder="$lang('用逗号分隔')"
            )
            div {{ $lang('例如') }} 0.01,0.001,0.0001
          FormItem(:label="$lang('杠杆范围')", :placeholder="$lang('用逗号分隔')")
            Input(v-model="formData.leverageRange")
            div {{ $lang('例如') }} 5,10,20
          FormItem(:label="$lang('超价浮动范围')")
            Row
              Col(span="11")
                Input(v-model="formData.overPriceUpRange")
                  span(slot="prepend") -
                  span(slot="append") %
              Col(span="2", style="text-align:center") -
              Col(span="11")
                Input(v-model="formData.overPriceDownRange", width="100%")
                  span(slot="prepend") +
                  span(slot="append") %
          FormItem(:label="$lang('市价浮动范围')")
            Row
              Col(span="11")
                Input(v-model="formData.marketPriceUpRange")
                  span(slot="prepend") -
                  span(slot="append") %
              Col(span="2", style="text-align:center") -
              Col(span="11")
                Input(v-model="formData.marketPriceDownRange", width="100%")
                  span(slot="prepend") +
                  span(slot="append") %
        Col(span="12")
          Divider {{ $lang('风险限额') }}
          .item(v-for="(item, index) in formData.riskLimitList")
            FormItem(:label="$lang('基本风险限额')")
              Input(v-model="item.riskLimitAmount")
                span(slot="append") {{ $lang('张') }}
            FormItem(:label="$lang('递增维持保证金')")
              Input(v-model="item.maintainMargin")
                span(slot="append") %
            FormItem(:label="$lang('递增起始保证金')")
              Input(v-model="item.initialMargin")
                span(slot="append") %
            FormItem(:label="$lang('最大杠杆')")
              Input(:value="daoshu(item.initialMargin)", readonly)
                span(slot="append") M
            FormItem
              Button(
                type="error",
                size="small",
                long,
                @click="removeRisk(index)"
              ) {{ $lang('删除') }}
          Button(@click="addRisk", long, size="small") {{ $lang('新增') }}
    Button(
      type="primary",
      size="default",
      long,
      @click="handleAdd",
      :disabled="loading",
      :loading="loading",
      slot="footer"
    ) {{  formData.state === "" ? $lang('申请'):$lang('确定')  }}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["lang", "isRead", "tokens"]),
    isView() {
      return this.formData.state === 1 || this.formData.state === 0;
    },
  },
  data() {
    return {
      createWin: false,
      columns: [
        {
          title: this.$lang("申请时间"),
          minWidth: 160,
          sortable: true,
          sortType: "desc",
          key: "createdAt",
          render: (h, params) =>
            h(
              "span",
              this.newDate(params.row.createdAt).format()
            ),
        },
        {
          minWidth: 160,
          title: this.$lang("合约ID"),
          key: "symbolId",
        },

        {
          title: this.$lang("合约名称"),
          minWidth: 160,
          key: "symbolName",
          render: (h, params) => {
            let text = "";
            params.row.symbolNameLocaleList.filter((el) => {
              if (!text && el.locale === "en-us") {
                text = el.name;
              }
              if (el.locale == this.$i18n.locale) {
                text = el.name;
              }
            });
            return h("span", text);
          },
        },
        {
          minWidth: 160,
          title: this.$lang("状态"),
          key: "state",
          render: (h, params) => {
            let color = "default";
            let text = "申请中";
            if (params.row.state === 1) {
              color = "primary";
              text = "已通过";
            } else if (params.row.state === 2) {
              color = "error";
              text = "已拒绝";
            }
            return h(
              "Tag",
              {
                attrs: {
                  color,
                },
              },
              this.$lang(text)
            );
          },
        },
        {
          minWidth: 80,
          title: this.$lang("操作"),
          render: (h, params) => {
            return h(
              "a",
              {
                on: {
                  click: () => {
                    this.newOne();
                    let symbolNameLocaleList = [];

                    this.formData.symbolNameLocaleList.forEach((el) => {
                      let temp = params.row.symbolNameLocaleList.filter(
                        (_el) => el.locale == _el.locale
                      );

                      if (temp.length) {
                        temp[0].enable = temp[0].name ? true : false;
                        symbolNameLocaleList.push(Object.assign(el, temp[0]));
                      } else {
                        symbolNameLocaleList.push(el);
                      }
                    });

                    Object.assign(this.formData, params.row, {
                      symbolNameLocaleList: symbolNameLocaleList,
                    });
                  },
                },
              },
              this.$lang(params.row.state === 2 ? "修改" : "查看")
            );
          },
        },
      ],
      listData: [],
      loading: false,
      formData: {
        id: "",
        state: "",
        minTradeAmount: "",
        displayUnderlyingId: "",
        minTradeQuantity: "",
        digitMergeList: "",
        basePrecision: "",
        minPricePrecision: "",
        currency: "",
        contractMultiplier: "",
        leverageRange: "",
        overPriceUpRange: "",
        overPriceDownRange: "",
        marketPriceDownRange: "",
        marketPriceUpRange: "",
        isPerpetualSwap: 1,
        isReverse: 1,
        marginPrecision: "",
        symbolNameLocaleList: [],
        riskLimitList: [],
      },
    };
  },
  methods: {
    addRisk() {
      this.formData.riskLimitList.push({
        riskLimitAmount: "",
        maintainMargin: "",
        initialMargin: "",
      });
    },
    removeRisk(index) {
      this.formData.riskLimitList = this.formData.riskLimitList.filter(
        (el, _index) => index != _index
      );
    },
    newOne() {
      this.createWin = true;
      Object.assign(this.formData, {
        id: "",
        state: "",
        minTradeAmount: "",
        displayUnderlyingId: "",
        minTradeQuantity: "",
        digitMergeList: "",
        basePrecision: "",
        minPricePrecision: "",
        currency: "",
        contractMultiplier: "",
        leverageRange: "",
        overPriceUpRange: "",
        overPriceDownRange: "",
        marketPriceDownRange: "",
        marketPriceUpRange: "",
        isPerpetualSwap: 1,
        isReverse: 1,
        marginPrecision: "",
        symbolNameLocaleList: [],
        riskLimitList: [],
      });

      Object.keys(this.lang).forEach((el) => {
        if (el != "ko-kr") {
          this.formData.symbolNameLocaleList.push({
            locale: el,
            name: "",
            enable: el === this.$i18n.locale,
          });
        }
      });
    },
    daoshu(n) {
      return n ? 100 / n : 0;
    },
    handleAdd() {
      this.loading = true;
      if (this.formData.state === 1 || this.formData.state === 0) {
        this.loading = false;
        return (this.createWin = false);
      }
      this.$axios
        .post("/api/v1/swap/apply_contract_symbol", this.formData)
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            this.createWin = false;
            this.load();
          }
        });
    },
    load() {
      this.$axios
        .post("/api/v1/swap/contract_symbol_apply_list", {
          current: 1,
          pageSize: 1000,
        })
        .then((result) => {
          if (result.code == 0) {
            this.listData = result.data.list;
          }
        });
    },
  },
  created() {
    this.load();
  },
};
</script>
