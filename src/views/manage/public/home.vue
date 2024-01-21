<template lang="pug">
div
  Card( dis-hover)
    p(slot="title") {{$lang('推荐币对')}} / {{$lang('APP首屏推荐位')}} / {{$lang('网站首页推荐位')}}
    Row(:gutter="20")
      Col(:span="4" v-for="item,index in symbols" :key="index")
        Select(v-model="symbols[index]" filterable)
          Option(value="") ----
          Option(value="币对" disabled) ---------{{$lang('币对')}}---------
          Option(v-for="_item in symbolList" :key="index+_item.symbolId" :value="_item.symbolId" v-if="_item.showStatus && _item.published") {{_item.symbolName}}
          Option(value="合约" disabled) ---------{{$lang('合约')}}---------
          Option(v-for="_item in swapList" :key="index+_item.symbolId" :value="_item.symbolId" v-if="_item.showStatus && _item.published") {{_item.symbolName}}
    Alert(style="margin-top:15px") {{$lang("WEB将取前5项展示币对推荐；APP一屏展示3项，最多支持2屏共6项；全部置空则相当于不启用此功能。")}}
  div(style="height:50px")
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
    ...mapState(["isRead"])
  },
  data() {
    return {
      pageLoading: false,
      loading: false,
      symbolList: [],
      swapList: [],
      symbols: []
    };
  },
  methods: {
    load() {
      this.pageLoading = true;
      this.$axios
        .post("/api/v1/broker/config/query_recommend_symbols")
        .then(result => {
          this.pageLoading = false;
          if (result.code === 0) {
            this.symbols = result.data;
            for (let i = 0; i < 6; i++) {
              if (!this.symbols[i]) {
                this.symbols.push("");
              }
            }
          }
        });
    },
    submit() {
      this.loading = true;
      this.$axios
        .post("/api/v1/broker/config/edit_recommend_symbols", {
          symbols: this.symbols.filter(el => el)
        })
        .then(result => {
          this.loading = false;
          if (result.code === 0) {
            this.load();
          }
        });
    }
  },
  created() {
    this.$axios
      .post("/api/v1/symbol/query", {
        current: 1,
        pageSize: 1000,
        category: 1
      })
      .then(result => {
        if (result.code === 0) {
          this.symbolList = result.data.list ? result.data.list : [];
        }
      });
    this.$axios
      .post("/api/v1/swap/query", {
        current: 1,
        pageSize: 1000
      })
      .then(result => {
        if (result.code === 0) {
          this.swapList = result.data.list ? result.data.list : [];
        }
      });
    this.load();
  }
};
</script>