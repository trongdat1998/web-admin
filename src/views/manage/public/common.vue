<template lang="pug">
div
  Card( dis-hover style="margin-top:15px")
    p(slot="title") {{$lang('涨跌幅配置')}}
    Form(:label-width="120")
      Row(:gutter="20")
        Col(span="24")
          FormItem(:label="$lang('涨跌幅起始时间')")
            Select(v-model="config.type")
              Option(value="1d+8") {{$lang('新加坡时间0点')}}
              Option(value="1d") {{$lang('新加坡时间8点')}}
              Option(value="24h") {{$lang('24小时制')}}
  Card( dis-hover style="margin-top:15px")
    p(slot="title") {{$lang('24H涨幅榜')}}
    Form(:label-width="80")
      Row(:gutter="20")
        Col(span="24")
          FormItem(:label="$lang('币种过滤')")
            iSwitch(size="small" v-model="config.filterTopBaseToken")
    Alert {{ $lang('tip：如ETH/USDT 和 ETH/BTC，开启则24H涨幅榜显示其中上榜涨幅高的；关闭则不过滤') }}
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" type="primary" long v-else) {{$lang('保存')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["isRead", "realtimeInterval", 'filterTopBaseToken'])
  },
  data() {
    return {
      pageLoading: false,
      loading: false,
      config: {
        type: "",
        filterTopBaseToken: false,
      },
    };
  },
  methods: {
    submit() {
      this.loading = true
      this.pageLoading = true
      this.$axios.post("/api/v1/broker/modify/broker/realtime_interval", {
        realtimeInterval: this.config.type,
      }).then(result => {
        if (result.code == 0) {
          this.doFilterTopBaseToken()
        }
      });
    },
    doFilterTopBaseToken() {
      this.$axios.post("/api/v1/broker/modify/broker/filter_top_base_token", {
        filterTopBaseToken: this.config.filterTopBaseToken,
      }).then(result => {
        if (result.code == 0) {
          location.reload();
        }
        this.loading = true
        this.pageLoading = true
      });
    }
  },
  created() {
    this.config.type = this.realtimeInterval;
    this.config.filterTopBaseToken = this.filterTopBaseToken;
  }
};
</script>
