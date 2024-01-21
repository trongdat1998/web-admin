<style lang="less" scoped>
.view {
  width: 80%;
  margin: 0 auto;
}
.title,
.desc {
  font-weight: 700;
  background: #f8f8f8;
  min-height: 30px;
  line-height: 20px;
  padding: 5px 10px;
  margin-bottom: 10px;
}
.desc {
  font-weight: 400;
  min-height: 80px;
  color: #666;
  line-height: 24px;
  margin-top: 10px;
}
.img {
  display: flex;
  margin-bottom: 10px;
  div {
    border: 1px dashed #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  img,
  div {
    width: 50%;
  }
}
</style>
<template lang="pug">
div
  Alert
    Checkbox(v-for="item in formData.value", v-model="item.enabled", :key="item.language") {{lang[item.language]}}
  Card(:title="lang[item.language]" v-for="item,index in formData.value" :key="'c'+item.language"  dis-hover style="margin-top:15px" v-if="item.enabled")
    Row(:gutter="20")
      Col(span="16")
        Divider {{$lang("二级KYC选项")}}({{lang[item.language]}})
        Row(:gutter="20")
          Col(span="12")
            List
              ListItem
                strong {{$lang('身份证正面')}}({{lang[item.language]}})
              ListItem
                Input(v-model="item.level2.frontTitle" :placeholder="$lang('身份证正面标题')")
              ListItem
                Input(v-model="item.level2.frontBackground", :placeholder="$lang('小于50kb 320*320 png图片')" :disabled="uploading")
                  span(slot="prepend") {{$lang("APP")}}
                  Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.level2.' + 'frontBackground'}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                    Icon(type="md-cloud-upload" v-show="!uploading")
                    Icon.spin-icon-load(type="ios-loading" v-show="uploading")
              ListItem
                Input(v-model="item.level2.frontBackgroundWeb", :placeholder="$lang('小于50kb 248*152 png图片')" :disabled="uploading")
                  span(slot="prepend") {{$lang("WEB")}}
                  Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.level2.' + 'frontBackgroundWeb'}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                    Icon(type="md-cloud-upload" v-show="!uploading")
                    Icon.spin-icon-load(type="ios-loading" v-show="uploading")
              ListItem
                Input(v-model="item.level2.frontDescription" type="textarea" :rows="4" :placeholder="$lang('身份证正面说明文案')")

              ListItem
                strong {{$lang('手持身份证')}}({{lang[item.language]}})
              ListItem
                Input(v-model="item.level2.holdTitle" :placeholder="$lang('手持身份证标题')")
              ListItem
                Input(v-model="item.level2.holdBackground", :placeholder="$lang('小于50kb 320*320 png图片')" :disabled="uploading")
                  span(slot="prepend") {{$lang("APP")}}
                  Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.level2.' + 'holdBackground'}" :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                    Icon(type="md-cloud-upload" v-show="!uploading")
                    Icon.spin-icon-load(type="ios-loading" v-show="uploading")
              ListItem
                Input(v-model="item.level2.holdBackgroundWeb", :placeholder="$lang('小于50kb 248*152 png图片')" :disabled="uploading")
                  span(slot="prepend") {{$lang("WEB")}}
                  Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.level2.' + 'holdBackgroundWeb'}" :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                    Icon(type="md-cloud-upload" v-show="!uploading")
                    Icon.spin-icon-load(type="ios-loading" v-show="uploading")
              ListItem
                Input(v-model="item.level2.holdDescription" type="textarea" :rows="4" :placeholder="$lang('手持身份证说明文案')")
              ListItem
                strong {{$lang('补充说明文案')}}({{lang[item.language]}})
              ListItem
                Input(v-model="item.level2.extDescription" type="textarea" :rows="4" :placeholder="$lang('补充说明文案')")
          Col(span="12")
            .view
              List
                ListItem
                  strong {{$lang('预览')}}
              .title {{item.level2.frontTitle}} 
              .img
                div APP
                  Icon(size="40" type="md-add")
                img(:src="item.level2.frontBackground")
              .img
                div WEB
                  Icon(size="40" type="md-add")
                img(:src="item.level2.frontBackgroundWeb")
              .desc(v-html="formatText(item.level2.frontDescription)")
              .title {{item.level2.holdTitle}}
              .img
                div APP
                  Icon(size="40" type="md-add")
                img(:src="item.level2.holdBackground")
              .img
                div WEB
                  Icon(size="40" type="md-add")
                img(:src="item.level2.holdBackgroundWeb")
              .desc(v-html="formatText(item.level2.holdDescription)")
              Button(long type="primary") {{$lang("下一步")}}
              .desc(v-html="formatText(item.level2.extDescription)")
      Col(span="8")
        Divider {{$lang("三级KYC选项")}}({{lang[item.language]}})
        Input(v-model="item.level3Description" type="textarea" :rows="6" :placeholder="$lang('说明文案')")
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" type="primary" long v-else) {{$lang('保存')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      pageLoading: false,
      loading: false,
      uploading: false,
      formData: {
        group: "custom.config.group",
        key: "cust.kycSettings",
        value: []
      }
    };
  },
  computed: {
    ...mapState(["lang","isRead"])
  },
  methods: {
    formatText(text) {
      return text.replace(/\n/g, "<br>");
    },
    load() {
      this.pageLoading = true;
      this.$axios
        .post(
          "/api/v1/broker/config/common_config/get_aggerate_config",
          this.formData
        )
        .then(result => {
          this.pageLoading = false;
          if (result.code === 0) {
            Object.keys(this.lang).forEach((lang, index) => {
              let arr = result.data.value.filter(el => el.language === lang);
              let json = {
                enabled: index === 0,
                language: lang,
                level2: {
                  frontBackgroundWeb: "",
                  frontBackground: "",
                  frontTitle: "",
                  frontDescription: "",
                  holdBackground: "",
                  holdBackgroundWeb: "",
                  holdTitle: "",
                  holdDescription: "",
                  extDescription: ""
                },
                level3Description: ""
              };
              if (arr.length) {
                Object.assign(json, arr[0]);
              }
              this.formData.value.push(json);
            });
          }
        });
    },
    uploadSuccess(result) {
      this.uploading = false;
      let arr = result.data.echoStr.split(".");
      this.formData.value[arr[0]][arr[1]][arr[2]] = result.data.url;
      this.$Notice.success({
        title: this.$lang("成功")
      });
    },
    beforeUpload() {
      this.uploading = true;
    },
    exceededSize() {
      this.uploading = false;
      this.$Notice.error({
        title: this.$lang("图片过大，请压缩后重新上传")
      });
    },
    formatError() {
      this.uploading = false;
      this.$Notice.error({
        title: this.$lang("图片格式不正确，仅支持.png格式的图片")
      });
    },
    submit() {
      this.loading = true;
      this.$axios
        .post(
          "/api/v1/broker/config/common_config/edit_aggerate_config",
          this.formData
        )
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
    this.load();
  }
};
</script>