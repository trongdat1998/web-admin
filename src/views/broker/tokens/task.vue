<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="20") &nbsp;
    Col(span="4")
      Button(long type="primary" @click="newOne" :disabled="isRead" icon="md-add-circle" ghost) {{$lang('新建')}}
  Table(:columns="columns", :data="listData", :loading="loadingTable" :max-height="height-260")
    template(slot-scope="{row, index }" slot="detail")
      Button(type="primary" ghost, @click="view(row,0)" size="small" :disabled="isRead" v-if="row.status==1") {{$lang("修改")}}
      Button(type="success" ghost, @click="view(row,1)" size="small" v-else) {{$lang("详情")}}
    template(slot-scope="{row, index }" slot="dailyTask")
      Tag(v-if="row.dailyTask") {{$lang("每天有效")}}
      Tag(v-else) {{$lang("一次有效")}}
    template(slot-scope="{row, index }" slot="actionTime")
      Tag {{newDate(row.actionTime).format()}}
    template(slot-scope="{row, index }" slot="status")
      Tag(v-if="row.status==0" color="error") {{$lang("已失效")}}
      Tag(v-else-if="row.status==1" color="success") {{$lang("待执行")}}
      Tag(v-else-if="row.status==2") {{$lang("已执行")}}
  Row(:gutter="20" style="padding-top:30px")
    Col(span="10")
      ButtonGroup
        Button(@click="getFirstRecordData" :disabled="searchForm.fromId == 0 " icon="ios-skip-backward")
        Button(@click="getNextRecordData" :disabled="listData.length<searchForm.pageSize" icon="ios-arrow-forward")

  Modal(v-model="addWin", :title="$lang('定时任务')" :footer-hide="isRead")
    Form(:label-width='120', :disabled="!!viewDetail")
      FormItem(:label="$lang('币种')")
        Select(v-model="formData.tokenId" filterable)
          Option(:value="item.tokenId" v-for="(item, index) in tokenIds" :key="item.tokenId+index") {{item.tokenName}}
      FormItem(:label="$lang('周期')")
        RadioGroup(v-model="formData.dailyTask")
          Radio(:label="0") {{$lang("一次有效")}}
          Radio(:label="1") {{$lang("每天有效")}}
      FormItem(:label="$lang(formData.dailyTask ? '首次执行时间':'执行时间')")
        DatePicker(format="yyyy/MM/dd HH:mm:ss" type="datetime" :placeholder="$lang(formData.actionTime ? '首次执行时间':'执行时间')" :options="options" :value="formData.actionTime" style="width:100%" @on-change="changeDate")
      FormItem(:label="$lang('状态')")
        template(v-if="!!viewDetail") {{$lang("已执行")}}
        RadioGroup(v-model="formData.status" v-else)
          Radio(:label="1") {{$lang("待执行")}}
          Radio(:label="0") {{$lang("失效")}}
      Divider {{$lang("执行操作")}}
      FormItem(:label="$lang('页面可见')")
        iSwitch(size="small"  v-model="formData.published")
      FormItem(:label="$lang('充值')")
        iSwitch(size="small"  v-model="formData.depositStatus")
      FormItem(:label="$lang('提现')")
        iSwitch(size="small"  v-model="formData.withdrawStatus")
    Button(slot="footer" type="primary" @click="submit" :loading="loading" :disabled="loading") {{$lang("确定")}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["height","isRead"])
  },
  data() {
    return {
      viewDetail: 0,
      tokenIds: [],
      options: {
        disabledDate(date) {
          return date.valueOf() < Date.now() - 86400000;
        }
      },
      loading: false,
      loadingTable: true,
      searchForm: {
        fromId: 0,
        pageSize: 100
      },
      listData: [],

      addWin: false,
      formData: {
        id: 0, //带id是修改，为0代表新增
        tokenId: "",
        published: true,
        depositStatus: false,
        withdrawStatus: false,
        actionTime: "", //下次执行时间
        status: 1, //0-失效 1-待执行任务 2-已执行完毕
        dailyTask: 0 //1-每天执行 0-一次性任务
      },
      columns: [
        {
          title: this.$lang("币种"),
          minWidth: 120,
          key: "tokenId"
        },
        {
          title: this.$lang("周期"),
          minWidth: 120,
          key: "dailyTask",
          slot: "dailyTask"
        },
        {
          title: this.$lang("执行时间"),
          minWidth: 120,
          key: "actionTime",
          slot: "actionTime"
        },
        {
          title: this.$lang("状态"),
          minWidth: 120,
          key: "status",
          slot: "status"
        },
        {
          title: this.$lang("详情"),
          minWidth: 120,
          key: "quoteTokenId",
          slot: "detail"
        }
      ]
    };
  },
  created() {
    this.loadData();
    this.$axios
      .post("/api/v1/token/query", {
        current: 1,
        pageSize: 500,
        category: 1
      })
      .then(result => {
        this.loadingTable = false;
        if (result.code === 0) {
          this.tokenIds = result.data.list ? result.data.list : [];
        }
      });
  },

  methods: {
    view(row, status) {
      this.newOne();
      Object.assign(this.formData, row);
      this.formData.actionTime = this.newDate(row.actionTime).format();
      this.viewDetail = status;
    },
    submit() {
      if (this.viewDetail) {
        return (this.addWin = false);
      }
      this.loading = true;
      let json = Object.assign({}, this.formData);
      if (json.actionTime) {
        json.actionTime = new Date(json.actionTime).getTime();
      } else {
        json.actionTime = "";
      }

      this.$axios.post("/api/v1/token/task/edit_config", json).then(result => {
        this.loading = false;
        if (result.code === 0) {
          this.loadData();
          this.addWin = false;
        }
      });
    },
    changeDate(date) {
      this.formData.actionTime = date;
    },
    newOne() {
      this.addWin = true;
      this.viewDetail = 0;
      Object.assign(this.formData, {
        id: 0, //带id是修改，为0代表新增
        tokenId: "",
        published: true,
        depositStatus: false,
        withdrawStatus: false,
        actionTime: "", //执行时间
        status: 1, //0-失效 1-待执行任务 2-已执行完毕
        dailyTask: 0 //1-每天执行 0-一次性任务
      });
    },
    loadData() {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/token/task/query_configs", this.searchForm)
        .then(result => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data;
          }
        });
    },
    getFirstRecordData() {
      this.searchForm.fromId = 0;
      this.loadData();
    },
    getNextRecordData() {
      this.searchForm.fromId = this.listData.slice(-1)[0].id;
      this.loadData();
    },
  }
};
</script>
