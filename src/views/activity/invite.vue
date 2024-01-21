<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      h4 {{$lang('邀请返佣')}} : 
      iSwitch(:disabled="isRead" size="large" v-model="showStatus", :true-value="1", :false-value="0" @on-change="change")
        span(slot="open") {{$lang('开')}}
        span(slot="close") {{$lang('关')}}
    Col(span="4")
      h4 {{$lang('币币返佣')}} : 
      iSwitch(size="large" :disabled="!showStatus||isRead" v-model="coinStatus", :true-value="1", :false-value="2" @on-change="change")
        span(slot="open") {{$lang('开')}}
        span(slot="close") {{$lang('关')}}
    Col(span="4")
      h4 {{$lang('合约返佣')}} : 
      iSwitch(size="large" :disabled="!showStatus||isRead" v-model="futuresStatus", :true-value="1", :false-value="2" @on-change="change")
        span(slot="open") {{$lang('开')}}
        span(slot="close") {{$lang('关')}}
    Col(span="4")
      h4 {{$lang('返佣有效期')}} : 
      iSwitch(size="large" :disabled="!showStatus||isRead" v-model="formData.fixed", :true-value="true", :false-value="false")
    Col(span="4")
      Input(v-model='formData.fixedTimeInMonth', :value="formData.fixedTimeInMonth" v-if="formData.fixed") 
        span(slot="append") {{$lang('月')}}
      template(v-else) {{$lang("永久有效")}}
    Col(span="4")
      Button(type="primary" @click="updatePeriod" icon="md-save" long :disabled="isRead") {{$lang('保存')}}
  Alert(type="error" style="margin-top:15px") {{$lang("返佣等级如果不全部设置，请从Lv6开始配置")}}
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
  Modal.page-exchange-win(v-model="settings", :title="$lang('修改')" @on-ok="doSet")
    Form(:model='formData', :labelWidth="150")
      FormItem(:label="$lang('等级')")
          Input(:value='$lang(level[formData.level-1])', disabled)
      FormItem(:label="$lang('邀请用户数')")
          Input(v-model='formData.levelCondition', :placeholder="$lang('邀请用户数')")
      FormItem(:label="$lang('直接邀请返佣比例')")
          Input(v-model='formData.directRate', :placeholder="$lang('直接邀请返佣比例')" :maxlength="6")
            span(slot="suffix" style="line-height:32px;") %
      FormItem(:label="$lang('间接邀请返佣比例')")
          Input(v-model='formData.indirectRate', :placeholder="$lang('间接邀请返佣比例')" :maxlength="6")
            span(slot="suffix" style="line-height:32px;") %

  Divider {{$lang("返佣页面配置")}}
  Alert
    Checkbox(v-for="item in configList", v-model="item.enable", :true-value="true", :false-value="false", :key="item.locale") {{lang[item.locale]}}
  Row(:gutter="20")
    Col(v-for="(item,index) in configList" v-show="item.enable" :key="index" span="12" style="margin-bottom:20px")
      Card( dis-hover)
        p(slot="title") {{lang[item.locale]}}
        Form(:label-width="120")
          FormItem(:label="$lang('顶部图片-网站')")
            Input(v-model="item.settings.invite_title_pic_pc", :placeholder="$lang('顶部图片-网站')")
              Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:'invite_title_pic_pc&'+index}")
                Icon(type="md-cloud-upload")
            div {{$lang("建议图片尺寸")}} ：1920×400px
          FormItem(:label="$lang('顶部图片-移动端')")
            Input(v-model="item.settings.invite_title_pic_app", :placeholder="$lang('顶部图片-移动端')")
              Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:'invite_title_pic_app&'+index}")
                Icon(type="md-cloud-upload")
            div {{$lang("建议图片尺寸")}} ：1107×412px
          FormItem(:label="$lang('活动规则')")
            Input(v-model="item.settings.invite_activity_rule_url", :placeholder="$lang('活动规则')")
          FormItem(:label="`${$lang('分享海报')}-${_index+1}`"  v-for="_item,_index in item.settings.invite_poster_template" :key="'a'+index +_index")
            Input(v-model="item.settings.invite_poster_template[_index]", :placeholder="$lang('分享海报')")
              Upload(slot="suffix" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:'invite_poster_template&'+index + '&'+_index}")
                Icon(type="md-cloud-upload")
            div {{$lang("建议图片尺寸")}} ：414×736px , < 300KB
          FormItem(:label="$lang('分享logo')")
            Input(v-model="item.settings.invite_broker_logo_url", :placeholder="$lang('分享logo')")
              Upload(slot="suffix" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:'invite_broker_logo_url&'+index}")
                Icon(type="md-cloud-upload")
            div {{$lang("建议图片尺寸")}} ：160×160px
          FormItem(:label="$lang('下载描述')")
            Input(v-model="item.settings.app_download_page_text", :placeholder="$lang('下载描述')")
          FormItem(:label="$lang('分享Title')")
            Input(v-model="item.settings.invite_share_wx_title", :placeholder="$lang('分享Title')")
          FormItem(:label="$lang('分享描述')")
            Input(v-model="item.settings.invite_share_wx_content", :placeholder="$lang('分享描述')")
        //- Form(:label-width="120")
        //-   FormItem(label="Android")
        //-     Input(v-model="item.settings.bhop_download_android_url", placeholder="Android")
        //- Form(:label-width="120")
        //-   FormItem(label="IOS")
        //-     Input(v-model="item.settings.bhop_download_ios_url", placeholder="IOS")
  Spin( fix v-show="spinShow")
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="loadingTable" loading long)  {{$lang('加载中')}}
        Button(@click="editInviteCommonSetting", type="primary" long v-else) {{$lang('保存')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["lang","isRead"])
  },
  data() {
    return {
      configList: [],
      spinShow: false,
      showStatus: 0,
      futuresStatus: 2,
      coinStatus: 2,
      loadingTable: true,
      settings: false,
      level: ["Lv1", "Lv2", "Lv3", "Lv4", "Lv5", "Lv6"],
      listData: [],
      formData: {
        actId: "",
        levelId: "",
        level: "",
        levelCondition: "",
        directRate: "",
        indirectRate: "",
        fixed: false,
        fixedTimeInMonth: 1
      },
      columns: [
        {
          title: this.$lang("等级"),
          minWidth: 160,
          render: (h, p) => h("span", this.level[p.row.level - 1])
        },
        {
          title: this.$lang("邀请用户数"),
          minWidth: 160,
          key: "levelCondition",
          render: (h, p) => h("span", p.row.levelCondition)
        },
        {
          title: this.$lang("直接邀请返佣比例"),
          minWidth: 160,
          key: "directRate",
          render: (h, p) => h("span", p.row.directRate + "%")
        },
        {
          title: this.$lang("间接邀请返佣比例"),
          minWidth: 160,
          key: "indirectRate",
          render: (h, p) => h("span", p.row.indirectRate + "%")
        },
        {
          title: this.$lang("操作"),
          width: 120,
          fixed: "right",
          align: "center",
          render: (h, params) => {
            return h(
              "Button",
              {
                attrs:{
                  disabled:this.isRead,
                  size:"small"
                },
                on: {
                  click: () => {
                    this.settings = true;
                    Object.assign(this.formData, params.row);
                  }
                }
              },
              this.$lang("修改")
            );
          }
        }
      ]
    };
  },
  methods: {
    change() {
      this.$axios
        .post("/api/v1/invite_fee_back/enable_activity", {
          actId: this.formData.actId,
          status: this.showStatus,
          futuresStatus: this.futuresStatus,
          coinStatus: this.coinStatus
        })
        .then(() => this.loadData());
    },
    loadData() {
      this.loadingTable = true;
      this.$axios.post("/api/v1/invite_fee_back/levels").then(result => {
        this.loadingTable = false;
        if (result.code === 0) {
          this.listData = result.data.list;
          this.showStatus = result.data.showStatus;
          this.futuresStatus = result.data.futuresStatus;
          this.coinStatus = result.data.coinStatus;
          this.formData.actId = result.data.actId;
          this.formData.fixed = result.data.fixed;
          this.formData.fixedTimeInMonth = result.data.fixedTimeInMonth;
          result.data.configList.forEach(el => {
            let temp = [];
            [0, 1, 2].forEach(_el =>
              temp.push(
                el.settings.invite_poster_template && el.settings.invite_poster_template[_el]
                  ? el.settings.invite_poster_template[_el]
                  : ""
              )
            );
            el.settings.invite_poster_template = temp;
            this.configList.forEach(_el => {
              if (_el.locale === el.locale) {
                Object.assign(_el, el);
              }
            });
          });
        }
      });
    },
    doSet() {
      let data = Object.assign({}, this.formData);
      this.$axios
        .post("/api/v1/invite_fee_back/edit", data)
        .then(() => this.loadData());
    },
    updatePeriod() {
      let data = Object.assign({}, this.formData);
      this.$axios
        .post("/api/v1/invite_fee_back/update_period", data)
        .then(() => this.loadData());
    },
    uploadSuccess(result) {
      this.spinShow = false;
      if (result.code != 0) {
        return;
      }
      this.$Notice.success({
        title: this.$lang("成功")
      });

      let arr = result.data.echoStr.split("&");
      if(arr.length==2){
         this.configList[arr[1]].settings[arr[0]] = result.data.url;
      }else{
        this.configList[arr[1]].settings[arr[0]][arr[2]] = result.data.url;
      }
     
    },
    beforeUpload() {
      this.spinShow = true;
    },
    editInviteCommonSetting() {
      this.$axios
        .post("/api/v1/invite_fee_back/edit_invite_common_setting", {
          list: this.configList
        })
        .then(result => {
          this.loading = false;
          if (result.code === 0) {
            this.$Notice.success({
              title: this.$lang("成功")
            });
          }
        });
    }
  },
  created() {
    Object.keys(this.lang).forEach(el => {
      this.configList.push({
        locale: el,
        enable: false,
        settings: {
          invite_activity_rule_url: "",
          invite_poster_template: ["", "", ""],
          invite_broker_logo_url: "",
          invite_title_pic_app: "",
          app_download_page_text: "",
          invite_title_pic_pc: "",
          bhop_download_android_url: "",
          bhop_download_ios_url: ""
        }
      });
    });
    this.loadData();
  }
};
</script>