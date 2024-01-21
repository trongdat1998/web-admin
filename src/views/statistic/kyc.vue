<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="6")
      DatePicker(type="daterange"  :options="dateRangeOptions", :editable="false" :placeholder="$lang('选择日期')"  format="yyyy-MM-dd" style="width:100%" v-model="tempDate", @on-change="loadData")
  Row(:gutter="15")
    Col(style="position: relative;" span="15")
      canvas(id="myChart")
    Col(style="position: relative;" span="9")
      canvas(id="myChart2" height="230")
  Alert(style="margin-top:15px;line-height:30px")
    Row(:gutter="15")
      Col(span="6") {{$lang('通过总数')}}：{{aggerateStatistic.passedKycNumber}}
      Col(span="6") {{$lang('PC通过总数')}}：{{aggerateStatistic.pcPassedKycNumber}}
      Col(span="6") {{$lang('Android通过总数')}}：{{aggerateStatistic.androidPassedKycNumber}}
      Col(span="6") {{$lang('IOS通过总数')}}：{{aggerateStatistic.iosPassedKycNumber}}
    Row(:gutter="15")
      Col(span="6") {{$lang('未通过总数')}}：{{aggerateStatistic.rejectKycNumber}}
      Col(span="6") {{$lang('PC未通过总数')}}：{{aggerateStatistic.pcRejectKycNumber}}
      Col(span="6") {{$lang('Android未通过总数')}}：{{aggerateStatistic.androidRejectKycNumber}}
      Col(span="6") {{$lang('IOS未通过总数')}}：{{aggerateStatistic.iosRejectKycNumber}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable")

</template>
<script>
import Chart from "chart.js";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["backgroundColor", "borderColor", "dateRangeOptions"])
  },
  data() {
    return {
      lineChart: null,
      pieChart: null,
      tempDate: [
        new Date(new Date().getTime() - 30 * 86400000).format("yyyy-MM-dd"),
        new Date().format("yyyy-MM-dd")
      ],
      loadingTable: true,
      searchForm: {
        beginDate: "0",
        endDate: "0",
        type: "0"
      },
      aggerateStatistic: {},
      formData: {},
      columns: [
        {
          title: this.$lang("日期"),
          minWidth: 140,
          key: "statisticDate"
        },
        {
          title: this.$lang("通过总数"),
          minWidth: 140,
          key: "passedKycNumber",
          chart: true
        },
        {
          title: this.$lang("未通过总数"),
          minWidth: 140,
          key: "rejectKycNumber",
          chart: true
        },
        {
          title: this.$lang("PC通过总数"),
          minWidth: 140,
          key: "pcPassedKycNumber",
          chart: true
        },
        {
          title: this.$lang("PC未通过总数"),
          minWidth: 140,
          key: "pcRejectKycNumber",
          chart: true
        },
        {
          title: this.$lang("Android通过总数"),
          minWidth: 160,
          key: "androidPassedKycNumber",
          chart: true
        },
        {
          title: this.$lang("Android未通过总数"),
          minWidth: 190,
          key: "androidRejectKycNumber",
          chart: true
        },
        {
          title: this.$lang("IOS通过总数"),
          minWidth: 140,
          key: "iosPassedKycNumber",
          chart: true
        },
        {
          title: this.$lang("IOS未通过总数"),
          minWidth: 140,
          key: "iosRejectKycNumber",
          chart: true
        }
      ],
      listData: []
    };
  },
  methods: {
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
    renderPie() {
      let config = {
        type: "doughnut",
        data: {
          labels: [],
          datasets: [{ label: "Dataset 1", data: [], backgroundColor: [] }]
        },
        options: {
          responsive: true
        }
      };

      [
        { title: this.$lang("通过总数"), key: "passedKycNumber" },
        {
          title: this.$lang("PC通过总数"),
          key: "pcPassedKycNumber"
        },
        { title: this.$lang("Android通过总数"), key: "androidPassedKycNumber" },
        { title: this.$lang("IOS通过总数"), key: "iosPassedKycNumber" },
        {
          title: this.$lang("未通过总数"),
          key: "rejectKycNumber"
        },
        { title: this.$lang("PC未通过总数"), key: "pcRejectKycNumber" },
        {
          title: this.$lang("Android未通过总数"),
          key: "androidRejectKycNumber"
        },
        { title: this.$lang("IOS未通过总数"), key: "iosRejectKycNumber" }
      ].forEach((el, index) => {
        config.data.labels.push(el.title);
        config.data.datasets[0].data.push(this.aggerateStatistic[el.key]);
        config.data.datasets[0].backgroundColor.push(
          this.borderColor[index % this.backgroundColor.length]
        );
      });

      if (this.pieChart) {
        this.pieChart.config = config;
        this.pieChart.update();
      } else {
        this.pieChart = new Chart(
          document.getElementById("myChart2").getContext("2d"),
          config
        );
      }
    },
    formDatas() {
      let labels = [];

      let data = [];

      let _this = this;

      let index = 0;

      this.columns.forEach(el => {
        if (el.chart) {
          data.push({
            label: el.title,
            borderColor:
              _this.borderColor[index % _this.backgroundColor.length],
            data: [],
            fill: false,
            hidden:
              el.key !== "passedKycNumber" && el.key !== "rejectKycNumber",
            key: el.key
          });
          index++;
        }
      });

      this.listData.forEach(el => {
        data.forEach(_el => {
          _el.data.unshift(el[_el.key]);
        });
        labels.unshift(el.statisticDate);
      });

      this.renderLine(labels, data);
    },
    loadData() {
      this.loadingTable = true;
      if (this.tempDate.length&&this.tempDate[0]&&this.tempDate[1]) {
        this.searchForm.beginDate = new Date(this.tempDate[0]).getTime();
        this.searchForm.endDate = new Date(this.tempDate[1]).getTime();
      } else {
        this.searchForm.beginDate = "";
        this.searchForm.endDate = "";
      }
      this.$axios
        .post("/api/v1/statistic/kyc_statistics", this.searchForm)
        .then(result => {
          this.loadingTable = false;
          this.listData = [];
          if (result.code === 0 && result.data) {
            this.listData = result.data.dailyStatistics;
            this.aggerateStatistic = result.data.aggerateStatistic;
            this.formDatas();
            this.renderPie();
          }
        });
    }
  },
  created() {
    this.loadData();
  }
};
</script>