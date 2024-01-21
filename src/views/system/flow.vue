
<style lang="less" scoped>
/deep/ .ivu-radio-wrapper {
  white-space: inherit;
}
</style>
<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4", offset="20")
      Button(
        long,
        type="primary",
        @click="newOne",
        :disabled="isRead",
        icon="md-add-circle",
        ghost
      ) {{ $lang('新建') }}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{ row, index }", slot="level") {{ levels[row.levelCount] }}
    template(slot-scope="{ row, index }", slot="bizType") {{ bizTypes[row.bizType] }}

    
    template(slot-scope="{ row, index }", slot="status")
      Tag(v-if="row.status == 1", color="success") {{ $lang('已启用') }}
      Tag(v-else) {{ $lang('已禁用') }}
    template(slot-scope="{ row, index }", slot="action")
      Button(@click="edit(row)", size="small", type="primary", ghost) {{ row.allowModify || !isRead ? $lang('修改') : $lang('查看') }}

  Modal(
    v-model="addWin",
    :title="$lang('详情')",
    width="800",
    :footer-hide="formData.disabled || isRead"
  )
    Form(:model="formData", :labelWidth="160")
      FormItem(:label="$lang('业务名称')")
        Select(
          v-model="formData.bizType",
          :disabled="!!formData.id || formData.disabled"
        )
          Option(
            v-for="(item, key) in bizTypes",
            :key="key",
            :value="Number(key)"
          ) {{ item }}
      FormItem(:label="$lang('审核层级')")
        Select(v-model="formData.levelCount", :disabled="formData.disabled")
          Option(
            v-for="(item, key) in levels",
            :key="key",
            :value="Number(key)"
          ) {{ item }}
      FormItem(
        :label="levels[index + 1]",
        v-for="(item, index) in formData.nodes",
        v-if="index < formData.levelCount",
        :key="index"
      )
        Select(
          v-model="item.approver",
          filterable,
          :disabled="formData.disabled"
        )
          Option(v-for="(item, key) in users", :key="key", :value="item.id") {{ item.name }}
      FormItem(:label="$lang('消息通知')")
        RadioGroup(v-model="formData.allowNotify")
          Radio(:label="1", :disabled="formData.disabled") {{ $lang('启用') }}
          Radio(:label="0", :disabled="formData.disabled") {{ $lang('禁用') }}
      FormItem(:label="$lang('流程状态')")
        RadioGroup(v-model="formData.status")
          Radio(:label="1", :disabled="formData.disabled") {{ $lang('启用') }}
          Radio(:label="0", :disabled="formData.disabled") {{ $lang('禁用') }}
      Divider {{ $lang('安全配置') }}
      FormItem(:label="$lang('修改流程')")
        RadioGroup(v-model="formData.allowModify", vertical)
          Radio(:label="1", :disabled="formData.disabled") {{ $lang('允许修改') }}
          Radio(:label="0", :disabled="formData.disabled") {{ $lang('不允许修改') }} ({{ $lang('锁定审批流程，后续不允许任何人修改，仅限提交工单修改') }})
    Button(
      slot="footer",
      type="primary",
      :loading="loading",
      @click="codeWin = true"
    ) {{ $lang('确定') }}

  CodeModal(v-model="codeWin", @submit="submit", :loading="loading")
</template>
<script>
import { mapState } from "vuex";
const json = {
  disabled: false,
  id: 0, //修改的时候传入，新增可不传
  bizType: 1, // 业务类型 1=免费空投 2=持币空投
  levelCount: 1, //审批层级
  allowModify: 1, // 是否允许修改 0=否 1=是
  allowForbidden: 0, // 是否允许禁用 0=否 1=是,
  status: 1,
  allowNotify: 1,
  nodes: [
    {
      approver: "", // 审批人id
      allowNotify: "0", // 是否发送通知
      notifyMode: "0", // 通知方式 0=email 1=sms 2=email + sms
    },
    {
      approver: "", // 审批人id
      allowNotify: "0", // 是否发送通知
      notifyMode: "0", // 通知方式 0=email 1=sms 2=email + sms
    },
  ],
};

export default {
  computed: {
    ...mapState(["isRead"]),
  },
  data() {
    return {
      addWin: false,
      loadingTable: false,
      codeWin: false,

      levels: {
        1: this.$lang("一级审核"),
        2: this.$lang("二级审核"),
      },

      bizTypes: { 1: this.$lang("免费空投"), 2: this.$lang("持币空投") },

      users: [],

      searchForm: {
        bizType: "",
        startId: "",
        limit: 100,
      },
      formData: JSON.parse(JSON.stringify(json)),
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
          title: this.$lang("层级"),
          minWidth: 160,
          slot: "level",
        },
        {
          title: this.$lang("操作人"),
          minWidth: 160,
          key: "userName",
        },
        {
          title: "状态",
          minWidth: 100,
          slot: "status",
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
  methods: {
    newOne() {
      this.addWin = true;
      Object.assign(this.formData, JSON.parse(JSON.stringify(json)));
    },

    edit(row) {
      this.newOne();
      this.loading = true;
      this.$axios
        .post("/api/v1/flow/flow_config/get_detail", { id: row.id })
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            Object.assign(this.formData, result.data);
            this.formData.nodes.push({
              approver: "", // 审批人id
              allowNotify: "0", // 是否发送通知
              notifyMode: "0", // 通知方式 0=email 1=sms 2=email + sms
            });
            this.formData.disabled = !result.data.allowModify;
          }
        });
    },

    submit(data) {
      this.loading = true;

      const json = { ...this.formData, ...data };

      json.nodes.length = json.levelCount;

      json.nodes.forEach((el) => {
        el.allowNotify = this.formData.allowNotify;
      });

      this.$axios.post("/api/v1/flow/flow_config", json).then((result) => {
        this.loading = false;
        if (result.code == 0) {
          this.addWin = false;
          this.codeWin = false;
          this.loadData();
        }
      });
    },

    loadData() {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/flow/flow_config/list", this.searchForm)
        .then((result) => {
          if (result.code == 0) {
            this.listData = result.data;
          }
          this.loadingTable = false;
        });
    },
  },
  created() {
    this.$axios
      .get("/api/v1/flow/flow_config/get_admin_users")
      .then((result) => {
        if (result.code === 0) {
          this.users = result.data;
        }
      });

    this.loadData();
  },
};
</script>