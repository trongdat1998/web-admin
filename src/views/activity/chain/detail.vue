<template lang="pug">
Main.page-exchange
  Table(:columns="columns", :data="listData", :loading="loading", @on-selection-change="selectOption")
  Button(
    type="error",
    :disabled="cancelOrderLists.length == 0 || isRead",
    @click="cancelAll()",
    style="margin-top: 12px"
  ) {{ $lang('批量操作') }}
  Modal(v-model="chainWin",
    :title="$lang('解冻撤票')"
    width="600"
    :mask-closable="false"
    :footer-hide="true")
    Form(:label-width='130')
      FormItem(:label="$lang('谷歌验证码')" v-if="userInfo.bindGA" required)
        Input( v-model='formData.verifyCode', :placeholder="$lang('谷歌验证码')")
        span {{ $lang('tip:后台提前撤票解冻，将立即解锁对应HBC') }}
      FormItem(:label="$lang('手机验证码')" v-else required)
        Row
          Col(span="16")
            Input(v-model="formData.verifyCode" type="text" :placeholder="$lang('手机验证码')", :maxlength="6")
            span {{ $lang('tip:后台提前撤票解冻，将立即解锁对应HBC') }}
          Col(span="2" style="text-align: center") -
          Col(span="6")
            Button(v-if="time" disabled long) {{time}}s
            Button(v-else @click="getCode" long type="primary" ghost) {{$lang("获取验证码")}}
    Button(
      long,
      type="success",
      @click="submit",
      :loading="loading",
      :disabled="loading"
    ) {{ $lang('确定') }}
</template>

<script>
import { mapState } from "vuex";

export default {
  computed: {
    ...mapState(["lang", "isRead", "userInfo"]),
  },
  components: {
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--;
        }, 1000);
      }
    }
  },
  data() {
    return {
      type: '',
      cancelAllModel: false,
      cancelOrderLists: [],
      currentRow: null,
      time: 0,
      formData: {
        verifyCode: '',
      },
      chainWin: false,
      searchForm: {
        nodeId: '',
      },
      listData: [],
      loading: false,
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          title: this.$lang("序号"),
          minWidth: 100,
          type: "index"
        },
        {
          title: this.$lang("投票时间"),
          minWidth: 190,
          render: (h, p) => h("span", this.newDate(p.row.createdAt).format())
        },
        {
          title: this.$lang("投票账号(UID)"),
          minWidth: 180,
          key: "userId",
        },
        {
          title: this.$lang("投票票数"),
          minWidth: 120,
          key: "voteAmount",
        },
        {
          title: this.$lang("状态"),
          minWidth: 120,
          render: (h, p) => {
            let text = {
              0: "锁定",
              1: "解锁中",
              2: "已解锁"
            };
            return h("span", this.$lang(text[p.row.status]));
          }
        },
        {
          title: this.$lang("操作"),
          minWidth: 80,
          fixed: "right",
          align: "center",
          render: (h, params) => {
            return h(
              "Button",
              {
                on: {
                  click: () => {
                    this.edit(params.row);
                  }
                },
                attrs:{
                  disabled:this.isRead || params.row.status != 0,
                  size:"small",
                }
              },
              this.$lang("解冻撤票")
            );
          }
        }
      ]
    }
  },
  methods: {
    selectOption(selection) {
      if (selection.length) {
        selection.forEach((item) => {
          this.cancelOrderLists.push(item.voteId);
        })
      }

    },
    submit() {
      if(this.type === 'one'){
        Object.assign(this.formData, {voteId: this.currentRow.voteId}, {authType: this.userInfo.bindGA ? 1 : 2,})
        this.$axios
          .post("/api/v1/vote/record/unfrozen", this.formData)
          .then(result => {
            if (result.code == 0) {
              this.chainWin = false;
              this.loadData()
              this.$Notice.success({
                title: this.$lang("成功"),
              });
            }
          });
      } else if(this.type === 'all') {
        let voteIds = this.cancelOrderLists.join(',')
        Object.assign(this.formData, {voteIds: voteIds}, {authType: this.userInfo.bindGA ? 1 : 2,})
        this.$axios
          .post("/api/v1/vote/record/batch/unfrozen", this.formData)
          .then(result => {
            if (result.code == 0) {
              this.chainWin = false;
              this.loadData()
              this.$Notice.success({
                title: this.$lang("成功"),
              });
            }
          });
      }

    },
    getCode() {
      !this.time &&
      this.$axios
        .post("/api/v1/user/send_a_sms_verify_code", {})
        .then(result => {
          if (result.code == 0) {
            this.time = 60;
          }
        });
    },
    loadData() {
      this.loading = true;
      Object.assign(this.searchForm, {nodeId: this.$route.params.nodeId});
      this.$axios
        .post("/api/v1/vote/record/query", this.searchForm)
        .then(result => {
          this.loading = false
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    edit(row) {
      this.currentRow = row
      this.type = 'one'
      this.chainWin = true;
    },
    cancelAll() {
      this.type = 'all'
      this.chainWin = true;
    },
  },
  created() {
    this.loadData();
  }
}
</script>

<style lang="less" scoped>
</style>
