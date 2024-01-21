<!--风控设置-->
<template lang="pug">
	div
		div(v-if="showList")
			Form(:label-width="160" :rules="rules" ref="form" :model="formData")
				Card(dis-hover style="padding-bottom:0px")
					p(slot="title") {{$lang('风控设置')}}
					Row(:gutter="20" style="margin-top:20px")
						Col(span="12")
							FormItem(:label="$lang('提币线')" prop="withdrawLine")
								Input(v-model='formData.withdrawLine', :placeholder="$lang('提币线')" :maxlength="20")
									span(slot="suffix" style="line-height:32px;") %
							FormItem(:label="$lang('预警线')" prop="warnLine")
								Input(v-model='formData.warnLine', :placeholder="$lang('预警线')" :maxlength="20")
									span(slot="suffix" style="line-height:32px;") %
							FormItem(:label="$lang('追加线')" prop="appendLine")
								Input(v-model='formData.appendLine', :placeholder="$lang('追加线')" :maxlength="20")
									span(slot="suffix" style="line-height:32px;") %
							FormItem(:label="$lang('止损线')" prop="stopLine")
								Input(v-model='formData.stopLine', :placeholder="$lang('止损线')" :maxlength="20")
									span(slot="suffix" style="line-height:32px;") %
						Col(span="12")
							FormItem(:label="$lang('最大借币限额_SP0')")
								Input(v-model='formData.maxLoanLimit', :placeholder="$lang('最大借币限额')")
									template(slot="append") USDT
							FormItem(:label="$lang('最大借币限额_SP1')")
								Row
									Col(span="16")
										Input(v-model='formData.maxLoanLimitVip1', :placeholder="$lang('最大借币限额_SP1')")
											template(slot="append") USDT
									Col(span="1") &nbsp;
									Col(span="7")
										Button(@click="showLimitVip(1)", type="primary" :disabled="isRead") {{$lang('设置白名单')}}
							FormItem(:label="$lang('最大借币限额_SP2')")
								Row
									Col(span="16")
										Input(v-model='formData.maxLoanLimitVip2', :placeholder="$lang('最大借币限额_SP2')")
											template(slot="append") USDT
									Col(span="1") &nbsp;
									Col(span="7")
										Button(@click="showLimitVip(2)", type="primary" :disabled="isRead") {{$lang('设置白名单')}}
							FormItem(:label="$lang('最大借币限额_SP3')")
								Row
									Col(span="16")
										Input(v-model='formData.maxLoanLimitVip3', :placeholder="$lang('最大借币限额_SP3')")
											template(slot="append") USDT
									Col(span="1") &nbsp;
									Col(span="7")
										Button(@click="showLimitVip(3)", type="primary" :disabled="isRead") {{$lang('设置白名单')}}

					div.people-wrapper(style="margin-top: 20")
						div.people-header
							span.label {{$lang('告警通知')}}
							Button.addPerson(type="primary", style="margin-left: 20", @click="addPerson") {{$lang('添加手机号')}}
							div.tips ({{$lang('最多添加5个手机号')}})
						div.people-content
							FormItem.person-contact-way(
								v-for="(notifyPerson, index) in notifyPeople"
								:label="`${$lang('手机号')}-${index+1}`"
								:key="index"
							)
								Row
									Col(span="2")
										Input(v-model="notifyPerson.areaCode", :placeholder="$lang('区号(86)')", )
									Col(span="1", style="text-align:center")
										span -
									Col(span="6")
										Input(v-model="notifyPerson.phone", :placeholder="$lang('手机')")
									Col(span="4", style="margin-left: 40px")
										Button(@click="deletePerson(index)") {{$lang('删除')}}

					Alert(type="warning" show-icon v-html="$lang('riskSetting.tips')")
			Modal(v-model="warnWin" :title="$lang('')" width="300")
				h3 {{$lang('您确定要执行此操作吗？')}}
				Button(slot="footer" long type="error" @click="doSet" :loading="loading" :disabled="loading") {{$lang('确定')}}
			Fixed
				Row(:gutter="20")
					Col(span="21") &nbsp;
					Col(span="3")
						Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
						Button(@click="checkSet", :loading="loading" type="primary" :disabled="isRead" long v-else) {{$lang('保存')}}
		div(v-else)
			Row(:gutter="15")
				Col(span="20")
					Button(@click="showList = true") {{$lang('返回')}}
			Row(:gutter="15" style="padding:12px")
				Col(span="20")
					div(style="padding-top:6px;font-size: 14px; font-weight: 500") {{`${$lang('最大借币限额')}_SP${maxLoanLimitVipType}：${maxLoanLimitVip ? maxLoanLimitVip : ''}`}}
				Col(span="4")
					Button(type="primary" long @click="add" :disabled="isRead" icon="md-add-circle" ghost) {{$lang('添加白名单')}}
			Table(:columns="columns", :data="listData", :loading="loading")
				template(slot-scope="{ row, index }" slot="action")
					a(@click.prevent="deleted(row)", :disabled="isRead") {{$lang("删除")}}
			Modal(v-model="whiteWin", :title="$lang('白名单')")
				Input(v-model='whitelist', :placeholder="$lang('每行对应一个UID')"  type="textarea", :rows="10")
				template(slot="footer")
					Button(@click="setWhitelist" :loading="loading" type="primary") {{$lang("确定")}}
			Modal(v-model="deleteWin" :title="$lang('')" width="300")
				h3 {{$lang('您确定要执行此操作吗？')}}
				Button(slot="footer" long type="error" @click="doDeleted" :loading="loading" :disabled="loading") {{$lang('确定')}}
