<template lang="pug">
div
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{row, index }" slot="minQuote") 
      template(v-if="!row.configed") {{$lang('未配置')}}
      template(v-else) {{row.minQuote?row.minQuote:"----"}}
    template(slot-scope="{row, index }" slot="maxQuote") 
      template(v-if="!row.configed") {{$lang('未配置')}}
      template(v-else) {{row.maxQuote?row.maxQuote:"----"}}
    template(slot-scope="{row, index }" slot="scale") 
      template(v-if="!row.configed") {{$lang('未配置')}}
      template(v-else) {{row.scale?row.scale:"----"}}
    template(slot-scope="{row, index }" slot="status")
      Tag(:color="row.status>0?'primary':'default'") {{$lang(row.status?'已启用':"未启用")}}
    template(slot-scope="{row, index}" slot="action")
      Button(type="primary" size="small" ghost @click="editToken(row)" :disabled="isRead") {{$lang('修改')}}
  Modal(v-model="tokenWin" :title="$lang('修改')" footer-hide)
    Form(:labelWidth="120")
      FormItem(:label="$lang('法币')")
        Input(disabled :value="formData.code")
      FormItem(:label="$lang('小数精度')")
        Select(v-model="formData.scale")
          Option(:value="item" v-for="item in 10" :key="item") {{item}}
      FormItem(:label="$lang('交易最低限额')")
        Input(type="text"  v-model="formData.minQuote")
      FormItem(:label="$lang('交易最高限额')")
        Input(type="text"  v-model="formData.maxQuote")
      FormItem(:label="$lang('状态')")
        iSwitch(size="small" v-model="formData.status" :true-value="1" :false-value="0")
      Button(long type="primary" @click="saveToken" :loading="loading" :disabled="loading") {{$lang('确定')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      tokenWin: false,
      formData: {
        code: "",
        minQuote: "",
        maxQuote: "",
        scale: "",
        amountScale: "",
        configed: false,
        status: "",
      },
      tokens: [],
      loading: false,
      editIndex: null,
      loadingTable: true,

      columns: [
        {
          title: this.$lang("法币"),
          key: "code",
          minWidth: 100,
        },
        {
          title: this.$lang("交易最低限额"),
          key: "minQuote",
          minWidth: 100,
          slot: "minQuote",
        },
        {
          title: this.$lang("交易最高限额"),
          key: "maxQuote",
          minWidth: 100,
          slot: "maxQuote",
        },
        {
          title: this.$lang("小数精度"),
          key: "scale",
          minWidth: 100,
          slot: "scale",
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
    ...mapState(["isRead"]),
  },
  created() {
    this.loadData();
  },
  methods: {
    editToken(row) {
      this.tokenWin = true;
      Object.assign(this.formData, {
        code: "",
        minQuote: "",
        maxQuote: "",
        scale: "",
        amountScale: "",
        configed: false,
        status: 0,
      });

      Object.assign(this.formData, row);
    },

    saveToken() {
      this.loading = true;
      this.$axios
        .post("/api/v1/otc/config/broker/currency/save", this.formData)
        .then((result) => {
          this.loading = false;
          if (result.code === 0) {
            this.tokenWin = false;
            this.loadData();
          }
        });
    },
    loadData() {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/otc/config/broker/currency/list")
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
