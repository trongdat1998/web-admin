<template lang="pug">
  Table(:columns="columns", :data="listData" :loading="loading" :span-method="handleSpan")
</template>
<script>
export default {
  props: {
    searchForm: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  methods: {
    handleSpan({ row, columnIndex }) {
      if (!row.appHeader) {
        if (columnIndex === 3) {
          return [1, 4];
        } else if (columnIndex > 2 && columnIndex < 7) {
          return [0, 0];
        }
      }
    }
  },
  data() {
    return {
      loading: false,
      listData: [],
      columns: [
        {
          title: this.$lang("时间"),
          minWidth: 190,
          key: "created",
          render: (h, params) =>
            h("span", this.newDate(params.row.created).format())
        },
        {
          title: "IP",
          minWidth: 160,
          key: "ip"
        },
        {
          title: "平台",
          minWidth: 160,
          key: "platform"
        },
        {
          title: this.$lang("系统"),
          minWidth: 160,
          key: "appHeader",
          render: (h, params) =>
            h(
              "span",
              params.row.appHeader
                ? params.row.appHeader.osVersion
                : params.row.userAgent
            )
        },
        {
          title: this.$lang("版本"),
          minWidth: 160,
          key: "appHeader",
          render: (h, params) =>
            h(
              "span",
              params.row.appHeader ? params.row.appHeader.appVersion : "---"
            )
        },
        {
          title: this.$lang("IMEI"),
          minWidth: 160,
          key: "appHeader",
          render: (h, params) =>
            h("span", params.row.appHeader ? params.row.appHeader.imei : "---")
        },
        {
          title: this.$lang("网络"),
          minWidth: 160,
          key: "appHeader",
          render: (h, params) =>
            h("span", params.row.appHeader ? params.row.appHeader.nett : "---")
        },
        {
          title: this.$lang("状态"),
          minWidth: 160,
          key: "status",
          render: (h, p) => {
            if (p.row.status == 1) {
              return h("span", this.$lang("成功"));
            } else if (p.row.status == 2) {
              return h("span", this.$lang("失败"));
            } else if (p.row.status == 3) {
              return h("span", this.$lang("未完成"));
            } else if (p.row.status == 6) {
              return h("span", this.$lang("扫描登录成功"));
            }
          }
        }
      ]
    };
  },
  created() {
    this.loading = true;
    this.$axios
      .post(
        "/api/v1/brokeruser/login_logs",
        Object.assign(
          {
            current: 1,
            pageSize: 10
          },
          this.searchForm
        )
      )
      .then(result => {
        this.loading = false;
        if (result.code == 0) {
          this.listData = result.data.list;
        }
      });
  }
};
</script>
