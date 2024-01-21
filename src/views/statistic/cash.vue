<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="6")
      Button(:type="searchForm.timeUnit==='H'?'primary':'default'" long icon="md-checkmark-circle-outline" @click="last24H") {{$lang('最近24小时')}}
    Col(span="6")
      DatePicker(type="daterange" :options="dateRangeOptions", :editable="false" :placeholder="$lang('选择日期')" format="yyyy-MM-dd" style="width:100%" v-model="tempDate", @on-change="changeDate" )
    Col(span="6")
      Select(@on-change="formDatas" v-model="token" filterable)
        Option(value="ALL") {{$lang('全部')}}
        Option(v-for="item in tokens" :value="item" :key="item") {{item}} 
  Row(:gutter="15")
    Col(style="position: relative;" span="24")
      canvas(id="myChart" height="80")
  Table(:columns="columns", :data="listData" , :loading="loadingTable")

</template>
<script>
import Chart from "chart.js";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["backgroundColor", "borderColor","dateRangeOptions"])
  },
  data() {
    return {
      //type: "deposit.token",
      token: "ALL",

      tokens: [],
      listData: [],

      lineChart: null,
      tempDate: [],
      loadingTable: true,
      searchForm: {
        group: "deposit.withdraw.token.group",
        timeUnit: "H",
        startTime: "",
        endTime: ""
      },
      formData: {},
      columns: [
        {
          title: this.$lang("日期"),
          minWidth: 140,
          key: "d"
        },
        {
          title: this.$lang("充值次数"),
          minWidth: 160,
          key: "no",
          chart: true
        },
        {
          title: this.$lang("提现次数"),
          minWidth: 160,
          key: "rno",
          chart: true
        },
        {
          title: this.$lang("充值人数"),
          minWidth: 140,
          key: "uc",
          chart: true
        },
        {
          title: this.$lang("提现人数"),
          minWidth: 140,
          key: "ruc",
          chart: true
        },
        {
          title: this.$lang("充值数量"),
          minWidth: 140,
          key: "q",
          chart: true,
          render: (h, params) =>
            h(
              "span",
              this.token === "ALL" ? "---" : params.row.q.cutFixed(2) * 1
            )
        },
        {
          title: this.$lang("提现数量"),
          minWidth: 140,
          key: "rq",
          chart: true,
          render: (h, params) =>
            h(
              "span",
              this.token === "ALL" ? "---" : params.row.rq.cutFixed(2) * 1
            )
        },
        {
          title: this.$lang("充值折合") + "USDT",
          minWidth: 140,
          key: "u",
          chart: true,
          render: (h, params) => h("span", params.row.u.cutFixed(2) * 1)
        },
        {
          title: this.$lang("提现折合") + "USDT",
          minWidth: 140,
          key: "ru",
          chart: true,
          render: (h, params) => h("span", params.row.ru.cutFixed(2) * 1)
        }
      ],
      sourceData: {}
    };
  },
  methods: {
    changeDate() {
      this.token = "ALL";
      this.searchForm.timeUnit = "d";
      this.loadData();
    },
    last24H() {
      this.token = "ALL";
      this.tempDate = [];
      this.searchForm.timeUnit = "H";
      this.loadData();
    },
    changeType() {
      this.token = "ALL";
      this.formDatas();
    },
    renderLine(labels, data) {
      let config = {
        type: "line",
        data: {
          labels: labels,
          datasets: data
        },
        options: {
          responsive: true,
          tooltips: {
            mode: "index",
            intersect: false
          },
          hover: {
            mode: "nearest",
            intersect: true
          },
          scales: {
            yAxes: [
              {
                type: "linear",
                display: true,
                position: "left",
                id: "y-axis-1",
                ticks: {
                  beginAtZero: true
                }
              },
              {
                type: "linear",
                display: true,
                position: "right",
                id: "y-axis-2",

                // grid line settings
                gridLines: {
                  drawOnChartArea: false // only want the grid lines for one axis to show up
                },
                ticks: {
                  beginAtZero: true
                }
              }
            ]
          }
        }
      };
      if (this.lineChart) {
        this.lineChart.config = config;
        this.lineChart.update();
      } else {
        this.lineChart = new Chart(
          document.getElementById("myChart").getContext("2d"),
          config
        );
      }
    },

    formDatas() {
      //列表数据
      let listData = [];

      //绘图数据
      let labels = [];
      let data = [];
      let index = 0;

      this.columns.forEach(el => {
        if (el.chart) {
          let tmp = {};

          // 全部下使用折合数量
          if (this.token === "ALL" && el.key !== "q" && el.key !== "rq") {
            Object.assign(tmp, el);

            // 非全部下使用交易数量
          } else if (
            this.token !== "ALL" &&
            el.key !== "u" &&
            el.key !== "ru"
          ) {
            Object.assign(tmp, el);
          }

          if (tmp.title) {
            data.push({
              label: tmp.title,
              borderColor: this.borderColor[
                index % this.backgroundColor.length
              ],
              fill: false,
              hidden: tmp.key === "uc" || tmp.key === "ruc",
              data: [],
              key: tmp.key,
              yAxisID:
                tmp.key === "q" ||
                tmp.key === "u" ||
                tmp.key === "rq" ||
                tmp.key === "ru"
                  ? "y-axis-2"
                  : "y-axis-1"
            });
            index++;
          }
        }
      });

      let json = this.sourceData[this.token];
      if (json) {
        let loopData = json.deposit || json.withdrawal;

        loopData.forEach((el, index) => {
          //表格数据
          let tmp = {
            d: "0",
            q: "0",
            rq: "0",
            a: "0",
            ra: "0",
            no: 0,
            rno: 0,
            u: "0",
            ru: "0",
            uc: 0,
            ruc: 0
          };

          if (json.deposit && json.deposit[index]) {
            Object.assign(tmp, json.deposit[index], {
              d:
                this.searchForm.timeUnit == "H"
                  ? new Date(Number(json.deposit[index].d)).format("hh:mm")
                  : json.deposit[index].d
            });
          }

          if (json.withdrawal && json.withdrawal[index]) {
            let w = json.withdrawal[index];
            Object.assign(tmp, {
              rq: w.q || "0",
              ra: w.a || "0",
              rno: w.no || 0,
              ru: w.u || "0",
              ruc: w.uc || 0,
              d:
                this.searchForm.timeUnit == "H"
                  ? new Date(Number(w.d)).format("hh:mm")
                  : w.d
            });
          }

          listData.unshift(tmp);

          //绘图数据
          data.forEach(_el => {
            _el.data.push(tmp[_el.key]);
          });
          labels.push(tmp.d);
        });
      }

      this.listData = listData;
      this.renderLine(labels, data);
    },
    loadData() {
      this.loadingTable = true;
      this.sourceData = {};
      this.tokens = [];

      if (this.tempDate.length&&this.tempDate[0]&&this.tempDate[1]) {
        this.searchForm.startTime = new Date(this.tempDate[0]).format(
          "yyyy-MM-dd"
        );
        this.searchForm.endTime = new Date(this.tempDate[1]).format(
          "yyyy-MM-dd"
        );
      } else {
        this.searchForm.startTime = "";
        this.searchForm.endTime = "";
      }

      this.$axios
        .post("/api/v1/ods/token/cash", this.searchForm)
        .then(result => {
          this.loadingTable = false;

          if (result.code === 0 && result.data) {
            let deposit =
              result.data["deposit.token." + this.searchForm.timeUnit];
            let withdrawal =
              result.data["withdrawal.token." + this.searchForm.timeUnit];

            Object.keys(Object.assign({}, deposit, withdrawal)).forEach(el => {
              this.tokens.push(el);
              this.sourceData[el] = {
                deposit: deposit[el],
                withdrawal: withdrawal[el]
              };
            });
            this.formDatas();
          }
        });
    }
  },
  created() {
    this.loadData();
  }
};
</script>