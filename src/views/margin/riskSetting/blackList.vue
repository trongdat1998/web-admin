<!--黑名单设置-->
<template lang="pug">
  div.page-exchange
    Row.search(:gutter="15")
      Col(span="20")
        Input(search, :placeholder="$lang('UID')", v-model="searchForm.userId", enter-button="" @on-search="loadData()")
      Col(span="4")
        Button(type="primary" long, @click="add" :disabled="isRead" icon="md-add-circle" ghost) {{$lang('新建')}}
    Table(:columns="columns", :data="listData", :loading="loading")
      template(slot-scope="{ row, index }" slot="action")
        a(@click.prevent="deleted(row)") {{$lang("删除")}}
    Modal(v-model="showModal", :title="$lang('新建')" width="500" footer-hide)
      Form(:labelWidth="80")
        FormItem(:label="$lang('UID')")
          Input(v-model="formData.userId")
        FormItem(:label="$lang('原因')")
          Input(type="textarea", :rows="4"  v-model="formData.reason")
      Button(long type="primary" @click="doAdd" :loading="loading" :disabled="loading") {{$lang('确定')}}
    Modal(v-model="deleteModal", :title="$lang('您确定要执行此操作吗？')" width="500" footer-hide)
      Form(:labelWidth="80")
        FormItem(:label="$lang('UID')")
          Input(v-model="currentRow.userId" disabled)
          div(style="line-height: 20px; margin-top: 12px") {{$lang('tip：删除黑名单，是恢复安全度计算，强平操作，提币功能。解冻需在用户详情单独操作。')}}
      Button(long type="primary" @click="doDelete" :loading="loading" :disabled="loading") {{$lang('确定')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["isRead"]),
  },
  data() {
    return {
      currentRow: {
        userId: '',
      },
      showModal: false,
      deleteModal: false,
      formData: {
        userId: '',
      },
      searchForm: {
        userId: '',
      },
      loading: false,
      columns: [
        {
          title: this.$lang("UID"),
          minWidth: 190,
          key:"userId",
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId
              }
            })
        },
        {
          title: this.$lang("AccountId"),
          minWidth: 190,
          key:"accountId",
        },
        {
          title: this.$lang("操作员"),
          minWidth: 120,
          key: "adminUserName"
        },
        {
          title: this.$lang("原因"),
          minWidth: 120,
          key: "reason"
        },
        {
          title: this.$lang("创建时间"),
          minWidth: 190,
          key:"created",
          render: (h, params) =>
            h("span", this.newDate(params.row.created).format())
        },
        {
          title: this.$lang("更新时间"),
          minWidth: 190,
          key:"updated",
          render: (h, params) =>
            h("span", this.newDate(params.row.updated).format())
        },
        {
          title: this.$lang("操作"),
          fixed: "right",
          align: "center",
          slot: "action",
          width: 120
        }
      ],
      listData: [],
    };
  },
  methods: {
    loadData() {
      this.loading = true;
      this.$axios
        .get("/api/v1/margin/query/risk_config/black_list", {
          params: {
            ...this.searchForm,
          },
        })
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    doAdd() {
      this.loading = true;
      this.$axios
        .post("/api/v1/margin/add/risk_config/black_list", {
          userId: this.formData.userId,
          reason: this.formData.reason,
          confGroup: `margin.risk.calculation`,
        })
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.showModal = false;
            this.loadData();
            this.$Message.success(this.$lang("操作成功"));
          }
        });
    },
    add() {
      this.showModal = true;
      this.formData = {};
    },
    doDelete() {
      this.loading = true;
      this.$axios
        .post("/api/v1/margin/delete/risk_config/black_list", {
          userId: this.currentRow.userId,
          confGroup: 'margin.risk.calculation',
        })
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.deleteModal = false;
            this.loadData();
            this.$Message.success(this.$lang("操作成功"));
          }
        });
    },
    deleted(row) {
      this.currentRow = row
      this.deleteModal = true;
    }
  },
  created() {
    this.loadData();
  }
};
</script>
