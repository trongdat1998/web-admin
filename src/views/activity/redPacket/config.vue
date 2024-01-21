<template lang="pug">
.page-exchange
  Form
    Alert
      Checkbox(
        v-for="item in formData[0].themeContent",
        v-model="item.enabled",
        :key="item.language"
      ) {{ lang[item.language] }}
    Row(:gutter="20")
      Col(
        v-for="(item, index) in formData[0].themeContent",
        v-if="item.enabled",
        :key="index",
        span="12"
      )
        Card(dis-hover, style="margin-top:15px", :title="lang[item.language]")
          FormItem
            Input(
              v-model="item.backgroundUrl",
              :disabled="uploading",
              :placeholder="$lang('首页背景图')"
            )
              span(slot="prepend") {{ $lang('首页背景图') }}
              Upload(
                :disabled="uploading",
                slot="append",
                action="/api/v1/storage/file/image",
                name="uploadFile",
                :on-success="uploadSuccess",
                :beforeUpload="beforeUpload",
                :data="{ echoStr: '0.' + index + '.backgroundUrl' }",
                :show-upload-list="false",
                :max-size="300",
                accept="image/png",
                :on-format-error="formatError",
                :on-exceeded-size="exceededSize"
              )
                Icon(type="md-cloud-upload", v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading", v-show="uploading")
            div {{ $lang('建议图片尺寸') }} :750*1298px , < 300KB

          FormItem
            Input(v-model="item.slogan", :placeholder="$lang('首页口号')")
              template(slot="prepend") {{ $lang('首页口号') }}

          FormItem
            Input(
              v-model="item.backgroundColor",
              :placeholder="$lang('首页背景色')"
            )
              template(slot="prepend") {{ $lang('首页背景色') }}
              Select(
                slot="append",
                v-model="item.backgroundColor",
                style="width:120px"
              )
                Option(value="#B53036")
                  Icon(type="md-bookmark", color="#B53036") 
                  | #B53036
          FormItem
            Input(
              v-model="formData[2].themeContent[index].backgroundUrl",
              :disabled="uploading"
            )
              span(slot="prepend") {{ $lang('新手分享图') }}
              Upload(
                :disabled="uploading",
                slot="append",
                action="/api/v1/storage/file/image",
                name="uploadFile",
                :on-success="uploadSuccess",
                :beforeUpload="beforeUpload",
                :data="{ echoStr: '2.' + index + '.backgroundUrl' }",
                :show-upload-list="false",
                :max-size="300",
                accept="image/png",
                :on-format-error="formatError",
                :on-exceeded-size="exceededSize"
              )
                Icon(type="md-cloud-upload", v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading", v-show="uploading")
            div {{ $lang('建议图片尺寸') }} :670*1014px , < 300KB

          FormItem
            Input(
              v-model="formData[1].themeContent[index].backgroundUrl",
              :disabled="uploading"
            )
              span(slot="prepend") {{ $lang('口令分享图') }}
              Upload(
                :disabled="uploading",
                slot="append",
                action="/api/v1/storage/file/image",
                name="uploadFile",
                :on-success="uploadSuccess",
                :beforeUpload="beforeUpload",
                :data="{ echoStr: '1.' + index + '.backgroundUrl' }",
                :show-upload-list="false",
                :max-size="300",
                accept="image/png",
                :on-format-error="formatError",
                :on-exceeded-size="exceededSize"
              )
                Icon(type="md-cloud-upload", v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading", v-show="uploading")
            div {{ $lang('建议图片尺寸') }} :670*1014px , < 300KB
          Row(:gutter="20", style="textAlign:center;height:162px")
            Col(span="8")
              Divider {{ $lang('首页背景图') }}
              img(
                style="maxHeight:100px;maxWidth:100%",
                :src="item.backgroundUrl"
              )
            Col(span="8")
              Divider {{ $lang('新手分享图') }}
              img(
                style="maxHeight:100px;maxWidth:100%",
                :src="formData[2].themeContent[index].backgroundUrl"
              )
            Col(span="8")
              Divider {{ $lang('口令分享图') }}
              img(
                style="maxHeight:100px;maxWidth:100%",
                :src="formData[1].themeContent[index].backgroundUrl"
              )

  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading", loading, long) {{ $lang('加载中') }}
        Button(
          @click="submit",
          :loading="loading",
          type="primary",
          long,
          v-else
        ) {{ $lang('保存') }}
</template>
<script>
import { mapState } from "vuex";
import { initData } from "@/libs/common.js";
export default {
  computed: {
    ...mapState(["lang", "isRead"]),
  },
  data() {
    return {
      pageLoading: false,
      uploading: false,

      formData: [
        // 基础设置，封面
        {
          id: "",
          type: 1,
          themeContent: [],
        },
        // 口令红包设置
        {
          id: "",
          type: 2,
          themeContent: [],
        },
        // 新手红包设置
        {
          id: "",
          type: 3,
          themeContent: [],
        },
      ],

      loading: false,
      listData: [],
    };
  },
  methods: {
    uploadSuccess(result) {
      this.uploading = false;
      let arr = result.data.echoStr.split(".");
      this.formData[arr[0]].themeContent[arr[1]][arr[2]] = result.data.url;
      this.$Notice.success({
        title: this.$lang("成功"),
      });
    },
    beforeUpload() {
      this.uploading = true;
    },
    exceededSize() {
      this.uploading = false;
      this.$Notice.error({
        title: this.$lang("图片过大，请压缩后重新上传"),
      });
    },
    formatError() {
      this.uploading = false;
      this.$Notice.error({
        title: this.$lang("图片格式不正确，仅支持.png格式的图片"),
      });
    },
    loadData() {
      this.pageLoading = true;
      this.$axios.post("/api/v1/red_packet/themes").then((result) => {
        this.pageLoading = false;
        if (result.code === 0) {
          [0, 1, 2].forEach((index) => {
            this.formData[index].id = result.data[index + 1][0].id;
            this.formData[index].themeContent.forEach((el) => {
              result.data[index + 1][0].themeContent.forEach((_el) => {
                if (_el.language === el.language) {
                  _el.enabled = true;
                  Object.assign(el, _el);
                }
              });
            });
          });
        }
      });
    },
    submit() {
      this.pageLoading = true;

      let formData = [
        {
          id: this.formData[0].id,
          type: this.formData[0].type,
          themeContent: [],
        },
        {
          id: this.formData[1].id,
          type: this.formData[1].type,
          themeContent: [],
        },
        {
          id: this.formData[2].id,
          type: this.formData[2].type,
          themeContent: [],
        },
      ];

      this.formData[0].themeContent.forEach((el, index) => {
        if (el.enabled) {
          formData[0].themeContent.push(this.formData[0].themeContent[index]);
          formData[1].themeContent.push(this.formData[1].themeContent[index]);
          formData[2].themeContent.push(this.formData[2].themeContent[index]);
        }
      });

      this.$axios.post("/api/v1/red_packet/theme", formData).then((result) => {
        this.pageLoading = false;
        if (result.code === 0) {
          this.$Notice.success({
            title: this.$lang("成功"),
          });
          setTimeout(() => {
            location.reload();
          }, 3000);
        }
      });
    },
  },
  created() {
    [0, 1, 2].forEach((index) => {
      this.formData[index].themeContent = initData(
        this.lang,
        JSON.stringify({
          backgroundUrl: "",
          slogan: "",
          backgroundColor: "",
        })
      );
    });

    this.loadData();
  },
};
</script>