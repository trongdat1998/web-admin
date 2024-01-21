<style lang="less" scoped>

.background {
  padding: 10px;
  background: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    max-width: 100%;
  }
}
.thumb{
  box-shadow: 0px 1px 3px 0px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12);
  background: #ccc;
  margin:0 auto;
  max-width: 120px;
  height: 240px;
  overflow: hidden;
  position: relative;
  img{
    width: 100%;
  }

  .button{
    position: absolute;
    bottom:0;
    left:0;
    display: flex;
    height: 22px;
    padding:3px 0;
    background: #fff;
    right:0;
    span{
      flex:1;
      height: 16px;
      background:#3375E0;
      margin: 0 3px;
      font-size: 12px;
      text-align: center;
      color:#fff;
      line-height: 16px;
      &.store{
        background: #FFC000
      }
    }
  }
}
</style>
<template lang="pug">
div
  Form(:label-width="160")
    Card(dis-hover style="padding-bottom:50px")
      p(slot="title") {{$lang('下载包管理')}}
      Row(:gutter="20")
        Col(span="12")
          FormItem(:label="$lang('Android本地下载包')")
            Input(:placeholder="$lang('Android本地下载包')" v-model="backpack.androidDownloadUrl" )
              Upload(:disabled="uploading" slot="suffix" action="/api/v1/broker/config/app_package/upload", name="uploadFile", :on-success="uploadAndroidSuccess", :beforeUpload="beforeUpload", :data="{echoStr:'backpack.androidDownloadUrl'}", :show-upload-list="false" :on-progress="progress" @click.native="changeProgress('android')" accept=".apk")
                Icon(type="md-cloud-upload" v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading" v-show="uploading")
            Progress(:percent="progressNum" status="active" v-show="uploading&&(upType=='android')")
          FormItem(:label="$lang('当前Android版本号')")
            Input(v-model="backpack.androidAppVersion", :placeholder="$lang('当前Android版本号')" readonly)
          FormItem(:label="$lang('GooglePlay下载链接')")
            Input(v-model="backpack.googlePlayDownloadUrl", :placeholder="$lang('GooglePlay下载包')" )
        Col(span="12")
          FormItem(:label="$lang('Ios本地下载包')")
            Input(:placeholder="$lang('Ios本地下载包')" v-model="backpack.iosDownloadUrl" )
              Upload(:disabled="uploading" slot="suffix" action="/api/v1/broker/config/app_package/upload", name="uploadFile", :on-success="uploadIosSuccess", :beforeUpload="beforeUpload", :data="{echoStr:'backpack.iosDownloadUrl'}", :show-upload-list="false" :on-progress="progress" @click.native="changeProgress('ios')" accept=".ipa")
                Icon(type="md-cloud-upload" v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading" v-show="uploading")
            Progress(:percent="progressNum" status="active" v-show="uploading&&(upType=='ios')")
          FormItem(:label="$lang('当前Ios版本号')")
            Input(v-model="backpack.iosAppVersion", :placeholder="$lang('当前Ios版本号')" readonly)
          FormItem(:label="$lang('AppStore下载链接')")
            Input(v-model="backpack.appStoreDownloadUrl", :placeholder="$lang('AppStore下载链接')" )
          FormItem(:label="$lang('Testflight下载链接')")
            Input(v-model="backpack.testflightDownloadUrl", :placeholder="$lang('Testflight下载链接')" )
    Card(dis-hover style="margin-top:15px")
      p(slot="title") {{$lang('下载页管理')}}
      FormItem(:label="$lang('类型')")
        RadioGroup( v-model="backpack.type" @on-change="changeType")
          Radio(:label="1") {{$lang('系统')}}
          Radio(:label="2") {{$lang('自定义')}}
      Alert
        Checkbox(v-for="item in localeInfo", v-model="item.enable", :key="item.locale") {{lang[item.language]}}
      template(v-for="item,index in localeInfo" v-if="item.enable")
        Divider {{lang[item.language]}}
        Row(:gutter="20")
          Col(:span="backpack.type==1 ? 16 : 24")
            template(v-if="backpack.type==1")
              FormItem(:label="$lang('Android下载页图片')")
                Input(v-model="item.androidGuideImageUrl", :placeholder="$lang('Android下载页图片')" )
                  Upload(:disabled="uploading" slot="suffix" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:'localeInfo.'+index+'.androidGuideImageUrl'}", :show-upload-list="false" :max-size="500" accept="image/png, image/jpg" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                    Icon(type="md-cloud-upload" v-show="!uploading")
                    Icon.spin-icon-load(type="ios-loading" v-show="uploading")
                div 仅支持.png、.jpg格式的图片，图片小于500K。建议图片宽320-640px，高 >700px。
              FormItem(:label="$lang('Ios下载页图片')")
                Input(v-model="item.iosGuideImageUrl", :placeholder="$lang('Ios下载页图片')" )
                  Upload(:disabled="uploading" slot="suffix" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:'localeInfo.'+index+'.iosGuideImageUrl'}", :show-upload-list="false" :max-size="500" accept="image/png, image/jpg" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                    Icon(type="md-cloud-upload" v-show="!uploading")
                    Icon.spin-icon-load(type="ios-loading" v-show="uploading")
                div 仅支持.png、.jpg格式的图片，图片小于500K。建议图片宽320-640px，高 >700px。
            FormItem(:label="$lang('APP下载页')")
              .ivu-input-wrapper.ivu-input-wrapper-default.ivu-input-type
                input.ivu-input.ivu-input-default.ivu-input-with-suffix(:id="'reg'+index" v-model="item.downloadWebUrl" :readonly="backpack.type==1")
                span.ivu-input-suffix
                  Icon.copy(type="ios-copy" :data-clipboard-target="'#reg' + index")
          template(v-if="backpack.type==1")
            Col(span="4")
              .thumb
                img(:src="item.androidGuideImageUrl")
                .button
                  span.locale(v-if="backpack.androidDownloadUrl") Android
                  span.store(v-if="backpack.googlePlayDownloadUrl") Android
            Col(span="4")
              .thumb
                img(:src="item.iosGuideImageUrl")
                .button
                  span.locale(v-if="backpack.iosDownloadUrl") ios
                  span.store(v-if="backpack.appStoreDownloadUrl") ios
                  span.store(v-if="backpack.testflightDownloadUrl") ios
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" type="primary" long v-else) {{$lang('保存')}}
  
</template>
<script>
import { mapState } from "vuex";
import ClipboardJS from "clipboard";
export default {
  computed: {
    ...mapState(["lang", "apiDomain","isRead"])
  },
  data() {
    return {
      pageLoading:false,
      progressNum :0,
      upType:"",
      uploading: false,
      loading: false,
      localeInfo: [],
      appPackageData: [],
      backpack: {
        type: 1,
        androidDownloadUrl: "",
        googlePlayDownloadUrl: "",
        iosDownloadUrl: "",
        appStoreDownloadUrl: "",
        androidAppId: "",
        iosAppId: "",
        androidAppVersion: "",
        iosAppVersion: "",
        testflightDownloadUrl:""
      }
    };
  },
  methods: {
    changeProgress(type){
      if(!this.upType){
        this.upType = type
      }
    },
    progress(file){
      this.progressNum = parseInt(file.percent)
    },
    exceededSize(){
      this.uploading = false;
      this.$Notice.error({
        title: this.$lang("图片过大，请压缩后重新上传")
      });
    },
    formatError(){
      this.uploading = false;
      this.$Notice.error({
        title: this.$lang("图片格式不正确，仅支持.png、.jpg格式的图片")
      });
    },
    submit() {
      this.backpack.localeInfo = this.localeInfo.filter(el => {
        if (el.enable) {
          return el;
        }
      });
      // let json = {
      //   localeInfo: this.localeInfo.filter(el => {
      //     if (el.enable) {
      //       return el;
      //     }
      //   })
      // };
      this.$axios
        .post("/api/v1/broker/config/app_package/save", this.backpack)
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            location.reload();
          }
        });
    },
    changeType() {
      let apiDomain = /^\./.test(this.apiDomain)
        ? this.apiDomain
        : `.${this.apiDomain}`;

      if (this.backpack.type == 1){
        this.localeInfo.forEach(el => {
          el.downloadWebUrl = `https://www${apiDomain}/m/other/download`;
        });
      } else {
        this.localeInfo.forEach((el, index) => {
          if(this.appPackageData.length > index){
            el.downloadWebUrl = this.appPackageData[index];
          } else {
            el.downloadWebUrl = '';
          }
        });
      }
    },
    uploadAndroidSuccess(result) {
      this.uploadSuccess(result);
      this.backpack.androidAppId = result.data.appId;
      this.backpack.androidAppVersion = result.data.appVersion;
    },
    uploadIosSuccess(result) {
      this.uploadSuccess(result);
      this.backpack.iosAppId = result.data.appId;
      this.backpack.iosAppVersion = result.data.appVersion;
    },
    uploadSuccess(result) {
      this.upType = "";
      this.uploading = false;
      if (result.code != 0) {
        return;
      }
      let tmp = result.data.echoStr.split(".");
      if (tmp.length == 2) {
        this[tmp[0]][tmp[1]] = result.data.url;
      }
      if (tmp.length == 3) {
        this[tmp[0]][tmp[1]][tmp[2]] = result.data.url;
      }
      this.$Notice.success({
        title: this.$lang("成功")
      });
    },
    beforeUpload() {
      this.uploading = true;
    }
  },
  created() {
    this.pageLoading = true;
    this.$axios.get("/api/v1/broker/config/app_package/query").then(result => {
      this.pageLoading = false;
      if (result.code == 0) {
        if(result.data && result.data.localeInfo.length){
          result.data.localeInfo.forEach((item) => {
            this.appPackageData.push(item.downloadWebUrl);
          });
        }
        Object.assign(this.backpack, result.data||{});
        let apiDomain = /^\./.test(this.apiDomain)
        ? this.apiDomain
        : `.${this.apiDomain}`;
        Object.keys(this.lang).forEach((lang, index) => {
          let tmp = (result.data.localeInfo||[]).filter(el => lang == el.language);
          if (tmp.length) {
            tmp[0].enable = true;
            this.localeInfo.push(tmp[0]);
          } else {
            this.localeInfo.push({
              androidGuideImageUrl: "",
              iosGuideImageUrl: "",
              downloadWebUrl: this.backpack.type == 1 ?`https://www${apiDomain}/m/other/download` : "",
              language: lang,
              enable: index == 0
            });
          }
        });
      }
    });
  },
  mounted() {
    let clipboard = new ClipboardJS(".copy");
    clipboard.on("success", () => {
      this.$Message.success(this.$lang("已复制"));
    });
  }
};
</script>