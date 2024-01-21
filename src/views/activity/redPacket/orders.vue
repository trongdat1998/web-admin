<style lang="less" scoped>
  .noBorder {
    outline: none;
    box-shadow:none;
    border: 0px;
    margin-left: -7px;
  }
</style>
<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="24")
      Input(
        search,
        v-model="searchForm.userId",
        :placeholder="$lang('用户ID')",
        @on-search="search",
        enter-button=""
      )
  Alert
    span(v-html="hbDesc")
    Button.noBorder(size="small" type="primary", ghost, :to="`${supportDomain}/hc/zh-cn/articles/360053351954`" target="_blank") {{$lang('红包产品帮助')}} >>
    br
    span {{$lang("redPacketDec")}}
    router-link.button(to="/manage/website/common") {{$lang('去设置')}}>>
  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable"
  )
    template(slot-scope="{row, index }", slot="newer")
      Tag(v-if="row.receiveUserType == 1", color="success") {{ $lang('新手红包') }}
      template(v-else) {{ $lang('口令红包') }}

    template(slot-scope="{row, index }", slot="type")
      Tag(color="warning" v-if="row.redPacketType == 1") {{ $lang('随机红包') }}
      template(v-else) {{ $lang('普通红包') }}

    template(slot-scope="{row, index }", slot="totalAmount") {{ row.totalAmount }}{{ row.tokenName }}
    template(slot-scope="{row, index }", slot="remainAmount") {{ row.remainAmount }}{{ row.tokenName }}
    template(slot-scope="{row, index }", slot="refundAmount") {{ row.refundAmount }}{{ row.tokenName }}
    template(slot-scope="{row, index }", slot="uid")
      User(:uid="row.userId")
    template(slot-scope="{row, index }", slot="totalCount") {{ row.totalCount - row.remainCount }} / {{ row.totalCount }}

    template(slot-scope="{row, index }", slot="status") {{ status[row.status] }}
    template(slot-scope="{row, index}", slot="action")
      Button(
        v-if="row.totalCount - row.remainCount > 0",
        type="primary",
        size="small",
        ghost,
        @click="detail(row, index)",
        :disabled="isRead",
        :loading="viewIndex == index"
      ) {{ $lang('明细') }}
      template(v-else) ---
  Row(:gutter="20" style="padding-top:30px")
    Col(span="10")
      ButtonGroup(v-if="!(searchForm.fromId==0&&listData.length<searchForm.limit)")
        Button(:disabled="searchForm.fromId==0" icon="ios-skip-backward" @click="getFirst")
        Button(:disabled="listData.length<searchForm.limit" icon="ios-arrow-forward"  @click="getNext")
  Modal(v-model="tokenWin", :title="$lang('明细')", footer-hide, width="800")
    Table.user-table(:columns="detailsColumns", :data="details")
      template(slot-scope="{row, index }", slot="uid")
        User(:uid="row.receiverUserId")
      template(slot-scope="{row, index }", slot="amount") {{ row.amount }}{{ row.tokenName }}
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      tokenWin: false,

      details: [],

      detailsColumns: [
        {
          title: "Uid",
          key: "code",
          minWidth: 180,
          slot: "uid",
        },
        {
          title: this.$lang("领取时间"),
          key: "code",
          minWidth: 180,
          render: (h, p) => h("span", this.newDate(p.row.created).format()),
        },
        {
          title: this.$lang("领取金额"),
          key: "code",
          minWidth: 180,
          slot: "amount",
          align: "right",
        },
      ],

      searchForm: {
        userId: "",
        fromId: 0,
        limit: "100",
      },
      loading: false,
      viewIndex: null,
      loadingTable: true,

      status: {
        0: this.$lang("进行中"),
        1: this.$lang("已抢完"),
        2: this.$lang("退款(中)"),
        3: this.$lang("退款"),
      },

      columns: [
        {
          title: "Uid",
          key: "code",
          minWidth: 180,
          slot: "uid",
        },
        {
          title: this.$lang("创建时间"),
          key: "code",
          minWidth: 180,
          render: (h, p) => h("span", this.newDate(p.row.created).format()),
        },
        {
          title: this.$lang("过期时间"),
          key: "code",
          minWidth: 180,
          render: (h, p) => h("span", this.newDate(p.row.expired).format()),
        },
        {
          title: this.$lang("类型"),
          key: "type",
          minWidth: 100,
          slot: "type",
        },
        {
          title: this.$lang("模式"),
          key: "type",
          minWidth: 100,
          slot: "newer",
        },

        {
          title: this.$lang("红包金额"),
          key: "totalAmount",
          minWidth: 100,
          slot: "totalAmount",
        },
        {
          title: this.$lang("剩余金额"),
          key: "remainAmount",
          minWidth: 100,
          slot: "remainAmount",
        },
        {
          title: this.$lang("退还金额"),
          key: "refundAmount",
          minWidth: 100,
          slot: "refundAmount",
        },

        {
          title: this.$lang("红包个数"),
          key: "totalCount",
          minWidth: 100,
          slot: "totalCount",
        },
        {
          title: this.$lang("状态"),
          minWidth: 100,
          key: "status",
          slot: "status",
        },
        {
          title: this.$lang("操作"),
          minWidth: 100,
          slot: "action",
        },
      ],
      listData: [],
    };
  },
  computed: {
    ...mapState(["isRead", 'apiDomain']),
    hbDesc() {
      return this.$lang("hb.desc")
        .replace(
          "{h5}",
          `<a target="_blank" href="https://www${this.apiDomain}/activity/hb/"> https://www${this.apiDomain}/activity/hb/</a>`
        )
    }
  },
  created() {
    this.loadData();
  },
  methods: {
    getFirst() {
      this.search();
    },
    getNext() {
      this.searchForm.fromId = this.listData[this.listData.length-1].id
      this.loadData();
    },
    search() {
      this.searchForm.fromId = 0;
      this.loadData();
    },
    detail(row, index) {
      this.details = [];

      this.viewIndex = index;
      this.$axios
        .post("/api/v1/red_packet/red_packet_receive_details", {
          redPacketId: row.id,
          fromId: 0,
          limit: row.totalCount,
        })
        .then((result) => {
          this.viewIndex = null;
          if (result.code === 0) {
            this.tokenWin = true;
            this.details = result.data;
          }
        });
    },

    loadData() {
      this.loadingTable = true;

      this.$axios
        .post("/api/v1/red_packet/red_packets", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data;
          }
        });
    },
  },
};
</script>
