<!--特殊利息管理-->
<template lang="pug">
	.page-exchange
		Row.search(:gutter="15")
			Col(span="6")
				Input(:placeholder="$lang('币种')", v-model="searchForm.tokenId", enter-button="" )
			Col(span="6")
				Input(:placeholder="$lang('UID')", v-model="searchForm.userId", enter-button="")
			Col(span="6")
				Input(:placeholder="$lang('AID')", v-model="searchForm.accountId", search enter-button="" @on-search="loadData()")
			Col(span="4")
				Button(type="primary" long @click="add" :disabled="isRead" icon="md-add-circle" ghost) {{$lang('新建')}}
		Table(:columns="columns", :data="listData", :loading="loadingTable")
			template(slot-scope="{ row, index }" slot="effectiveFlag")
				iSwitch(:disabled="isRead" size="small" v-model="row.effectiveFlag" @on-change="change(row, index, 'effectiveFlag')", :true-value="1", :false-value="2")
			template(slot-scope="{ row, index }" slot="action")
				a(@click.prevent="edit(row)" :disabled="isRead", style="margin-right: 10px") {{$lang('修改')}}
				a(@click.prevent="onDelete(row)" :disabled="isRead") {{$lang('删除')}}
		Modal(v-model="showModal", :title="showType === 'add' ? $lang('新建特殊利息配置') : $lang('修改特殊利息配置')" width="800")
			Form(:label-width='150')
				FormItem(:label="$lang('币种')")
					Select(v-model="formData.tokenId", filterable, :disabled="showType === 'edit'")
						Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{`${item.tokenId}(${item.tokenName})`}}
				FormItem(:label="$lang('UID')")
					Input(v-model='formData.userId', :placeholder="$lang('UserId')")
				FormItem(:label="$lang('日利率')")
					Input(v-model='formData.interest', :placeholder="$lang('日利率')")
						span(slot="suffix" style="line-height:32px;") %
			template(slot="footer")
				Button(@click="submit", :loading="loading"  type="primary" :disabled="loading") {{$lang('确定')}}
			Modal(v-model="deleteModal", :title="$lang('您确定要执行此操作吗？')" width="500" footer-hide)
				Button(long type="primary" @click="doDelete" :loading="loading" :disabled="loading") {{$lang('确定')}}

</template>
<script>
  import { mapState } from 'vuex'

  export default {
    computed: {
      ...mapState(['lang', 'tokens', 'isRead']),
    },
    data () {
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
            title: this.$lang('UID'),
            minWidth: 120,
            key: 'userId'
          },
          {
            title: this.$lang('AID'),
            minWidth: 120,
            key: 'accountId'
          },
          {
            title: this.$lang('币种'),
            minWidth: 120,
            key: 'tokenId'
          },
          {
            title: this.$lang('日利率%'),
            minWidth: 120,
            key: 'showInterest'
          },
          {
            title: this.$lang('秒利率%'),
            minWidth: 120,
            key: 'interest'
          },
          {
            title: this.$lang('有效标志'),
            minWidth: 120,
            slot: 'effectiveFlag',
          },
          {
            title: this.$lang('创建时间'),
            minWidth: 100,
            key: 'created',
            render: (h, params) =>
              h('span', this.newDate(params.row.created).format('yyyy-MM-dd hh:mm:ss'))
          },
          {
            title: this.$lang('更新时间'),
            minWidth: 100,
            key: 'updated',
            render: (h, params) =>
              h('span', this.newDate(params.row.updated).format('yyyy-MM-dd hh:mm:ss'))
          },
          {
            title: this.$lang('操作'),
            fixed: 'right',
            align: 'center',
            slot: 'action',
            minWidth: 160
          }
        ],
        listData: [],
        deleteModal: false,
        currentRow: {},
      }
    },
    created () {
      this.loadData()
    },
    methods: {
      submit () {
        this.loading = true
        this.$axios.post('/api/v1/margin/set/special/interest_config', {
          ...this.formData,
          interest: this.formData.interest,
          effectiveFlag: 1
        }).then(result => {
          this.loading = false
          if (result.code == 0) {
            this.showModal = false
            this.loadData()
          }
        })
      },
      loadData () {
        this.loadingTable = true
        this.$axios
          .get('/api/v1/margin/get/special/interest_config', {
            params: {
              ...this.searchForm,
            },
          })
          .then(result => {
            this.loadingTable = false
            if (result.code == 0) {
              this.listData = result.data
            }
          })
      },
      add () {
        this.formData = {}
        this.showModal = true
        this.showType = 'add'
      },
      edit (row) {
        this.formData = {
          effectiveFlag: row.effectiveFlag,
          interest: row.showInterest,
          tokenId: row.tokenId,
          userId: row.userId,
          accountId: row.accountId,
        }
        this.showModal = true
        this.showType = 'edit'
      },
      onDelete(row) {
        this.currentRow = row;
        this.deleteModal = true;
      },
      change (row) {
        this.$axios.post('/api/v1/margin/set/special/interest_config', {
          effectiveFlag: row.effectiveFlag,
          interest: row.showInterest,
          tokenId: row.tokenId,
          userId: row.userId,
        }).then(() => {
          this.loadData();
        })
      },
      doDelete () {
        this.$axios.post('/api/v1/margin/del/special/interest_config', {
          tokenId: this.currentRow.tokenId,
          userId: this.currentRow.userId,
        }).then(ret => {
          if (ret.code === 0) {
            this.$Message.success(this.$lang('删除成功'));
          }
          this.deleteModal = false;
          this.loadData();
        })
      },
    },
  }
</script>
