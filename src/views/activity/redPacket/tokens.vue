<style lang="less" scoped>
.wrap {
  border: 1px dashed #dcdee2;
  padding: 15px;
}
.draggable {
  display: inline-block;
  padding: 8px 15px;
  border: 1px solid #dcdee2;
  margin: 10px;
  border-radius: 5px;
}
</style>
<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="16") &nbsp;
    Col(span="4")
      Button(
        :disabled="isRead",
        type="error",
        ghost,
        long,
        @click="sortWin = true"
      ) {{ $lang('排序管理') }}
    Col(span="4")
      Button(
        :disabled="isRead",
        type="primary",
        long,
        @click="createToken",
        icon="md-add-circle",
        ghost
      ) {{ $lang('新建') }}

  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable"
  )
    template(slot-scope="{row, index}", slot="status")
      iSwitch(
        :disabled="isRead",
        size="small",
        v-model="row.status",
        :true-value="1",
        :false-value="0",
        @on-change="setStatus(row, index)",
        :loading="index === editIndex"
      )
    template(slot-scope="{row, index}", slot="action")
      Button(
        :disabled="isRead",
        type="primary",
        size="small",
        ghost,
        @click="editToken(row)"
      ) {{ $lang('修改') }}

  Modal(v-model="tokenWin", :title="$lang('设置')")
    Form
      FormItem(:label="$lang('OTC交易币种')")
        Input(
          v-if="tokenForm.brokerId",
          disabled,
          :value="tokenForm.tokenName"
        )
        Select(v-model="tokenForm.tokenId", v-else, filterable)
          Option(
            :value="item.tokenId",
            v-for="item in tokens",
            :key="item.tokenId"
          ) {{ item.tokenName }}
      FormItem
        Input(type="text", v-model="tokenForm.minAmount")
          template(slot="prepend") {{ $lang('单个红包最小金额') }}
          template(slot="append") {{ tokenName }}
      FormItem
        Input(type="text", v-model="tokenForm.maxAmount")
          template(slot="prepend") {{ $lang('单个红包最大金额') }}
          template(slot="append") {{ tokenName }}
      FormItem
        Input(type="text", v-model="tokenForm.maxTotalAmount")
          template(slot="prepend") {{ $lang('红包最大金额') }}
          template(slot="append") {{ tokenName }}
      FormItem
        Input(type="text", v-model="tokenForm.maxCount")
          template(slot="prepend") {{ $lang('红包个数') }}
    Button(
      slot="footer",
      long,
      type="success",
      @click="saveToken",
      :loading="loading",
      :disabled="loading"
    ) {{ $lang('确定') }}
  Modal(v-model="sortWin", :title="$lang('排序')")
    Alert {{ $lang('选中后拖动鼠标进行排序') }}
    draggable.wrap(
      v-model="listData",
      draggable=".draggable",
      style="overflow:hidden"
    )
      span.move.draggable(v-for="item in listData") {{ item.tokenName }}
    Button(
      long,
      type="success",
      @click="saveSort",
      :loading="loading",
      :disabled="loading",
      slot="footer"
    ) {{ $lang('确定') }}
</template>
<script>
import { mapState } from "vuex";
import draggable from "vuedraggable";
export default {
  components: {
    draggable,
  },
  data() {
    return {
      sortWin: false,
      tokenWin: false,
      postStatusData: {},
      tokenForm: {
        customOrder: 0,
        id: "",
        maxAmount: "",
        maxCount: "",
        maxTotalAmount: "",
        minAmount: "",
        status: 1,
        tokenId: "",
      },
      loading: false,
      editIndex: null,
      loadingTable: true,

      columns: [
        {
          title: this.$lang("币种"),
          key: "tokenName",
          minWidth: 100,
        },
        {
          title: this.$lang("单个红包最小金额"),
          key: "minAmount",
          minWidth: 160,
        },
        {
          title: this.$lang("单个红包最大金额"),
          key: "maxAmount",
          minWidth: 160,
        },
        {
          title: this.$lang("红包最大金额"),
          key: "maxTotalAmount",
          minWidth: 160,
        },
        {
          title: this.$lang("红包个数"),
          key: "maxCount",
          minWidth: 100,
        },
        {
          title: this.$lang("状态"),
          minWidth: 100,
          slot: "status",
        },
        {
          title: this.$lang("操作"),
          minWidth: 100,
          slot: "action",
          align: "right",
        },
      ],
      listData: [],
    };
  },
  computed: {
    ...mapState(["isRead", "tokens"]),
    tokenName() {
      let str = "";
      this.tokens.forEach((el) => {
        if (el.tokenId == this.tokenForm.tokenId) {
          str = el.tokenName;
        }
      });
      return str;
    },
  },
  created() {
    this.loadData();
  },
  methods: {
    saveSort() {
      this.loading = true;
      this.$axios
        .post(
          "/api/v1/red_packet/change_token_config_custom_order",
          this.listData.map((el) => el.id)
        )
        .then((result) => {
          this.loading = false;
          if (result.code === 0) {
            this.sortWin = false;
          }
        });
    },
    editToken(row) {
      this.tokenWin = true;
      Object.assign(this.tokenForm, row);
    },
    createToken() {
      this.tokenWin = true;
      Object.assign(this.tokenForm, {
        customOrder: 0,
        id: "",
        maxAmount: "",
        maxCount: "",
        maxTotalAmount: "",
        minAmount: "",
        status: 1,
        tokenId: "",
      });
    },
    saveToken() {
      this.loading = true;

      this.$axios
        .post("/api/v1/red_packet/token_config", this.tokenForm)
        .then((result) => {
          this.loading = false;
          if (result.code === 0) {
            this.loadData();
            this.tokenWin = false;
          }
        });
    },
    loadData() {
      this.loadingTable = true;
      this.$axios.post("/api/v1/red_packet/token_configs").then((result) => {
        this.loadingTable = false;
        if (result.code === 0) {
          this.listData = result.data;
          this.editIndex = null;
        }
      });
    },
    setStatus(row, index) {
      this.editIndex = index;
      Object.assign(this.tokenForm, row);
      this.saveToken();
    },
  },
};
</script>