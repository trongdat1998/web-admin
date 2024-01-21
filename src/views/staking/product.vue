<style lang="less" scoped>
  .noBorder {
    outline: none;
    box-shadow:none;
    border: 0px;
    margin-left: -7px;
  }
</style>
<template lang="pug">
div.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Button(
        type="success",
        long,
        to="/staking/config"
        :disabled="isRead",
        icon="md-settings",
        ghost
      ) {{ $lang('配置') }}
    Col(span="16") &nbsp;
    Col(span="4")
      Button(
        type="primary",
        long,
        :to="`/staking/product/create/${productType}`"
        :disabled="isRead || isPermission",
        icon="md-add-circle",
        ghost
      ) {{ $lang('新建') }}
  Alert
    Button.noBorder(size="small" type="primary", ghost, :to="`${supportDomain}/hc/zh-cn/articles/360055219933`" target="_blank") {{$lang('财富产品帮助')}} >>
  Table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{ row, index }", slot="tag")
      span.border(:style="objectStyle(row)") {{ tag(row) }}
    template(slot-scope="{ row, index }", slot="show")
      iSwitch(
        v-model="row.isShow",
        :disabled="isRead",
        :false-value="0",
        :true-value="1",
        @on-change="online(row, index)",
        :loading="index === editIndex",
        size="small"
      )
    template(slot-scope="{ row, index }" slot="view")
      a(:href="`https://www${apiDomain}/staking/periodical/${row.id}`" target="_blank") {{$lang("预览")}}
    template(slot-scope="{ row, index }" slot="search")
      router-link(:to="`/staking/productOrder/${row.id}/${productType}`") {{$lang("查看")}}
    template(slot-scope="{ row, index }" slot="position")
      router-link(:to="`/staking/productPosition/${row.id}`") {{$lang("查看")}}
    template(slot-scope="{ row, index }", slot="action")
      template(v-if="isRead || row.status == 5")
        a(:href="`/staking/product/${row.id}/${productType}`") {{ $lang('查看') }}
      template(v-else)
        a(:href="`/staking/product/${row.id}/${productType}`") {{ $lang('修改') }}
      Divider(Divider type="vertical")
      a(:href="`/staking/product/${row.id}/${productType}?copy=1`") {{ $lang('复制') }}
  div(style="padding-top:30px")
    ButtonGroup
      Button(@click="search" icon="ios-skip-backward" :disabled="searchForm.lastId==0")
      Button(icon="ios-arrow-forward" @click="getNextData"  :disabled="listData.length<searchForm.limit")
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["lang", "isRead", "apiDomain"]),
  },
  watch: {
    '$route' (to) {
      let link = to.path.split('/').pop();
      if (link === 'regular') {
        this.productType = 0;
      } else if (link === 'current') {
        this.productType = 1;
      } else if (link === 'lock'){
        this.productType = 2;
      }
      this.loadData();
      this.getPermission();
    }
  },
  data() {
    return {
      isPermission: true,
      editIndex: null,
      productType:  0,
      searchForm: {
        lastId: 0,
        limit: 100,
        productType: 0,
      },
      types: {
        0: this.$lang("定期"),
        2: this.$lang("定期锁仓"),
        1: this.$lang("活期"),
      },

      dividendTypes: {
        0: this.$lang("分期付息"),
        1: this.$lang("一次性还本付息"),
      }, //派息方式:

      //产品状态
      status: {
        0: this.$lang("待认购"),
        1: this.$lang("认购中"),
        2: this.$lang("认购结束"),
        3: this.$lang("已售罄"),
        4: this.$lang("计息中"),
        5: this.$lang("已结束"),
      },
      loading: false,

      loadingTable: false,
      columns: [],
      defaultColumns: [
        {
          title: this.$lang("名称"),
          minWidth: 160,
          key: "productName",
        },
        {
          title: this.$lang("发行币种"),
          minWidth: 100,
          key: "tokenName",
        },
        {
          title: this.$lang("已募集额度"),
          minWidth: 120,
          key: "soldAmount",
        },
        {
          title: this.$lang("发售额度"),
          minWidth: 160,
          key: "totalAmount",
        },
        {
          title: this.$lang("开始认购时间"),
          minWidth: 190,
          key: "subscribeEndDate",
          render: (h, params) =>
            h("span", this.newDate(params.row.subscribeStartDate).format()),
        },
        {
          title: this.$lang("结束认购时间"),
          minWidth: 190,
          key: "subscribeStartDate",
          render: (h, params) =>
            h("span", this.newDate(params.row.subscribeEndDate).format()),
        },
        {
          title: this.$lang("状态"),
          minWidth: 160,
          key: "status",
          render: (h, params) => h("span", this.status[params.row.status]),
        },
        {
          title: this.$lang("订单"),
          minWidth: 100,
          slot: "search"
        },
        {
          title: this.$lang("可见"),
          width: 100,
          fixed: "right",
          align: "center",
          slot: "show",
        },
        {
          title: this.$lang("操作"),
          fixed: "right",
          align: "center",
          slot: "action",
          width: 120,
        },
      ],
      listData: [],
    };
  },
  methods: {
    search() {
      this.searchForm.lastId = 0;
      this.loadData();
    },
    getNextData() {
      this.searchForm.lastId = this.listData[this.listData.length - 1].id;
      this.loadData();
    },
    online(row, index) {
      this.editIndex = index;
      this.$axios
        .post(
          row.isShow
            ? "/api/v1/staking/product/online"
            : "/api/v1/staking/product/offline",
          {
            id: row.id,
          }
        )
        .then((result) => {
          this.editIndex = "";
          if (result.code != 0) {
            row.isShow = !row.isShow ? 1 : 0;
          }
        });
    },
    getPermission() {
      this.$axios
        .post("/api/v1/staking/product/get_permission")
        .then((result) => {
          if (result.code == 0) {
            if((this.productType == 0 && result.data.allowFixed == 1)
              || (this.productType == 1 && result.data.allowCurrent == 1)
              || (this.productType == 2 && result.data.allowFixedLock == 1)) {
              this.isPermission = false
            } else {
              this.isPermission = true
            }
          }
        });
    },
    loadData() {
      this.listData = [];
      this.loadingTable = true;
      if (this.productType == 1) {
        this.columns = [
          ...this.defaultColumns,
          {
            title: this.$lang("用户持仓"),
            minWidth: 100,
            slot: "position"
          },
        ]
      } else {
        this.columns = [
          ...this.defaultColumns,
          {
            title: this.$lang("预览"),
            minWidth: 100,
            slot: "view"
          },
          {
            title: this.$lang("付息方式"),
            minWidth: 100,
            key: "dividendType",
            render: (h, params) =>
              h("span", this.dividendTypes[params.row.dividendType]),
          },
          {
            title: this.$lang("开始计息时间"),
            minWidth: 190,
            key: "interestStartDate",
            render: (h, params) =>
              h("span", this.newDate(params.row.interestStartDate).format()),
          },
        ]
      }
      Object.assign(this.searchForm, {productType: this.productType});
      this.$axios
        .post("/api/v1/staking/product/list", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
  },
  created() {
    let link = this.$route.path.split('/').pop()
    if (link === 'regular') {
      this.productType = 0;
    } else if (link === 'current') {
      this.productType = 1;
    } else if (link === 'lock'){
      this.productType = 2;
    }
    this.loadData();
    this.getPermission();
  },
};
</script>
