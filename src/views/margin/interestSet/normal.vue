<!--普通利息设置-->
<template lang="pug">
	.page-exchange
		Row.search(:gutter="15")
			Col(span="20")
				Input(:placeholder="$lang('币种')", v-model="searchForm.tokenId", search enter-button="" @on-search="loadData()")
			Col(span="4")
				Button(type="primary" long @click="add" :disabled="isRead" icon="md-add-circle" ghost) {{$lang('新建')}}
		Table(:columns="columns", :data="listData", :loading="loadingTable")
			template(slot-scope="{ row, index }" slot="action")
				a(@click.prevent="edit(row)" :disabled="isRead") {{$lang("修改")}}
		Modal(v-model="showModal", :title="showType === 'add' ? $lang('新增利息配置') : $lang('修改利息配置')" width="800")
			Form(:label-width='150')
				FormItem(:label="$lang('币种')")
					Select(v-model="formData.tokenId", filterable, :disabled="showType === 'edit'")
						Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{item.tokenName}}
				FormItem(:label="$lang('日利率')")
					Input(v-model='formData.showInterest', :placeholder="$lang('日利率')")
						span(slot="suffix" style="line-height:32px;") %
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
        formData: {
          tokenId: '',
          interest: '',
        },
        searchForm: {
          tokenId: '',
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
            title: this.$lang("日利率%"),
            minWidth: 120,
            render: (h, params) =>
              h("span", params.row.showInterest == 0 ? params.row.interest : params.row.showInterest)
          },
          {
            title: this.$lang("创建时间"),
            minWidth: 100,
            key:"created",
            render: (h, params) =>
              h("span", this.newDate(params.row.created).format('yyyy-MM-dd hh:mm:ss'))
          },
          {
            title: this.$lang("更新时间"),
            minWidth: 100,
            key:"updated",
            render: (h, params) =>
              h("span", this.newDate(params.row.updated).format('yyyy-MM-dd hh:mm:ss'))
          },
          {
            title: this.$lang("操作"),
            fixed: "right",
            align: "center",
            slot: "action",
            width: 120
          }
        ],
        listData: []
      };
    },
    methods: {
      submit() {
        this.loading = true;
        Object.assign(this.formData, {interest: this.formData.showInterest});
        this.$axios.post("/api/v1/margin/set/interest_config", {
          ...this.formData,
        }).then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.showModal = false;
            this.loadData();
          }
        });
      },
      loadData() {
        this.loadingTable = true;
        this.$axios
          .get("/api/v1/margin/get/interest_config", {
            params: {
              ...this.searchForm,
            },
          })
          .then(result => {
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
        if (row.showInterest == 0) {
          row.showInterest = row.interest;
        }
        Object.assign(this.formData,row);
        this.showModal = true;
        this.showType = 'edit';
      },
    },
    created() {
      this.loadData();
    }
  };
</script>
