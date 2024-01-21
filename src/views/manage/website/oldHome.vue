<template lang="pug">
div
  Alert
    Checkbox(v-for="item in data.localConfigList", v-model="item.enable", :true-value="1", :false-value="0", :key="item.locale") {{lang[item.locale]}}
  Card( dis-hover v-for="(item,index) in data.localConfigList" v-show="item.enable" :key="'card'+index" style="margin-top:15px")
    p(slot="title") {{lang[item.locale]}}
    Form
      FormItem
        Input(v-model="item.featureTitle", :placeholder="$lang('平台优势')")
          span(slot="prepend") {{$lang('平台优势')}}
    Form
      Row(:gutter="20")
        Col(span="6" v-for="(_item,_index) in item.featureConfigList", :key="_index")
          Card
            p(slot="title") {{$lang("资源位")}} {{_index+1}}
            FormItem
              Input(v-model='_item.imageUrl', :placeholder="$lang('图片')")
                Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:'imageUrl_'+index+'_'+_index}")
                  Icon(type="md-cloud-upload")
                template(slot="prepend") {{$lang('图片')}}
              div {{$lang("建议图片尺寸")}} ：300×300px,{{$lang("透明背景")}}
            FormItem
              Input(v-model="_item.title", :placeholder="$lang('标题')")
                template(slot="prepend") {{$lang('标题')}}
            FormItem(:label="$lang('描述')")
              Input(v-model="_item.description", :placeholder="$lang('描述')" type="textarea" :rows="4")
  Spin( fix v-show="spinShow")
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="4")
        template(v-if="frontendCustomer") &nbsp;
        Button(type="success" long @click="indexSettings" v-else) {{$lang('预先配置新版本')}}
      Col(span="4")
        template(v-if="frontendCustomer") &nbsp;
        Button(type="error" long @click="win=true" v-else) {{$lang('使用新版本')}}
      Col(span="13") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" type="primary" long v-else) {{$lang('保存')}}
  Modal(v-model="win" :title="$lang('使用新版本')" width="400")
    Alert(type="error") {{$lang('升级新版WEB首页后不可退回老版本')}}
    Button(slot="footer" long type="error" @click="loadVersion" :loading="loading" :disabled="loading") {{$lang('确定')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      win: false,
      loading: false,
      spinShow: false,
      pageLoading: false,
      data: {
        localConfigList: []
      }
    };
  },
  computed: {
    ...mapState(["lang", "frontendCustomer","isRead"])
  },
  methods: {
    indexSettings() {
      let features = {};
      this.data.localConfigList.forEach(el => {
        if (el.enable) {
          features[el.locale] = {
            featureTitle: el.featureTitle,
            features: el.featureConfigList
          };
        }
      });
      sessionStorage.features = JSON.stringify(features);
      location.href = "/manage/website/newHome?status=0";
    },
    loadVersion() {
      this.$axios
        .post("/api/v1/broker/index_customer_config/switch", {
          newVersion: true
        })
        .then(result => {
          if (result.code == 0) {
            location.href = "/manage/website/newHome?status=0";
          }
        });
    },
    uploadSuccess(result) {
      this.spinShow = false;
      if (result.code != 0) {
        return;
      }
      this.$Notice.success({
        title: this.$lang("成功")
      });

      let arr = result.data.echoStr.split("_");
      this.data.localConfigList[arr[1]].featureConfigList[arr[2]][arr[0]] =
        result.data.url;
    },
    beforeUpload() {
      this.spinShow = true;
    },
    formatData(localConfigList) {
      localConfigList.forEach(el => {
        this.concatFirstLevelData(el);
        if (el.featureConfigList && el.featureConfigList.length) {
          el.featureConfigList.forEach(el => {
            this.concatData(el);
          });
        }
      });
    },
    concatFirstLevelData(data) {
      this.data.localConfigList.forEach(el => {
        if (el.locale == data.locale) {
          Object.keys(data).forEach(key => {
            if (key != "featureConfigList") {
              el[key] = data[key];
            }
          });
        }
      });
    },
    concatData(data) {
      this.data.localConfigList.forEach(el => {
        if (el.locale == data.locale) {
          el.featureConfigList.forEach(el => {
            if (el.index == data.index) {
              Object.assign(el, data);
            }
          });
        }
      });
    },
    load() {
      this.pageLoading = true;
      this.data.localConfigList = [];

      Object.keys(this.lang).forEach((locale, index) => {
        this.data.localConfigList.push({
          userAgreement: "",
          privacyAgreement: "",
          legalDescription: "",
          helpCenter: "",
          featureTitle: "",
          locale,
          enable: index === 0 ? 1 : 0,
          browserTitle: "",
          featureConfigList: [
            {
              imageUrl: "",
              title: "",
              description: "",
              locale,
              index: 0
            },
            {
              imageUrl: "",
              title: "",
              description: "",
              locale,
              index: 1
            },
            {
              imageUrl: "",
              title: "",
              description: "",
              locale,
              index: 2
            },
            {
              imageUrl: "",
              title: "",
              description: "",
              locale,
              index: 3
            }
          ]
        });
      });

      this.$axios.get("/api/v1/broker/config").then(result => {
        this.pageLoading = false;
        if (result.code == 0) {
          Object.keys(result.data).forEach(el => {
            if (el == "localConfigList") {
              if (result.data[el] && result.data[el].length) {
                this.formatData(result.data[el]);
              }
            } else {
              this.data[el] = result.data[el];
            }
          });
        }
      });
    },
    submit() {
      this.loading = true;

      this.$axios.post("/api/v1/broker/config/submit", this.data).then(() => {
        this.loading = false;
        this.$Notice.success({
          title: this.$lang("成功")
        });
        this.load();
      });
    }
  },
  created() {
    this.load();
  }
};
</script>