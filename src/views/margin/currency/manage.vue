<!--币种管理-->
<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="20") &nbsp;
    Col(span="4")
      Button(type="primary" long @click="add" :disabled="isRead" icon="md-add-circle" ghost) {{$lang('新建')}}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{ row, index }" slot="isOpen")
      iSwitch(:disabled="isRead" size="small" v-model="row.isOpen" @on-change="change(row,index,'isOpen')" :true-value="1" :false-value="2")
    template(slot-scope="{ row, index }" slot="canBorrow")
      Tag(v-if="row.isOpen == 2") {{$lang("需开启币种可用")}}
      iSwitch(:disabled="isRead" size="small" v-model="row.canBorrow" @on-change="change(row,index,'canBorrow')" v-else)
    template(slot-scope="{ row, index }" slot="action")
      a(@click.prevent="edit(row)", :disabled="isRead") {{$lang("修改")}}
  Modal(v-model="switchWin" title="" width="300" @on-cancel="cancel")
    h3 {{$lang('您确定要执行此操作吗？')}}
    Button(slot="footer" long type="error" @click="submit" :loading="loading" :disabled="loading") {{$lang('确定')}}
  Modal(v-model="showModal", :title="showType === 'add' ? $lang('新建杠杆币种') : $lang('修改杠杆币种')" width="600")
    Form(:label-width='150')
      FormItem(:label="$lang('币种')")
        Select(v-model="formData.tokenId", filterable, :disabled="showType === 'edit'")
          Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{`${item.tokenId}(${item.tokenName})`}}
      FormItem(:label="$lang('折算率')")
        Input(v-model='formData.convertRate', :placeholder="$lang('折算率，0-1之间')")
      FormItem(:label="$lang('杠杆倍数')")
        Input(v-model='formData.leverage', :placeholder="$lang('杠杆倍数')")
      FormItem(:label="$lang('单次融币最大数量')")
        Input(v-model='formData.maxQuantity', :placeholder="$lang('单次融币最大数量')")
      FormItem(:label="$lang('单次融币最小数量')")
        Input(v-model='formData.minQuantity', :placeholder="$lang('单次融币最小数量')")
      FormItem(:label="$lang('融币数量精度')")
        Input(v-model='formData.quantityPrecision', :placeholder="$lang('融币数量精度,如精确到0.0001填4')")
      FormItem(:label="$lang('最小还币数量')")
        Input(v-model='formData.repayMinQuantity', :placeholder="$lang('最小还币数量')")
      FormItem(:label="$lang('利息展示精度')")
        Input(v-model='formData.showInterestPrecision', :placeholder="$lang('利息展示精度')")
    template(slot="footer")
      Button(@click="submit", :loading="loading"  type="primary" :disabled="loading") {{$lang('确定')}}

</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["lang", "tokens", "isRead"]),
  },
  data() {
    return {
      showType: '',
      showModal: false,
      switchWin: false,
      formData: {
        tokenId: '',
        convertRate: '',
        leverage: '',
        maxQuantity: '',
        minQuantity: '',
        quantityPrecision: '',
        repayMinQuantity: '',
        canBorrow: '',
        isOpen: '',
        showInterestPrecision: '',
      },
      searchForm: {
        endId: 0,
        fromId: 0,
        limit: 100
      },
      loading: false,
      loadingTable: false,
      columns: [

        {
          title: this.$lang("币种"),
          minWidth: 120,
          key: "tokenId"
        },
        {
          title: this.$lang("折算率"),
          minWidth: 120,
          key: "convertRate"
        },
        {
          title: this.$lang("杠杆倍数"),
          minWidth: 120,
          key: "leverage"
        },
        {
          title: this.$lang("币种可用"),
          slot: "isOpen",
          minWidth: 120,
        },
        {
          title: this.$lang("可借"),
          slot: "canBorrow",
          minWidth: 140,
        },
        {
          title: this.$lang("融币最大数量"),
          minWidth: 120,
          key: "maxQuantity"
        },
        {
          title: this.$lang("融币最小数量"),
          minWidth: 120,
          key: "minQuantity"
        },
        {
          title: this.$lang("融币数量精度"),
          minWidth: 120,
          key: "quantityPrecision"
        },
        {
          title: this.$lang("最小还币数量"),
          minWidth: 120,
          key: "repayMinQuantity"
        },
        {
          title: this.$lang("利息展示精度"),
          minWidth: 120,
          key: "showInterestPrecision"
        },
        {
          title: this.$lang("创建时间"),
          minWidth: 190,
          key:"created",
          render: (h, params) =>
            h("span", this.newDate(params.row.created).format('yyyy-MM-dd'))
        },
        {
          title: this.$lang("更新时间"),
          minWidth: 190,
          key:"updated",
          render: (h, params) =>
            h("span", this.newDate(params.row.updated).format('yyyy-MM-dd'))
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
    submit() {
      if(this.showType === 'add'){
        Object.assign(this.formData, {canBorrow: true});
      }
      this.loading = true;
      this.$axios.post("/api/v1/margin/set/token_config", {
        ...this.formData,
      }).then(result => {
        this.loading = false;
        if (result.code == 0) {
          this.showModal = false;
          this.switchWin = false;
          this.loadData();
        }
      });
    },
    loadData() {
      this.loadingTable = true;
      this.$axios.get("/api/v1/margin/get/token_config", {
        tokenId: '',
      }).then(result => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    add() {
      this.formData = {};
      this.showModal = true;
      this.showType = 'add';
    },
    edit(row) {
      Object.assign(this.formData,row);
      this.showModal = true;
      this.showType = 'edit';
    },
    change(row) {
      Object.assign(this.formData,row);
      this.switchWin = true;
    },
    cancel() {
      this.listData = [...this.listData];
    },
  },
  created() {
    this.loadData();
  }
};
</script>
