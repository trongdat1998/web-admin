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
      Col(span="6") {{$lang('注册总数')}}：{{aggerateStatistic.regNumber}}
      Col(span="6") {{$lang('网站自主注册总数')}}：{{aggerateStatistic.pcNotInvitedRegNumber}}
      Col(span="6") {{$lang('Android自主注册总数')}}：{{aggerateStatistic.androidNotInvitedRegNumber}}
      Col(span="6") {{$lang('IOS自主注册总数')}}：{{aggerateStatistic.iosNotInvitedRegNumber}}
    Row(:gutter="15")
      Col(span="6") &nbsp;
      Col(span="6") {{$lang('网站邀请注册总数')}}：{{aggerateStatistic.pcInviteRegNumber}}
      Col(span="6") {{$lang('Android邀请注册总数')}}：{{aggerateStatistic.androidInviteRegNumber}}
      Col(span="6") {{$lang('IOS邀请注册总数')}}：{{aggerateStatistic.iosInviteRegNumber}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable")
  Modal.page-exchange-win(v-model="detailStatus", :title="$lang('详情')" width="1000")
    Row.page-reg(:gutter="15")
        Col(span="6") {{$lang('注册总数')}}：{{detail.regNumber}}
        Col(span="6") {{$lang('网站注册总数')}}：{{detail.pcRegNumber}}
        Col(span="6") {{$lang('Android注册总数')}}：{{detail.androidRegNumber}}
        Col(span="6") {{$lang('IOS注册总数')}}：{{detail.iosRegNumber}}
    Row.page-reg(:gutter="15")
        Col(span="6") {{$lang('自主注册总数')}}：{{detail.notInvitedRegNumber}}
        Col(span="6") {{$lang('网站自主注册总数')}}：{{detail.pcNotInvitedRegNumber}}
        Col(span="6") {{$lang('Android自主注册总数')}}：{{detail.androidNotInvitedRegNumber}}
        Col(span="6") {{$lang('IOS自主注册总数')}}：{{detail.iosNotInvitedRegNumber}}
    Row.page-reg(:gutter="15")
        Col(span="6") {{$lang('邀请注册总数')}}：{{detail.inviteRegNumber}}
        Col(span="6") {{$lang('网站邀请注册总数')}}：{{detail.pcInviteRegNumber}}
        Col(span="6") {{$lang('Android邀请注册总数')}}：{{detail.androidInviteRegNumber}}
        Col(span="6") {{$lang('IOS邀请注册总数')}}：{{detail.iosInviteRegNumber}}
    Row.page-reg(:gutter="15")
        Col(span="6") {{$lang('直接邀请注册总数')}}：{{detail.directInviteRegNumber}}
        Col(span="6") {{$lang('网站直接邀请注册总数')}}：{{detail.pcDirectInviteRegNumber}}
        Col(span="6") {{$lang('Android直接邀请注册总数')}}：{{detail.androidDirectInviteRegNumber}}
        Col(span="6") {{$lang('IOS直接邀请注册总数')}}：{{detail.iosDirectInviteRegNumber}}
    Row.page-reg(:gutter="15")
        Col(span="6") {{$lang('间接邀请注册总数')}}：{{detail.indirectInviteRegNumber}}
        Col(span="6") {{$lang('网站间接邀请注册总数')}}：{{detail.pcindIrectInviteRegNumber}}
        Col(span="6") {{$lang('Android间接邀请注册总数')}}：{{detail.androidIndirectInviteRegNumber}}
        Col(span="6") {{$lang('IOS间接邀请注册总数')}}：{{detail.iosIndirectInviteRegNumber}}

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

      loadingTable: false,
      detailStatus: false,
      detail: {},
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
          title: this.$lang("注册总数"),
          minWidth: 140,
          key: "regNumber",
          chart: true
        },
        {
          title: this.$lang("自主注册总数"),
          minWidth: 140,
          key: "notInvitedRegNumber",
          chart: true
        },
        {
          title: this.$lang("邀请注册总数"),
          minWidth: 140,
          key: "inviteRegNumber",
          chart: true
        },
        {
          title: this.$lang("间接邀请注册总数"),
          minWidth: 160,
          key: "indirectInviteRegNumber",
          chart: true
        },
        {
          title: this.$lang("操作"),
          width: 80,
          fixed: "right",
          align: "center",
          render: (h, params) => {
            return h(
              "a",
              {
                on: {
                  click: () => {
                    this.detailStatus = true;
                    Object.assign(this.detail, params.row);
                  }
                }
              },
              this.$lang("详情")
            );
          }
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
        { title: this.$lang("网站自主注册总数"), key: "pcNotInvitedRegNumber" },
        {
          title: this.$lang("Android自主注册总数"),
          key: "androidNotInvitedRegNumber"
        },
        { title: this.$lang("IOS自主注册总数"), key: "iosNotInvitedRegNumber" },
        { title: this.$lang("网站邀请注册总数"), key: "pcInviteRegNumber" },
        {
          title: this.$lang("Android邀请注册总数"),
          key: "androidInviteRegNumber"
        },
        { title: this.$lang("IOS邀请注册总数"), key: "iosInviteRegNumber" }
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
            key: el.key,
            hidden: el.key !== "regNumber"
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
        .post("/api/v1/statistic/reg_statistics", this.searchForm)
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