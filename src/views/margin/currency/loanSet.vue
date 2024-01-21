<!--杠杆币种借贷设置-->
<template lang="pug">
	.page-exchange
		Row.search(:gutter="15")
			Col(span="20")
				Input(:placeholder="$lang('币种')", v-model="searchForm.tokenId", search enter-button="" @on-search="loadData()")
			Col(span="4")
				Button(type="primary" long @click="add" :disabled="isRead" icon="md-add-circle" ghost) {{$lang('新建')}}
		Table(:columns="columns", :data="listData", :loading="loadingTable")
			template(slot-scope="{ row, index }" slot="status")
				iSwitch(:disabled="isRead" size="small" v-model="row.status" @on-change="onStatusChange(row,index)" :true-value="1" :false-value="2")
			template(slot-scope="{ row, index }" slot="action")
				a(@click.prevent="edit(row)" :disabled="isRead") {{$lang('修改')}}
		Modal(v-model="switchWin" title="" width="300" @on-cancel="cancel")
			h3 {{$lang('您确定要执行此操作吗？')}}
			Button(slot="footer" long type="error" @click="submit" :loading="loading" :disabled="loading") {{$lang('确定')}}
		Modal(v-model="showModal", :title="showType === 'add' ? $lang('新增币种借贷配置') : $lang('修改币种借贷配置')" width="800")
			Form(:label-width='150',:model="formData")
				FormItem(:label="$lang('币种')")
					Select(v-model="formData.tokenId", filterable, :disabled="showType === 'edit'")
						Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{`${item.tokenId}(${item.tokenName})`}}
				FormItem(:label="$lang('借贷上限')")
					Input(v-model='formData.limitAmount', :placeholder="$lang('上限金额')")
				FormItem(:label="$lang('是否开启')", prop="status")
					iSwitch(size="small" v-model="formData.status" :true-value="1" :false-value="2")
			template(slot="footer")
				Button(@click="submit", :loading="loading"  type="primary" :disabled="loading") {{$lang('确定')}}

</template>
<script>
  import { mapState } from "vuex";
  export default {
    computed: {
      ...mapState(["lang", "tokens", "isRead"]),
    },
    data () {
      return {
        showType: "",
        showModal: false,
        formData: {
          tokenId: "",
          limitAmount: "",
          status: 1,
        },
        searchForm: {
          tokenId: "",
        },
        loading: false,
        loadingTable: false,
        columns: [
          {
            title: this.$lang("币种"),
            minWidth: 120,
            key: "tokenId",
          },
          {
            title: this.$lang("限额"),
            minWidth: 120,
            key: "limitAmount",
          },
          {
            title: this.$lang("状态"),
            minWidth: 120,
            slot: "status",
          },
          {
            title: this.$lang("创建时间"),
            minWidth: 100,
            key: "created",
            render: (h, params) =>
              h(
                "span",
                this.newDate(params.row.created).format("yyyy-MM-dd hh:mm:ss")
              ),
          },
          {
            title: this.$lang("更新时间"),
            minWidth: 100,
            key: "updated",
            render: (h, params) =>
              h(
                "span",
                this.newDate(params.row.updated).format("yyyy-MM-dd hh:mm:ss")
              ),
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
        switchWin: false,
      };
    },
    methods: {
      submit () {
        this.loading = true;
        this.$axios
          .post("/api/v1/margin/set/token_config/loan_limit", {
            ...this.formData,
            status: this.formData.status,
          })
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              this.showModal = false;
              this.switchWin = false;
              this.formData = {
                status: 1
              };
              this.loadData();
            }
          });
      },
      loadData () {
        this.loadingTable = true;
        this.$axios
          .get("/api/v1/margin/get/token_config/loan_limit", {
            params: {
              ...this.searchForm,
            },
          })
          .then((result) => {
            this.loadingTable = false;
            if (result.code == 0) {
              this.listData = result.data;
            }
          });
      },
      add () {
        this.showModal = true;
        this.showType = "add";
      },
      cancel () {
        this.listData = [...this.listData];
        this.switchWin = false;
      },
      edit (row) {
        Object.assign(this.formData, row);
        this.showModal = true;
        this.showType = "edit";
      },
      onStatusChange (row, index) {
        this.formData = {
          tokenId: row.tokenId,
          limitAmount: row.limitAmount,
          status: row.status,
        };
        this.switchWin = true;
      },
    },
    created () {
      this.loadData();
    },
  };
</script>
