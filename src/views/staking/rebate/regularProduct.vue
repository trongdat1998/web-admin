<template lang="pug">
div.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="type" @on-change="change")
        Option(value="1") {{$lang('待派息')}}
        Option(value="2") {{$lang('已派息')}}
  undo(:data="listData", :loadingTable="loading" v-if="type==1" @searchData="loadData")
  history(:data="listData", :loadingTable="loading" :productType="searchForm.productType" v-else-if="type==2")
</template>
<script>
import undo from "./undo";
import history from "./history";
export default {
  components: {
    undo,
    history,
  },
  data() {
    return {
      orderId: "",
      type: this.$route.params.type ? this.$route.params.type : '1',
      types: {
        1: "undo_list",
        2: "history_list",
      },
      searchForm: {
        productType: 0, // 产品类型:0=定期 2=定期锁仓 1=活期
        pageNo: 1,
        size: 100,
      },
      loading: false,
      listData: []
    };
  },
  methods: {
    change(type) {
      this.$router.replace("/staking/rebate/regular/" + type);
      this.search();
    },
    search() {
      this.listData = [];
      this.searchForm.lastId = 0;
      this.loadData();
    },
    getNextData() {
      this.searchForm.lastId = this.listData[this.listData.length - 1].orderId;
      this.loadData();
    },
    loadData() {
      this.loading = true;
      this.$axios
        .post(`/api/v1/staking/product/rebate/${this.types[this.type]}`, this.searchForm)
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    }
  },
  created() {
    this.search();
  }
};
</script>