</template>
<script>
  import { mapState } from "vuex";

  export default {
    computed: {
      ...mapState(["lang", "isRead"]),
    },
    data () {
      const checkWithdrawLine = (rule, value, callback) => {
        if (200 < Number(value)) { // 和后台沟通约定为 200%
          callback();
        } else {
          callback(new Error(this.$t('提币线需大于200')));
        }
      };
      const checkWarnLine = (rule, value, callback) => {
        if (Number(value) < Number(this.formData.withdrawLine)) {
          callback();
        } else {
          callback(new Error(this.$t('预警线需小于提币线')));
        }
      };
      const checkAppendLine = (rule, value, callback) => {
        if (Number(value) < Number(this.formData.warnLine)) {
          callback();
        } else {
          callback(new Error(this.$t('追加线需小于预警线')));
        }
      };
      const checkStopLine = (rule, value, callback) => {
        if (Number(value) < Number(this.formData.appendLine)) {
          callback();
        } else {
          callback(new Error(this.$t('止损线需小于追加线')));
        }
      };
      return {
        notifyPeople: [{},],
        rules: {
          withdrawLine: [{
            required: true, validator: checkWithdrawLine, trigger: 'blur',
          }],
          warnLine: [{
            required: true, validator: checkWarnLine, trigger: 'blur',
          }],
          appendLine: [{
            required: true, validator: checkAppendLine, trigger: 'blur',
          }],
          stopLine: [{
            required: true, validator: checkStopLine, trigger: 'blur',
          }],
        },
        showList: true,
        warnWin: false,
        pageLoading: false,
        formData: {
          withdrawLine: '',
          warnLine: '',
          appendLine: '',
          stopLine: '',
          maxLoanLimit: '',
          notifyType: 1,
          maxLoanLimitVip1: '',
          maxLoanLimitVip2: '',
          maxLoanLimitVip3: '',
        },
        loading: false,
        whiteWin: false,
        deleteWin: false,
        currentRow: null,
        whitelist: "",
        maxLoanLimitVipType: '',
        maxLoanLimitVip: '',
        listData: [],
        columns: [
          {
            title: this.$lang("时间"),
            minWidth: 190,
            key: "updated",
            render: (h, params) =>
              h("span", this.newDate(params.row.updated).format())
          },
          {
            title: "UID",
            minWidth: 190,
            key: "userId",
            render: (h, params) =>
              h("User", {
                props: {
                  uid: params.row.userId
                }
              })
          },
          {
            title: this.$lang("AID"),
            minWidth: 120,
            key: "accountId"
          },
          {
            title: this.$lang("类型"),
            minWidth: 120,
            key: "vipLevel",
            render: (h, params) => {
              let type = {
                1: this.$lang('一级'),
                2: this.$lang('二级'),
                3: this.$lang('三级'),
              }
              return h("span", type[params.row.vipLevel])
            }
          },
          {
            title: this.$lang("操作"),
            fixed: "right",
            align: "center",
            slot: "action",
            width: 120
          }
        ],
      };
    },
    methods: {
      add () {
        this.whiteWin = true;
        this.whitelist = '';
      },
      addPerson() {
        if (this.notifyPeople.length <= 4) {
          this.notifyPeople.push({});
        }
      },
      deletePerson(index) {
        this.notifyPeople.splice(index, 1);
      },
      showLimitVip (type) {
        this.maxLoanLimitVipType = type
        if (type == 1) {
          this.maxLoanLimitVip = this.formData.maxLoanLimitVip1
        } else if (type == 2) {
          this.maxLoanLimitVip = this.formData.maxLoanLimitVip2
        } else {
          this.maxLoanLimitVip = this.formData.maxLoanLimitVip3
        }
        this.showList = false;
        this.loading = true;
        this.$axios.get("/api/v1/margin/query/loan_limit/risk_config", {
          params: {
            vipLevel: type,
          },
        }).then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
      },
      setWhitelist () {
        let userIds = [];
        let data = ''
        let ids = this.whitelist.split("\n");
        if (ids.length) {
          userIds = ids.filter(item => {
            if (item.trim().length) {
              return item;
            }
          });
          data = userIds.join()
        }
        this.loading = true;
        this.$axios
          .post("/api/v1/margin/set/loan_limit/risk_config", {
            vipLevel: this.maxLoanLimitVipType,
            userIds: data
          })
          .then(result => {
            this.loading = false;
            if (result.code == 0) {
              this.whiteWin = false;
              this.showLimitVip(this.maxLoanLimitVipType);
              this.$Message.success(this.$lang("操作成功"));
            }
          });
      },
      deleted (row) {
        this.currentRow = row;
        this.deleteWin = true;
      },
      doDeleted () {
        this.loading = true;
        this.$axios
          .post("/api/v1/margin/delete/loan_limit/risk_config", {
            userId: this.currentRow.userId,
          })
          .then(result => {
            this.loading = false;
            this.deleteWin = false;
            if (result.code == 0) {
              this.showLimitVip(this.maxLoanLimitVipType)
              this.$Message.success(this.$lang("操作成功"));
            }
          });
      },
      checkSet () {
        this.warnWin = true;
      },
      doSet () {
        this.$refs.form.validate((vaild) => {
          if (vaild) {
            this.loading = true;
            this.pageLoading = true;
            const notifyNumber = this.notifyPeople
	            .filter(item => item.areaCode && item.phone)
	            .map(item => `${item.areaCode}-${item.phone}`
            ).join(";")
            this.$axios.post("/api/v1/margin/set/risk_config", {
              withdrawLine: Number(this.formData.withdrawLine),
              warnLine: Number(this.formData.warnLine),
              appendLine: Number(this.formData.appendLine),
              stopLine: Number(this.formData.stopLine),
              maxLoanLimit: this.formData.maxLoanLimit,
              maxLoanLimitVip1: this.formData.maxLoanLimitVip1,
              maxLoanLimitVip2: this.formData.maxLoanLimitVip2,
              maxLoanLimitVip3: this.formData.maxLoanLimitVip3,
              notifyType: this.formData.notifyType,
              notifyNumber,
            }).then(result => {
              this.loading = false;
              this.pageLoading = false;
              if (result.code == 0) {
                this.loadData();
                this.warnWin = false;
                this.$Message.success(this.$lang("成功"));
              }
            });
          }
        });
      },
      loadData () {
        this.loading = true;
        this.pageLoading = true;
        this.$axios
          .get("/api/v1/margin/get/risk_config", {})
          .then(result => {
            this.loading = false;
            this.pageLoading = false;
            if (result.code == 0 && result.data.length) {
              let {notifyType, notifyNumber} = result.data[0];
              let notifyPeople = [];
              if (notifyType == 1) {
                notifyNumber.split(';').forEach(item => {
                  notifyPeople.push({
                    areaCode: item.split('-')[0],
                    phone: item.split('-')[1]
                  });
                });
              }
              let data = {
                withdrawLine: Number(result.data[0].withdrawLine),
                warnLine: Number(result.data[0].warnLine),
                appendLine: Number(result.data[0].appendLine),
                stopLine: Number(result.data[0].stopLine),
                maxLoanLimit: result.data[0].maxLoanLimit,
                maxLoanLimitVip1: result.data[0].maxLoanLimitVip1,
                maxLoanLimitVip2: result.data[0].maxLoanLimitVip2,
                maxLoanLimitVip3: result.data[0].maxLoanLimitVip3,
                notifyType: 1,
              }
              Object.assign(this.formData, data);
              this.notifyPeople = notifyPeople;
            }
          });
      },
    },
    created () {
      this.loadData();
    }
  };
</script>
<style lang="less" scoped>

	.people-wrapper {
		margin: 10px 0;
	}

	.people-header {
		display: flex;
		align-items: center;
	}

	.people-content {
		margin-left: 20px;
	}

	.label {
		width: 160px;
		text-align: right;
		margin-right: 5px;
		padding: 10px 12px;
	}

	.tips {
		margin-left: 10px;
	}

	.addPerson {

	}
	.deletePerson {

	}

	.person-contact-way {
		margin-top: 10px;
	}
</style>
