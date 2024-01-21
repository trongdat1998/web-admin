<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="searchForm.nodeType" @on-change="loadData")
        Option(:value="0") {{$lang("全部")}}
        Option(:value="1") {{$lang("托管节点")}}
        Option(:value="2") {{$lang("共识节点")}}
    Col(span="16")
      Input(v-model="searchForm.nodeName", :placeholder="$lang('请输入节点名称')" search, @on-search="loadData"  enter-button="")
    Col(span="4")
      Button(:disabled="isRead" long type="primary" ghost, @click="create" icon="md-add-circle") {{$lang("新建")}}
  Table(:columns="columns", :data="listData", :loading="loading")
    template(slot-scope="{row, index}" slot="action")
      template
        a(:href="'/activity/chain/'+ row.nodeId") {{$lang('查看')}}
        | &nbsp;&nbsp;|&nbsp;&nbsp;
        a(@click.prevent="edit(row)") {{$lang("修改")}}
    template(slot-scope="{ row, index }", slot="publish")
      iSwitch(:disabled="false" size="small" v-model="row.status" :true-value="1" :false-value="0" @on-change="editConfig(row)" :loading="loading")
    template(slot-scope="{ row, index }", slot="lockAmount")
      span {{ row.lockAmount }} &nbsp;&nbsp;
      a(@click.prevent="unfreeze(row)", :disabled="isRead || row.isAdmin || row.lockStatus != 0") {{$lang("解冻撤票")}}
  Modal(v-model="chainWin",
    :title="chainWinType === 'create' ? $lang('新增') :  $lang('修改')"
    width="800"
    :mask-closable="false"
    :footer-hide="isRead")
    Form(:label-width='130')
      Row(:gutter="15")
        Col(span="12")
          FormItem(:label="$lang('节点名称')")
            Input(v-model="formData.nodeName" :placeholder="$lang('节点名称')")
          FormItem(:label="$lang('联系人')")
            Input(v-model="formData.userName" :placeholder="$lang('联系人')")
          FormItem(:label="$lang('节点类型')")
            Select(v-model="formData.nodeType")
              Option(:value="1") {{$lang("托管节点")}}
              Option(:value="2") {{$lang("共识节点")}}
          FormItem(:label="$lang('锁仓交易账户(UID)')")
            Input(v-model="formData.lockUserId" placeholder="UID" :disabled="(!formData.isAdmin && chainWinType === 'edit') || formData.isLockModel == 'false'")
        Col(span="12")
          FormItem(:label="$lang('节点图标')")
            Input(v-model='formData.nodeIcon', :placeholder="$lang('节点图标')")
              Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false")
                Icon(type="md-cloud-upload" v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading" v-show="uploading")
          FormItem(:label="$lang('联系方式')")
            Input(v-model="formData.mobile" :placeholder="$lang('联系方式')")
          FormItem(:label="$lang('自有锁仓')")
            Select(v-model="formData.isLockModel" :disabled="!formData.isAdmin && chainWinType === 'edit'" @on-change="changeIsLockModel")
              Option(value="false") {{$lang("否")}}
              Option(value="true") {{$lang("是")}}
          FormItem(:label="$lang('锁仓HBC数量')")
            Input(v-model="formData.lockAmount" :placeholder="$lang('锁仓HBC数量')" :disabled="(!formData.isAdmin && chainWinType === 'edit') || formData.isLockModel == 'false'")
      Row(:gutter="15")
        Col(span="24")
          FormItem(:label="$lang('节点竞选标语')")
            Input(v-model="formData.slogan" :placeholder="$lang('节点竞选标语')")
      Alert
        Checkbox(v-for="item in localeDetail", v-model="item.enabled", :key="item.language") {{lang[item.language]}}
      Row(:gutter="20")
        Col(v-for="(item,index) in localeDetail" v-if="item.enabled" ,:key="index" span="24")
          Divider(size="small") {{lang[item.language]}}
          quill-editor.editor(
            v-model="item.introduction",
            :options="editorOption"
          )
    Button(slot="footer" long type="error" @click="doHandle" :loading="loading" :disabled="loading") {{$lang('确定')}}
  Modal(v-model="confirmWin" :title="$lang('您确定要执行此操作吗？')" width="300" @on-cancel="cancel")
    p {{$lang(confirmForm.status == "1" ? "开启" : "关闭")}} {{$lang("页面可见")}}
    Button(slot="footer" long type="error" @click="doSwitch" :loading="loading" :disabled="loading") {{$lang('确定')}}
  Modal(v-model="unfreezeWin",
    :title="$lang('解冻撤票')"
    width="600"
    :mask-closable="false"
    :footer-hide="true")
    Form(:label-width='130')
      FormItem(:label="$lang('谷歌验证码')" v-if="userInfo.bindGA" required)
        Input( v-model='unfreezeData.verifyCode', :placeholder="$lang('谷歌验证码')")
        span {{ $lang('tip:后台提前撤票解冻，将立即解锁对应HBC') }}
      FormItem(:label="$lang('手机验证码')" v-else required)
        Row
          Col(span="16")
            Input(v-model="unfreezeData.verifyCode" type="text" :placeholder="$lang('手机验证码')", :maxlength="6")
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
import { Quill, quillEditor } from "vue-quill-editor";
import "quill/dist/quill.snow.css";
import { initData } from "@/libs/common.js";
import { Decimal } from "decimal.js";

const icons = Quill.import('ui/icons');
icons.header[3] = require('!html-loader!quill/assets/icons/header-3.svg');
icons.header[4] = require('!html-loader!quill/assets/icons/header-4.svg');
icons.header[5] = require('!html-loader!quill/assets/icons/header-5.svg');
icons.header[6] = require('!html-loader!quill/assets/icons/header-6.svg');
export default {
  computed: {
    ...mapState(["lang", "isRead", "userInfo"]),
  },
  components: {
    quillEditor,
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
      time: 0,
      unfreezeWin: false,
      currentRow: null,
      confirmWin: false,
      localeDetail: [],
      uploading: false,
      confirmForm: {
        status: "",
        key: ""
      },
      unfreezeData: {
        verifyCode: '',
      },
      formData: {
        nodeName: '',
        userName: '',
        nodeType: 1,
        lockUserId: '',
        nodeIcon: '',
        mobile: '',
        lockAmount: '',
        isLockModel: 'false',
        introductions: [],
        slogan: '',
      },
      chainWinType: 'create',
      chainWin: false,
      type: 1, //
      searchForm: {
        nodeType: 0, // 1-跨链托管节点,2-共识节点
        nodeName: '',
      },
      editorOption: {
        //  富文本编辑器配置
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"], //加粗，斜体，下划线，删除线
            [{ 'header': 1 }, { 'header': 2 }, {'header': 3}, {'header': 4}, {'header': 5}],
            [{ 'size': ['small', false, 'large']}],
            [{ list: "ordered" }, { list: "bullet" }], //列表
            [{ indent: "-1" }, { indent: "+1" }], // 缩进
            [{'align': null}, { 'align': 'center'}, { 'align': 'right'}],
            // ['link', 'image'],
          ],
        },
        theme: "snow",
        placeholder: this.$lang("介绍文案，请输入正文1-1024字"),
      },
      listData: [],
      loading: false,
      columns: [
        {
          title: this.$lang("排名"),
          minWidth: 60,
          type: "index"
        },
        {
          title: this.$lang("节点类型"),
          minWidth: 120,
          render: (h, p) => {
            let text = {
              1: "跨链托管节点",
              2: "共识节点"
            };
            return h("span", this.$lang(text[p.row.nodeType]));
          }
        },
        {
          title: this.$lang("申请时间"),
          minWidth: 180,
          render: (h, p) => h("span", this.newDate(p.row.createdAt).format())
        },
        {
          title: this.$lang("页面可见"),
          width: 100,
          slot: "publish",
        },
        {
          title: this.$lang("图标"),
          minWidth: 100,
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.nodeIcon,
                width: 40
              }
            });
          }
        },
        {
          title: this.$lang("节点名称"),
          minWidth: 160,
          key: "nodeName",
        },
        {
          title: this.$lang("节点竞选标语"),
          width: 190,
          key: "slogan"
        },
        {
          title: this.$lang("创建方式"),
          minWidth: 120,
          render: (h, p) => {
            return h("span", p.row.isAdmin ? this.$lang('后台录入') : this.$lang('前端申请'));
          }
        },
        {
          title: this.$lang("HBTC账号"),
          minWidth: 180,
          key: "userId",
          render: (h, params) => {
            if (params.row.userId == 0) {
              return h("span", params.row.userId)
            }
            return h("User", {
              props: {
                uid: params.row.userId,
              },
            })
          }
        },
        {
          title: this.$lang("联系人"),
          minWidth: 120,
          key: "userName",
        },
        {
          title: this.$lang("电话"),
          minWidth: 120,
          key: "mobile",
        },
        {
          title: this.$lang("自有冻结票数"),
          minWidth: 160,
          key: "lockAmount",
          slot: "lockAmount",
        },
        {
          title: this.$lang("投票数"),
          minWidth: 120,
          key: "voteAmount",
        },
        {
          title: this.$lang("总票数"),
          minWidth: 120,
          render: (h, p) => {
            // let total = new Decimal(Number(p.row.lockAmount)).plus(new Decimal(Number(p.row.voteAmount)))
            return h("span", Number(p.row.lockAmount) + Number(p.row.voteAmount));
          }
        },
        {
          title: this.$lang("操作"),
          minWidth: 120,
          fixed: "right",
          align: "center",
          slot: "action",
        }
      ]
    }
  },
  methods: {
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
      this.$axios
        .post("/api/v1/vote/node/query", this.searchForm)
        .then(result => {
          this.loading = false
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    edit(row) {
      this.currentRow = row
      Object.assign(this.formData, row)
      this.formData.lockUserId = row.userId
      this.formData.isAdmin = row.isAdmin
      this.formData.isLockModel = row.userId == 0 ? 'false' : 'true'
      this.localeDetail = initData(this.lang, JSON.stringify({introduction: ''}));
      this.localeDetail.forEach((item) => {
        row.introductions.forEach((ret) => {
          if(item.language === ret.language){
            item.introduction = ret.introduction
            item.enabled = true
          }
        })
      })
      this.chainWinType = 'edit';
      this.chainWin = true;
    },
    doHandle() {
      let ret = this.localeDetail.filter((item) => {
        return item.enabled
      })
      this.formData.introductions = ret
      if(this.formData.isLockModel == 'false') {
        this.formData.lockUserId = 0
        this.formData.lockAmount = 0
      }
      this.formData.isLockModel == 'true' ? this.formData.isLockModel = true : this.formData.isLockModel = false
      let data = {
        nodeName: this.formData.nodeName,
        nodeIcon: this.formData.nodeIcon,
        userName: this.formData.userName,
        mobile: this.formData.mobile,
        nodeType: this.formData.nodeType,
        isLockModel: this.formData.isLockModel,
        lockUserId: this.formData.lockUserId,
        lockAmount: this.formData.lockAmount,
        introductions: this.formData.introductions,
        slogan: this.formData.slogan,
      }
      this.loading = true;
      if(this.chainWinType === 'create') {
        this.$axios
          .post("/api/v1/vote/node/add", data)
          .then(result => {
            this.loading = false
            this.chainWin = false;
            if (result.code == 0) {
              this.loadData()
            }
          });
      } else if(this.chainWinType === 'edit'){
        data.nodeId = this.currentRow.nodeId
        this.$axios
          .post("/api/v1/vote/node/modify", data)
          .then(result => {
            this.loading = false
            this.chainWin = false;
            if (result.code == 0) {
              this.loadData()
            }
          });
      }

    },
    doSwitch() {
      this.loading = true;
      let data = {}
      Object.assign(data, {nodeId: this.currentRow.nodeId}, {status: this.currentRow.status});
      this.$axios
        .post("/api/v1/vote/node/status/modify", data)
        .then(result => {
          this.loading = false
          if (result.code == 0) {
            this.confirmWin = false;
            this.loadData()
          }
        });
    },
    create() {
      Object.assign(this.formData, {
        nodeName: '',
        userName: '',
        nodeType: 1,
        lockUserId: '',
        nodeIcon: '',
        mobile: '',
        lockAmount: '',
        isLockModel: 'false',
        introductions: [],
        slogan: '',
      })
      this.localeDetail = initData(this.lang, JSON.stringify({introduction: ''}));
      this.chainWinType = 'create';
      this.chainWin = true;
    },
    editConfig(row) {
      this.currentRow = row
      this.confirmWin = true;
      this.confirmForm.status = row.status;
    },
    cancel() {
      this.confirmWin = false;
      this.listData = [...this.listData];
    },
    changeIsLockModel() {
      if (this.formData.isLockModel == 'false') {
        this.formData.lockUserId = 0
        this.formData.lockAmount = 0
      }
    },
    submit() {
      Object.assign(this.unfreezeData, {nodeId: this.currentRow.nodeId}, {authType: this.userInfo.bindGA ? 1 : 2,})
      this.$axios
        .post("/api/v1/vote/node/unlock", this.unfreezeData)
        .then(result => {
          if (result.code == 0) {
            this.unfreezeWin = false;
            this.loadData();
            this.$Notice.success({
              title: this.$lang("成功"),
            });
          }
        });
    },
    unfreeze(row) {
      this.currentRow = row
      this.unfreezeWin = true;
    },
    beforeUpload() {
      this.uploading = true;
    },
    uploadSuccess(result) {
      this.uploading = false;
      if (result.code != 0) {
        return;
      }
      this.formData.nodeIcon = result.data.url
      this.$Notice.success({
        title: this.$lang("成功"),
      });
    },
  },
  created() {
    this.localeDetail = initData(this.lang, JSON.stringify({introduction: ''}));
    // this.localeDetail = data.filter((item) => {
    //   return item.language === 'en-us' || item.language === 'zh-cn'
    // })
    this.loadData();
  }
}
</script>

<style lang="less" scoped>
  .editor {
    height: 200px;
    margin-bottom: 42px;
  }
  .currentOrder {
    position: relative;
    z-index: 2;
    .cancel {
      position: absolute;
      right: 0;
      bottom: -62px;
    }
  }
</style>
