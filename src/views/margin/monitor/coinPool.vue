<template lang="pug">
	div.pool
		canvas(id="chart", height="80", v-show="showType === 1")
		Card.card(dis-hover, v-show="showType === 2", :class="{nobody: !show}")
			div(slot="title")
				span {{$lang('当前币池')}}
			a(slot="extra", @click="toggle")
				Icon(type="ios-arrow-down", )
			Table(:columns="poolColumns", :data="poolData", :loading="loadingPoolTable", height="250", v-if="show")
</template>
<script>

	import Chart from 'chart.js'

  export default {
	  props: {
	    showType: {
	      type: Number,
		    default: 2,
	    }
	  },
	  data() {
      return {
        show: true,
        loadingPoolTable: false,
        poolData: [],
        poolColumns: [
          {
            title: this.$lang('币种'),
            key: 'tokenId',
          },
          {
            title: this.$lang('可借'),
            key: 'loanable',
          },
        ],
      }
	  },
	  mounted () {
	    this.searchCoinPool()
		  this.interval = setInterval(() => {
			  this.searchCoinPool();
		  }, 30000)
    },
		beforeDestroy () {
	    if (this.interval) {
	      clearInterval(this.interval);
	    }
		},
    methods: {
	    toggle() {
	      this.show = !this.show
	    },
      searchCoinPool () {
        this.loadingPoolTable = true
        this.$axios
          .get('/api/v1/margin/risk/get/pool_account', {})
          .then((result) => {
            this.loadingPoolTable = false
            if (result.code == 0 && result.data) {
              let ret = []
              result.data.tokenList.forEach((item) => {
                ret.push({
                  loanable: item.loanable,
                  tokenId: item.tokenId,
                })
              })
              this.poolData = ret
	            this.updateChart();
            }
          })

      },
      updateChart() {
        let labels = [];
        let data = [];
        this.poolData.forEach(item => {
	        labels.push(item.tokenId);
	        data.push(item.loanable)
        });
        let config = {
          type: 'bar',
          data: {
            labels,
            datasets: [{
              label: '币池可用',
              barPercentage: 0.5,
              barThickness: 6,
              maxBarThickness: 8,
              minBarLength: 2,
              data: data,
            }]
          },
          options: {
            offset:false,
            legend: {

              position: 'top',
            },
	          title: {
              display: true,
              text:'当前币池',
	          }
          }
        };
        if (this.chart) {
          this.chart.config = config;
          this.chart.update();
        } else {
          const ctx =document.getElementById("chart").getContext("2d");
          this.chart = new Chart(
            ctx,
            config
          );
        }
      }
		}
	}
</script>
<style lang="less" scoped>
	.nobody {
		/deep/ .ivu-table-body {
			display: none;
		}
	}
	.pool {
		margin: 8px 0;
	}

</style>
