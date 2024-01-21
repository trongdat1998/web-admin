<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="8")
      Input(:placeholder="$lang('经纪人ID')" v-model="searchForm.userId")
    Col(span="8")
      Input(:placeholder="$lang('经纪人姓名')" v-model="searchForm.agentName")
    Col(span="4")
      Button(type="primary" @click="loadData()" long icon="md-search") {{$lang('搜索')}}
    Col(span="4")
      Button(type="primary" @click="newOne" ghost long :disabled="isRead" icon="md-add-circle") {{$lang('新建')}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable")
    template(slot-scope="{ row, index }" slot="action")
      template(v-if="isRead") ---
      template(v-else)
        Button(size="small" type="error" ghost @click.prevent="remove(row)" v-if="row.status==1") {{$lang(row.level==1?"休眠":"解除")}}
        Button(size="small" type="success" ghost @click.prevent="add(row)" v-else) {{$lang(row.level==1?"唤醒":"绑定")}}
        | &nbsp;&nbsp;|&nbsp;&nbsp;
        a(@click.prevent="create(row)") {{$lang("修改")}}
  div(style="padding-top:30px")
    ButtonGroup
      Button(icon="ios-arrow-back" @click="prev"  :disabled="searchForm.page==1")
      Button(icon="ios-arrow-forward" @click="next"  :disabled="listData.length<searchForm.limit")
  Modal.page-exchange-win(v-model="createWin", :title="$lang('经纪人')")
    Form(:labelWidth="120")
      FormItem(:label="$lang('经纪人UID')")
        Input(v-model='formData.userId', :placeholder="$lang('经纪人UID')")
      FormItem(:label="$lang('经纪人名称')")
        Input(v-model='formData.agentName', :placeholder="$lang('经纪人姓名')")
      FormItem(:label="$lang('负责人')")
        Input(v-model='formData.leader', :placeholder="$lang('负责人')")
      FormItem(:label="$lang('负责人手机号')")
        Input(v-model='formData.mobile', :placeholder="$lang('手机号')")
      FormItem(:label="$lang('币币返佣')")
        template(v-if="formData.level==1")
          Input(v-model='formData.coinRate', :maxlength="5" :placeholder="$lang('币币佣金比例')")
            span(slot="suffix" style="line-height:32px;") %
          Alert {{$lang('币币佣金比例')}}
        template(v-else)
          Input(v-model='formData.lowLevelCoinRate', :maxlength="5" :placeholder="$lang('币币分配给下级佣金比例')")
            span(slot="suffix" style="line-height:32px;") %
          Alert {{$lang('币币分配给下级佣金比例')}}
      FormItem(:label="$lang('合约返佣')")
        template(v-if="formData.level==1")
          Input(v-model='formData.contractRate', :maxlength="5" :placeholder="$lang('合约佣金比例')")
            span(slot="suffix" style="line-height:32px;") %
          Alert {{$lang('合约佣金比例')}}
        template(v-else)
          Input(v-model='formData.lowLevelContractRate', :maxlength="5" :placeholder="$lang('合约分配给下级佣金比例')")
            span(slot="suffix" style="line-height:32px;") %
          Alert {{$lang('合约分配给下级佣金比例')}}
      FormItem(:label="$lang('说明')")
        Input(v-model='formData.mark', :placeholder="$lang('说明')" type="textarea" :rows="4")
    template(slot="footer")
      Button(@click="createWin=false" type="text") {{$lang("取消")}}
      Button(@click="submit" type="primary" :loading="loading" :disabled="loading") {{$lang("确定")}}
  Modal(v-model="removeWin" :title="$lang(addForm.level==1?'休眠':'解除')" width="300")
    Alert(type="error") {{$lang('您确定执行此操作吗？')}}<br><br>UID:{{addForm.userId}}
    Button(slot="footer" long type="error" @click="doRemove" :loading="loading" :disabled="loading") {{$lang(addForm.level==1?'休眠':'解除')}}
  Modal(v-model="addWin" :title="$lang(addForm.level==1?'唤醒':'绑定')" width="300")
    Input(v-model="addForm.targetUserId" placeholder="UID" :disabled="addForm.level==1")
    Button(slot="footer" long type="success" @click="doAdd" :loading="loading" :disabled="loading") {{$lang(addForm.level==1?'唤醒':'绑定')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["isRead"])
  },
  data() {
    return {
      addWin: false,
      removeWin: false,

      addForm: {
        targetUserId: "",
        userId: "",
        level: ""
      },
      createWin: false,
      searchForm: {
        userId: "",
        agentName: "",
        page: 1,
        limit: 20
      },
      formData: {
        userId: "",
        agentName: "",
        leader: "",
        mobile: "",
        level: 1,
        mark: "",
        coinRate: 0,
        lowLevelCoinRate: 0,
        contractRate: 0,
        lowLevelContractRate: 0
      },
      loadingTable: true,
      loading: false,
      columns: [
        {
          title: this.$lang("经纪人名称"),
          key: "agentName",
          minWidth: 120
        },

        {
          title: this.$lang("经纪人UID"),
          minWidth: 190,
          key: "userId",
          render: (h, params) => {
            return h("User", {
              props: {
                uid: params.row.userId
              }
            });
          }
        },
        {
          title: this.$lang("手机号"),
          minWidth: 140,
          render: (h, params) =>
            h("span", params.row.mobile ? params.row.mobile : "----")
        },
        {
          title: this.$lang("邮箱"),
          minWidth: 140,
          key: "email",
          render: (h, params) =>
            h("span", params.row.email ? params.row.email : "----")
        },
        {
          title: this.$lang("经纪人级别"),
          minWidth: 140,
          render: (h, params) =>
            h("Tag", { props: { color: "error" } }, params.row.level)
        },
        {
          title: this.$lang("负责人"),
          minWidth: 120,
          key: "leader"
        },
        {
          title: this.$lang("负责人手机号"),
          minWidth: 160,
          key: "leaderMobile"
        },
        {
          title: this.$lang("上级经纪人"),
          minWidth: 140,
          key: "superiorName",
          render: (h, params) =>
            h(
              "span",
              params.row.superiorName ? params.row.superiorName : "----"
            )
        },
        {
          title: this.$lang("发展会员数"),
          minWidth: 170,
          key: "peopleNumber"
        },
        {
          title: this.$lang("说明"),
          minWidth: 140,
          key: "mark"
        },
        {
          title: this.$lang("创建时间"),
          minWidth: 160,
          key: "time"
        },
        {
          title: this.$lang("操作"),
          minWidth: 160,
          fixed: "right",
          align: "center",
          slot: "action"
        }
      ],
      listData: []
    };
  },
  methods: {
    doRemove() {
      this.loading = true;
      this.$axios
        .post("/api/v1/agent/cancel/agent", {
          userId: this.addForm.userId
        })
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.removeWin = false;
            this.loadData();
          }
        });
    },
    doAdd() {
      this.loading = true;
      this.$axios
        .post("/api/v1/agent/rebind/agent", this.addForm)
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.addWin = false;
            this.loadData();
          }
        });
    },
    create(row) {
      this.createWin = true;
      this.newOne();
      this.mobile = row.leaderMobile;
      Object.assign(this.formData, row);
    },
    remove(row) {
      this.removeWin = true;
      Object.keys(this.addForm).forEach(el => {
        this.addForm[el] = "";
      });
      Object.assign(this.addForm, row);
    },
    add(row) {
      this.addWin = true;
      Object.keys(this.addForm).forEach(el => {
        this.addForm[el] = "";
      });

      Object.assign(this.addForm, row);

      if (row.level == 1) {
        this.addForm.targetUserId = row.userId;
      }
    },
    prev() {
      if (this.searchForm.page > 1) {
        this.searchForm.page--;
        this.loadData(true);
      }
    },
    next() {
      if (this.listData.length >= this.searchForm.limit) {
        this.searchForm.page++;
        this.loadData(true);
      }
    },
    newOne() {
      Object.assign(this.formData, {
        userId: "",
        agentName: "",
        leader: "",
        mobile: "",
        mark: "",
        level: 1,
        coinRate: 0,
        lowLevelCoinRate: 0,
        contractRate: 0,
        lowLevelContractRate: 0
      });
      this.createWin = true;
    },
    loadData(s) {
      if (!s) {
        this.searchForm.page = 1;
      }
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/agent/query/broker/agent/list", this.searchForm)
        .then(result => {
          this.loadingTable = false;
          this.listData = [];
          if (result.code === 0 && result.data) {
            this.listData = result.data.data;
            this.searchForm.page = result.data.page;
          }
        });
    },
    submit() {
      this.loading = true;
      this.$axios.post("/api/v1/agent/add", this.formData).then(result => {
        this.loading = false;
        if (result.code === 0) {
          this.createWin = false;
          this.loadData();
        }
      });
    }
  },
  created() {
    this.loadData();
  }
};
</script>