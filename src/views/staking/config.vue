<template lang="pug">
Main.page-exchange
  Form
    Card(dis-hover, style="margin-top:15px")
      p(slot="title") {{ $lang('背景图文配置') }}
      Alert
        Checkbox(
          v-for="item in formData.value",
          v-model="item.enabled",
          :key="item.language"
        ) {{ lang[item.language] }}
      Row(:gutter="20")
        Col(
          v-for="(item, index) in formData.value",
          v-if="item.enabled",
          :key="index",
          span="12"
        )
          Divider {{ lang[item.language] }}
          FormItem
            Input(v-model="item.webTitle", :placeholder="$lang('WEB标题文案')")
              template(slot="prepend") {{ $lang('WEB标题文案') }}
          FormItem
            Input(
              v-model="item.webDescription",
              :placeholder="$lang('WEB描述文案')"
            )
              template(slot="prepend") {{ $lang('WEB描述文案') }}
          FormItem
            Input(
              v-model="item.webBackgroundColor",
              :placeholder="$lang('WEB背景色')"
            )
              template(slot="prepend") {{ $lang('WEB背景色') }}

          FormItem
            Input(v-model="item.webBackground", :disabled="uploading")
              span(slot="prepend") {{ $lang('WEB背景图片') }}
              Upload(
                :disabled="uploading",
                slot="append",
                action="/api/v1/storage/file/image",
                name="uploadFile",
                :on-success="uploadSuccess",
                :beforeUpload="beforeUpload",
                :data="{ echoStr: index + '.webBackground' }",
                :show-upload-list="false",
                :max-size="300",
                accept="image/png",
                :on-format-error="formatError",
                :on-exceeded-size="exceededSize"
              )
                Icon(type="md-cloud-upload", v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading", v-show="uploading")
            div {{ $lang('建议图片尺寸') }} ：1152 × 200px , < 300KB

          FormItem
            Input(v-model="item.appTitle", :placeholder="$lang('APP标题文案')")
              template(slot="prepend") {{ $lang('APP标题文案') }}
          FormItem
            Input(v-model="item.appBackground", :disabled="uploading")
              span(slot="prepend") {{ $lang('APP背景图片') }}
              Upload(
                :disabled="uploading",
                slot="append",
                action="/api/v1/storage/file/image",
                name="uploadFile",
                :on-success="uploadSuccess",
                :beforeUpload="beforeUpload",
                :data="{ echoStr: index + '.appBackground' }",
                :show-upload-list="false",
                :max-size="100",
                accept="image/png",
                :on-format-error="formatError",
                :on-exceeded-size="exceededSize"
              )
                Icon(type="md-cloud-upload", v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading", v-show="uploading")
            div {{ $lang('建议图片尺寸') }} ：750 × 440px , < 100KB
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
import { mapState } from 'vuex'
import { initData } from '@/libs/common.js'
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
        key: 'cust.stakingSettings',
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
            this.formData.value.forEach((el) => {
              Object.assign(el, {
                webTitle: el.language === 'zh-cn' ? '财富' : 'Financial',
                webDescription: el.language === 'zh-cn' ? '财富' : 'Financial',
                appTitle: el.language === 'zh-cn' ? '财富' : 'Financial',
              })

              if (result.data.value) {
                result.data.value.forEach((_el) => {
                  if (_el.language === el.language) {
                    Object.assign(el, _el)
                  }
                })
              }
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
    this.formData.value = initData(
      this.lang,
      JSON.stringify({
        webTitle: '',
        webDescription: '',
        webBackground: `https://${staticUrl}/static/media/ieo_bg.178ae042.png`,
        webBackgroundColor: '#1b1e2b',
        appTitle: '',
        appBackground: `https://${staticUrl}/activity/xo/static/media/banner.3965800e.png`,
      })
    )

    this.loadData()
  },
}
</script>
