<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="searchForm.exchangeId" @on-change="loadData" :placeholder="$lang('选择交易所')")
        Option(v-for="item in exchangList", :value="item.exchangeId", , :key="item.exchangeId+item.exchangeName") {{item.exchangeName}}
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
  Modal.page-exchange-win(v-model="settingsWin", :title="$lang('修改费率')" :footer-hide="isRead")
    Form(:model='formData', :labelWidth="120")
      FormItem(:label="$lang('币对')")
        Input(v-model='formData.symbolId', disabled)
      FormItem(:label="$lang('Maker买费率')")
        Input(v-model='formData.makerBuyFee', :placeholder="$lang('Maker买费率')" :maxlength="8")
          span(slot="suffix" style="line-height:32px;") %
      FormItem(:label="$lang('Maker卖费率')")
        Input(v-model='formData.makerSellFee', :placeholder="$lang('Maker买费率')" :maxlength="8")
          span(slot="suffix" style="line-height:32px;") %
      FormItem(:label="$lang('Taker买费率')")
        Input(v-model='formData.takerBuyFee', :placeholder="$lang('Taker买费率')" :maxlength="8")
          span(slot="suffix" style="line-height:32px;") %
      FormItem(:label="$lang('Taker卖费率')")
        Input(v-model='formData.takerSellFee', :placeholder="$lang('Taker买费率')" :maxlength="8")
          span(slot="suffix" style="line-height:32px;") %
    Button(slot='footer'  @click="doSet", :loading="loading" :disabled="loading") {{$lang('确定')}}
</template>
<script>
import { mapState } from "vuex";
export default {
   computed: {
    ...mapState(["isRead"])
  },
  data() {
    return {
      loading: false,
      loadingTable: true,
      settingsWin: false,
      exchangList: [],
      listData: [],
      searchForm: {
        category: 4,
        exchangeId: "",
        pageSize: 500
      },
      formData: {
        id: "",
        exchangeId: "",
        symbolId: "",
        makerBuyFee: "",
        makerSellFee: "",
        takerBuyFee: "",
        takerSellFee: ""
      },
      columns: [
        {
          title: this.$lang("ID"),
          minWidth: 80,
          key: "id",
        },
        {
          title: this.$lang("币对"),
          minWidth: 160,
          key: "symbolId"
        },
        {
          title: this.$lang("Maker买费率"),
          minWidth: 160,
          key: "makerBuyFee",
          render: (h, p) => h("span", p.row.makerBuyFee + "%")
        },
        {
          title: this.$lang("Maker卖费率"),
          minWidth: 160,
          key: "makerSellFee",
          render: (h, p) => h("span", p.row.makerSellFee + "%")
        },
        {
          title: this.$lang("Taker买费率"),
          minWidth: 160,
          key: "takerBuyFee",
          render: (h, p) => h("span", p.row.takerBuyFee + "%")
        },
        {
          title: this.$lang("Taker卖费率"),
          minWidth: 160,
          key: "takerSellFee",
          render: (h, p) => h("span", p.row.takerSellFee + "%")
        },
        {
          title: this.$lang("操作"),
          fixed: "right",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h(
              "a",
              {
                on: {
                  click: () => {
                    this.settingsWin = true;
                    Object.keys(this.formData).forEach(el => {
                      this.formData[el] = params.row[el];
                    });
                    this.formData.exchangeId = this.searchForm.exchangeId;
                  }
                }
              },
              this.isRead ? this.$lang("查看") : this.$lang("修改")
            );
          }
        }
      ]
    };
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      this.$axios
        .post(
          "/api/v1/broker/fee/query/symbol/fee/config/list",
          this.searchForm
        )
        .then(result => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data;
          }
        });
    },
    doSet() {
      this.loading = true;
      this.$axios
        .post("/api/v1/broker/fee/add/symbol/config", this.formData)
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.loadData();
            this.settingsWin = false;
          }
        });
    }
  },
  created() {
    this.$axios.get("/api/v1/exchange/list").then(result => {
      if (result.data && result.data[0]) {
        this.exchangList = result.data;
        this.searchForm.exchangeId = result.data[0].exchangeId;
      }
      this.loadData();
    });
  }
};
</script>
