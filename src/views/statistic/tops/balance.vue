<template lang="pug">
.page-exchange
  Row.search(:gutter="20")
    Col(:span="6")
      Select(v-model="searchForm.tokenId" filterable @on-change="loadData")
        Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{item.tokenName}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable")

</template>
<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['tokens']),
  },
  data() {
    return {
      listData: [],
      loadingTable: true,
      searchForm: {
        tokenId: 'USDT',
        top: 500,
      },
      columns: [
        {
          title: '#',
          type: 'index',
          width: 100,
        },
        {
          title: 'UID',
          minWidth: 140,
          key: 'userId',
          render: (h, params) =>
            h('User', {
              props: {
                uid: params.row.userId,
              },
            }),
        },
        {
          title: this.$lang('资产'),
          minWidth: 140,
          key: 'tokenId',
          render: (h, p) => h('span', p.row.total + p.row.tokenId),
        },
      ],
      sourceData: {},
    }
  },
  methods: {
    loadData() {
      this.loadingTable = true
      this.$axios
        .post('/api/v1/ods/top_data/balance_top', this.searchForm)
        .then((result) => {
          this.loadingTable = false
          this.listData = result.data
        })
    },
  },
  created() {
    this.loadData()
  },
}
</script>
