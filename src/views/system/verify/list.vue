
<style lang="less" scoped>
/deep/ .ivu-radio-wrapper {
  white-space: inherit;
}
</style>
<template lang="pug">
.page-exchange
  Table(
    :columns="history ? historyColumns : columns",
    :data="listData",
    :loading="loadingTable"
  )
    template(slot-scope="{ row, index }", slot="level") {{ levels[row.currentLevel] }}
      span ({{ row.approverName }})
    template(slot-scope="{ row, index }", slot="bizType") {{ bizTypes[row.bizType] }}
    template(slot-scope="{ row, index }", slot="status")
      Tag(v-if="row.status == 1", color="success") {{ $lang('是') }}
      Tag(v-else) {{ $lang('否') }}
    template(slot-scope="{ row, index }", slot="action")
      Button(@click="getDetail(row)", size="small", type="primary", ghost) {{ row.auditRight ? $lang('审批') : $lang('查看') }}
    template(slot-scope="{ row, index }", slot="status")
      Tag(v-if="row.status == 0") {{ $lang('待审核') }}
      Tag(v-else-if="row.status == 1", color="success") {{ $lang('已通过') }}
      Tag(v-else, color="error") {{ $lang('已拒绝') }}
    // HISTORY
    template(slot-scope="{ row, index }", slot="audit") {{ levels[row.level] }}
      span ({{ row.approverName }})
    template(slot-scope="{ row, index }", slot="approvalStatus")
      Tag(v-if="row.approvalStatus == 1", color="success") {{ $lang('已通过') }}
      Tag(v-else, color="error") {{ $lang('已拒绝') }}

  Modal(
    v-model="verifyWin",
    :title="$lang('详情')",
    width="600",
    :footer-hide="isRead || !formData.auditRight"
  )
    List(:labelWidth="160", v-for="item in items", border, :key="item.type")
      template(v-if="item.type === 1 || item.type === 2")
        ListItem
          ListItemMeta(:title="$lang('类型')") 
          Button(size="small") {{ item.type === 1 ? $lang('免费空投') : $lang('持币空投') }}
        ListItem
          ListItemMeta(:title="$lang('自动锁仓')") 
          Button(size="small") {{ item.lockModel === 1 ? $lang('是') : $lang('否') }}
        ListItem
          ListItemMeta(:title="$lang('标题')") 
          Button(size="small") {{ item.title }}
        ListItem
          ListItemMeta(:title="$lang('描述')") 
          Button(size="small") {{ item.description || '---' }}
        ListItem
          ListItemMeta(:title="$lang('空投时间')") 
          Button(size="small") {{ newDate(Number(item.airdropTime)).format() }}
        ListItem(v-if="item.type === 2")
          ListItemMeta(:title="$lang('快照时间')")
          Button(size="small") {{ $lang('快照时间按照UTC +0时间生成，对应您本地时间为') }}:{{ newDate(Number(item.snapshotTime)).format() }}
        ListItem(v-if="item.tmplModel && item.type == 1")
          ListItemMeta(:title="$lang('数据下载')")
          Button(
            size="small",
            :to="`/api/v1/flow/records/down_attachment?bizId=${item.flow.bizId}&bizType=${item.flow.bizType}`",
            target="_blank",
            type="primary"
          ) {{ $lang('下载数据') }}
        template(v-else)
          ListItem
            ListItemMeta(:title="$lang('空投用户')")
            template(#action)
              Button(size="small", v-if="item.userType === 1") {{ $lang('全部') }}
              Input(
                v-else,
                type="textarea",
                :value="formatStr(item.userAccountIds)",
                disabled,
                :rows="Math.min(item.userAccountIds.split(',').length, 6)"
              )
          ListItem(v-if="item.type == 2")
            ListItemMeta(:title="$lang('空投条件')")
            Button(size="small") {{ $lang('每持有') }} {{ item.haveTokenNum }} {{ item.haveTokenId }}，{{ $lang('则空投') }} {{ item.airdropTokenNum }} {{ item.airdropTokenId }}
          ListItem(v-else)
            ListItemMeta(:title="$lang('空投数量')") 
            Button(size="small") {{ item.airdropTokenNum }} {{ item.airdropTokenId }}
    template(v-if="!isRead && formData.auditRight")
      Divider
      RadioGroup(v-model="formData.auditStatus")
        Radio(:label="1", border) {{ $lang('通过') }}
        Radio(:label="0", border) {{ $lang('拒绝') }}

    Button(
      slot="footer",
      :type="formData.auditStatus ? 'primary' : 'error'",
      :loading="loading",
      @click="codeWin = true"
    ) {{ formData.auditStatus ? $lang('通过') : $lang('拒绝') }}
  CodeModal(v-model="codeWin", @submit="submit", :loading="loading")
</template>
<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["isRead"]),
  },
  data() {
    return {
      history: false,

      verifyWin: false,
      loadingTable: false,
      codeWin: false,

      levels: {
        1: this.$lang("一级审核"),
        2: this.$lang("二级审核"),
      },
      bizTypes: { 1: this.$lang("免费空投"), 2: this.$lang("持币空投") },

      items: [],

      formData: {
        recordId: "",
        auditStatus: 1,
        authType: "",
        verifyCode: "",
        auditRight: false,
      },

      searchForm: {
        bizType: "",
        startId: "",
        limit: 100,
      },
      loading: false,
      columns: [
        {
          title: this.$lang("时间"),
          minWidth: 190,
          render: (h, params) =>
            h("span", this.newDate(params.row.createdAt).format()),
        },
        {
          title: this.$lang("业务类型"),
          minWidth: 160,
          slot: "bizType",
        },
        {
          title: this.$lang("标题"),
          minWidth: 160,
          key: "bizTitle",
        },
        {
          title: this.$lang("申请人"),
          minWidth: 160,
          key: "applicantName",
        },
        {
          title: this.$lang("层级"),
          minWidth: 180,
          slot: "level",
        },
        {
          title: this.$lang("状态"),
          minWidth: 180,
          slot: "status",
        },
        {
          title: this.$lang("操作"),
          minWidth: 120,
          slot: "action",
          align: "right",
        },
      ],
      historyColumns: [
        {
          title: this.$lang("申请时间"),
          minWidth: 190,
          render: (h, params) =>
            h("span", this.newDate(params.row.applyDate).format()),
        },
        {
          title: this.$lang("审核时间"),
          minWidth: 190,
          render: (h, params) =>
            h("span", this.newDate(params.row.auditDate).format()),
        },
        {
          title: this.$lang("业务类型"),
          minWidth: 160,
          slot: "bizType",
        },
        {
          title: this.$lang("标题"),
          minWidth: 160,
          key: "bizTitle",
        },
        {
          title: this.$lang("申请人"),
          minWidth: 160,
          key: "applicantName",
        },
        {
          title: this.$lang("审核人"),
          minWidth: 180,
          slot: "audit",
        },
        {
          title: this.$lang("状态"),
          minWidth: 180,
          slot: "approvalStatus",
        },
        {
          title: this.$lang("操作"),
          minWidth: 120,
          slot: "action",
          align: "right",
        },
      ],
      listData: [],
    };
  },
  watch: {
    $route(to) {
      this.loadData();
    },
  },
  methods: {
    formatStr(str) {
      return str.split(",").join("\n");
    },

    getFirstData() {
      this.searchForm.fromId = 0;
      this.loadData();
    },
    getNextData() {
      this.searchForm.fromId = this.listData.slice(-1)[0].orderId;
      this.loadData();
    },

    getDetail(row) {
      this.verifyWin = true;
      this.loading = true;
      Object.assign(this.formData, {
        recordId: row.id,
        auditRight: row.auditRight,
        auditStatus: 1,
        authType: "",
        verifyCode: "",
      });

      this.$axios
        .post("/api/v1/flow/records/audit/get_detail", {
          bizId: row.bizId,
          bizType: row.bizType,
        })
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            this.items = [
              {
                ...result.data,
                flow: {
                  bizId: row.bizId,
                  bizType: row.bizType,
                },
              },
            ];
          }
        });
    },

    submit(data) {
      this.loading = true;

      const json = { ...this.formData, ...data };

      this.$axios
        .post("/api/v1/flow/records/audit/request", json)
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            this.verifyWin = false;
            this.codeWin = false;
            this.loadData();
          }
        });
    },

    loadData() {
      this.listData = [];
      this.loadingTable = true;
      this.history = this.$route.path.indexOf("history") > -1;
      this.$axios
        .post(
          this.history
            ? "/api/v1/flow/records/approved_list"
            : "/api/v1/flow/records/audit_list",
          this.searchForm
        )
        .then((result) => {
          if (result.code == 0) {
            this.listData = result.data;
          }
          this.loadingTable = false;
        });
    },
  },
  created() {
    this.loadData();
  },
};
</script>