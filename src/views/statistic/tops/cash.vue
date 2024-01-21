<template lang="pug">
.page-exchange
  Row.search(:gutter="20")
    Col(:span="6")
      Select(v-model="searchForm.index" filterable @on-change="change()")
        Option(value="1") {{$lang("充值")}}-{{$lang("按用户")}}
        Option(value="2") {{$lang("充值")}}-{{$lang("按币种")}}
        Option(value="3") {{$lang("提现")}}-{{$lang("按用户")}}
        Option(value="4") {{$lang("提现")}}-{{$lang("按币种")}}
    Col(:span="6" v-show="searchForm.index==2||searchForm.index==4")
      Select(v-model="searchForm.tokenId" filterable @on-change="change()")
        Option(v-for="item in tokens" ,:value="item.tokenId" ,:key="item.tokenId") {{item.tokenName}}
    Col(:span="6")
      <!--DatePicker(type="date" ,:options="dateOptions" style="width:100%" ,:value="searchForm.date" ,@on-change="change")-->
      DatePicker(type="daterange"  ,:options="dateRangeOptions", :editable="false" ,:placeholder="$lang('选择日期')"  format="yyyy-MM-dd" style="width:100%" v-model="tempDate", @on-change="change")
    Col(span="6")
      Button(:type="searchForm.timeUnit==='allTime'?'primary':'default'" long icon="md-checkmark-circle-outline" @click="allDate") {{$lang('全部时间')}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable" v-if='searchForm.index==1||searchForm.index==3')
  Table(:columns="columnsCurrncy", :data="listData" , :loading="loadingTable" v-if='searchForm.index==2||searchForm.index==4')
  div(style="padding-top:30px")
  ButtonGroup(v-if='searchForm.index==2||searchForm.index==4')
    Button(icon="md-skip-backward" ,@click="first"  ,:disabled="!searchForm.lastIndex")
    Button(icon="ios-arrow-forward" ,@click="next"  ,:disabled="listData.length<searchForm.pageSize")
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
      urls: {
        1: "/api/v1/ods/top_data/dwTopDepositAccountSum",
        2: "/api/v1/ods/top_data/dwTopDepositToken",
        3: "/api/v1/ods/top_data/dwTopWithdrawalAccountSum",
        4: "/api/v1/ods/top_data/dwTopWithdrawalToken"
      },
      searchForm: {
        pageSize: 100,
        lastIndex: 0,
        tokenId: "USDT",
        index: "1",
        startDate: "",
        endDate: "",
        timeUnit: '',
      },
      tempDate: [],
      columns: [
        {
          title: "#",
          type: "index",
          minWidth: 140
        },
        {
          title: this.$lang("数额（折合USDT）"),
          minWidth: 140,
          key: "usdtAmount"
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
                key: "amount"
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
      this.loadingTable = true;
      if (this.tempDate.length && this.tempDate[0] && this.tempDate[1]) {
        this.searchForm.startDate = new Date(this.tempDate[0]).format("yyyy-MM-dd");
        this.searchForm.endDate = new Date(this.tempDate[1]).format("yyyy-MM-dd");
      } else {
        this.searchForm.startDate = '';
        this.searchForm.endDate = '';
      }
      this.$axios
        .post(this.urls[this.searchForm.index], this.searchForm)
        .then(result => {
          this.loadingTable = false;
          this.listData = result.data;
        });
    }
  },
  created() {
    const end = new Date();
    const start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
    end.setTime(end.getTime() - 3600 * 1000 * 24);
    this.tempDate = [start,end];
    this.change();
  }
};
</script>