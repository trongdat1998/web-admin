<style lang="less" scoped></style>
<template lang="pug">
div
  Form
    Card(dis-hover style="margin-top:15px")
      p(slot="title") {{$lang('背景图文配置')}}
      Alert
        Checkbox(v-for="item in formData.value", v-model="item.enabled", :key="item.language") {{lang[item.language]}}
      Row(:gutter="20")
        Col(v-for="item,index in formData.value" v-if="item.enabled" ,:key="index" span="12")
          Divider {{lang[item.language]}}
          FormItem
            Input(v-model="item.title", :placeholder="$lang('标题文案')" )
              template(slot="prepend") {{$lang('标题文案')}}
          FormItem
            Input(v-model="item.webBackground", :disabled="uploading")
              span(slot="prepend") {{$lang("PC背景图片")}}
              Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.webBackground'}", :show-upload-list="false" ,:max-size="300" accept="image/png" ,:on-format-error="formatError" ,:on-exceeded-size="exceededSize")
                Icon(type="md-cloud-upload" v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading" v-show="uploading")
            div {{$lang("建议图片尺寸")}} ：1152 × 200px , < 300KB
          FormItem
            Input(v-model="item.h5Background", :disabled="uploading")
              span(slot="prepend") {{$lang("H5背景图片")}}
              Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.h5Background'}", :show-upload-list="false" ,:max-size="100" accept="image/png" ,:on-format-error="formatError" ,:on-exceeded-size="exceededSize")
                Icon(type="md-cloud-upload" v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading" v-show="uploading")
            div {{$lang("建议图片尺寸")}} ：375 × 160px , < 100KB
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" type="primary" long v-else) {{$lang('保存')}}
</template>
<script>
import { mapState } from 'vuex'
import CONSTS from '@/libs/consts'

const { staticUrl } = CONSTS
export default {
  computed: {
    ...mapState(['lang', 'isRead']),
  },
  data() {
    return {
      pageLoading: false,
      uploading: false,
      formData: {
        group: 'custom.config.group',
        key: 'cust.ieoSettings',
        value: [],
      },
      loading: false,
      listData: [],
    }
  },
  methods: {
    uploadSuccess(result) {
      this.uploading = false
      let arr = result.data.echoStr.split('.')
      this.formData.value[arr[0]][arr[1]] = result.data.url
      this.$Notice.success({
        title: this.$lang('成功'),
      })
    },
    beforeUpload() {
      this.uploading = true
    },
    exceededSize() {
      this.uploading = false
      this.$Notice.error({
        title: this.$lang('图片过大，请压缩后重新上传'),
      })
    },
    formatError() {
      this.uploading = false
      this.$Notice.error({
        title: this.$lang('图片格式不正确，仅支持.png格式的图片'),
      })
    },
    loadData() {
      this.$axios
        .post(
          '/api/v1/broker/config/common_config/get_aggerate_config',
          this.formData
        )
        .then((result) => {
          this.pageLoading = false
          if (result.code === 0) {
            Object.keys(this.lang).forEach((lang, index) => {
              let arr = result.data.value.filter((el) => el.language === lang)
              let json = {
                enabled: index === 0,
                language: lang,
                title:
                  lang === 'zh-cn'
                    ? '区块链资产发行平台'
                    : 'Blockchain Asset Issuance Platform',
                webBackground: `https://${staticUrl}/static/media/ieo_bg.178ae042.png`,
                h5Background: `https://${staticUrl}/activity/xo/static/media/banner.3965800e.png`,
              }
              if (arr.length && !arr[0].level2) {
                Object.assign(json, arr[0])
              }
              this.formData.value.push(json)
            })
          }
        })
    },
    submit() {
      this.pageLoading = true
      this.$axios
        .post(
          '/api/v1/broker/config/common_config/edit_aggerate_config',
          this.formData
        )
        .then((result) => {
          this.pageLoading = false
          if (result.code === 0) {
            this.$Notice.success({
              title: this.$lang('成功'),
            })
          }
        })
    },
  },
  created() {
    this.loadData()
  },
}
</script>
