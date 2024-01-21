<template lang="pug">
.page-exchange
  Row.search(:gutter="20")
    Col(:span="6")
      Select(v-model="searchForm.index" filterable @on-change="changeIndex")
        Option(value="7") {{$lang("全部交易")}}-{{$lang("按用户")}}
        Option(value="8") {{$lang("全部交易")}}-{{$lang("按币种")}}
        Option(value="2") {{$lang("币币交易")}}-{{$lang("按用户")}}
        Option(value="1") {{$lang("币币交易")}}-{{$lang("按币种")}}
        Option(value="4") {{$lang("合约交易")}}-{{$lang("按用户")}}
        Option(value="3") {{$lang("合约交易")}}-{{$lang("按币种")}}
        Option(value="6") {{$lang("法币交易")}}-{{$lang("按用户")}}
        Option(value="5") {{$lang("法币交易")}}-{{$lang("按币种")}}
    Col(:span="6" v-if="searchForm.index==1||searchForm.index==3 ||searchForm.index==8")
      Select(v-model="searchForm.tokenId" filterable @on-change="change()")
        Option(v-for="item in symbols[searchForm.index]" :value="item" :key="item") {{item}}
    Col(:span="6" v-show="searchForm.index==5")
      Select(v-model="searchForm.symbolId" filterable @on-change="change()")
        Option(v-for="item in otcTokens" :value="item" :key="item") {{item}}
    Col(:span="6")
      DatePicker(type="daterange"  ,:options="dateRangeOptions", :editable="false" ,:placeholder="$lang('选择日期')"  format="yyyy-MM-dd" style="width:100%" v-model="tempDate", @on-change="change")
    Col(span="6")
      Button(:type="searchForm.timeUnit==='allTime'?'primary':'default'" long icon="md-checkmark-circle-outline" @click="allDate") {{$lang('全部时间')}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable" v-if='searchForm.index==2||searchForm.index==4 ||searchForm.index==6 ||searchForm.index==7')
  Table(:columns="columnsCurrncy", :data="listData" , :loading="loadingTable" v-if='searchForm.index==1||searchForm.index==3 ||searchForm.index==5 ||searchForm.index==8')
    div(style="padding-top:30px")
  ButtonGroup(v-if='searchForm.index==1||searchForm.index==4')
    Button(icon="md-skip-backward" @click="first"  :disabled="!searchForm.lastIndex")
    Button(icon="ios-arrow-forward" @click="next"  :disabled="listData.length<searchForm.pageSize")
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["tokens", "dateOptions","dateRangeOptions"])
  },
  data() {
    return {
      listData: [],
      loadingTable: true,
      maps: {},
      urls: {
        1: "/api/v1/ods/top_data/tradeFeeTopSpotToken",
        2: "/api/v1/ods/top_data/tradeFeeTopSpotAccountSum",
        3: "/api/v1/ods/top_data/tradeFeeTopContractToken",
        4: "/api/v1/ods/top_data/tradeFeeTopContractAccountSum",
        5: "/api/v1/ods/top_data/tradeFeeTopOtcToken",
        6: "/api/v1/ods/top_data/tradeFeeTopOtcAccountSum",
        7: "/api/v1/ods/top_data/tradeFeeTopAccountSum",
        8: "/api/v1/ods/top_data/tradeFeeTopToken",
      },
      symbols: {
        1: [],
        3: [],
        8: [],
      },
      otcTokens: [],
      searchForm: {
        pageSize: 100,
        lastIndex: 0,
        symbolId: "USDT",
        tokenId: "USDT",
        index: "7",
        startDate: "",
        endDate: "",
        timeUnit: '',
      },
      tempDate: [],
      columnsCurrncy: [
        {
          title: "#",
          type: "index",
          minWidth: 140
        },
        {
          title: this.$lang("币种"),
          minWidth: 140,
          key: "tokenId",
        },
        {
          title: this.$lang("数额"),
          minWidth: 140,
          key: "feeAmount"
        },
        {
          title: "accountId",
          minWidth: 140,
          key: "accountId",
          render: (h, params) =>
            h("Account", {
              props: {
                id: params.row.accountId
              }
            })
        }
      ],
      columns: [
        {
          title: "#",
          type: "index",
          minWidth: 140
        },
        {
          title: this.$lang("数额（折合USDT）"),
          minWidth: 140,
          key: "feeUsdtAmount"
        },
        {
          title: "accountId",
          minWidth: 140,
          key: "accountId",
          render: (h, params) =>
            h("Account", {
              props: {
                id: params.row.accountId
              }
            })
        }
      ],
      map: {},
      sourceData: {}
    };
  },
  methods: {
    next() {
      this.searchForm.lastIndex = this.listData[this.listData.length - 1].index;
      this.loadData();
    },
    first() {
      this.searchForm.lastIndex = 0;
      this.loadData();
    },
    changeIndex() {
      if (
        (this.searchForm.index == 1 || this.searchForm.index == 3 || this.searchForm.index == 8) &&
        this.symbols[this.searchForm.index].length
      ) {
        this.searchForm.tokenId = this.symbols[this.searchForm.index][0];

      } else if (this.searchForm.index == 5) {
        this.searchForm.symbolId = this.otcTokens[0];
      }
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      end.setTime(end.getTime() - 3600 * 1000 * 24);
      this.tempDate = [start,end];
      this.change();
    },
    change() {
      this.searchForm.lastIndex = 0;
      this.searchForm.timeUnit = '';
      this.loadData();
    },
    allDate() {
      this.tempDate = ['',''];
      this.searchForm.timeUnit = 'allTime';
      this.loadData();
    },
    loadData() {
      let json = Object.assign({}, this.searchForm);

      if (json.index != 1 && json.index != 3 && json.index != 8) {
        json.tokenId = "";
      }

      if (json.index != 5) {
        json.symbolId = "";
      }

      this.loadingTable = true;
      if (this.tempDate.length && this.tempDate[0] && this.tempDate[1]) {
        json.startDate = new Date(this.tempDate[0]).format("yyyy-MM-dd");
        json.endDate = new Date(this.tempDate[1]).format("yyyy-MM-dd");
      } else {
        json.startDate = '';
        json.endDate = '';
      }
      this.$axios.post(this.urls[this.searchForm.index], json).then(result => {
        this.loadingTable = false;
        this.listData = result.data;
      });
    },
    getSymbol(type) {
      this.$axios
        .post(
          "/api/v1/ods/top_data/symbolQuoteTokens/" +
            (type == 1 ? "spot" : "contract")
        )
        .then(result => {
          if (result.code == 0 && result.data.length) {
            this.symbols[type] = result.data;
            result.data.forEach(el => {
              this.maps[el] = el;
            });
            if (type == 1) {
              this.searchForm.tokenId = result.data[0];
              this.changeIndex();
            }
          }
        });
    }
  },
  created() {
    this.$axios.post("/api/v1/otc/config/otc_tokens").then(result => {
      if (result.code == 0) {
        this.otcTokens = result.data;
        result.data.forEach(el => {
          this.maps[el] = el;
        });
      }
    });
    [1, 3, 8].forEach(el => this.getSymbol(el));
  }
};
</script>