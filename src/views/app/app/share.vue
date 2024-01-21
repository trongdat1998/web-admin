<style lang="less" scoped>
.background {
  padding: 10px;
  background: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  img {
    max-width: 100%;
    max-height: 120px;
  }
}
</style>
<template lang="pug">
div
  Form
    Card(dis-hover)
      p(slot="title") {{$lang('标识管理')}}
      Row(:gutter="20")
        Col(span="12")
          FormItem
            Input(v-model='watermarkImageUrl', :placeholder="$lang('建议使用PNG透明图标  245*48')" )
              template(slot="prepend") {{$lang('水印管理')}}
              Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:'watermarkImageUrl'}", :show-upload-list="false")
                Icon(type="md-cloud-upload" v-show="!loading")
                Icon.spin-icon-load(type="ios-loading" v-show="loading")
            div {{$lang('建议使用PNG透明图标  245*48')}}
            div.background(v-if="watermarkImageUrl")
              img(:src="watermarkImageUrl")
        Col(span="12")
          FormItem
            Input(v-model='logoUrl', :placeholder="$lang('建议使用PNG透明图标160*160')" )
              template(slot="prepend") {{$lang('分享logo')}}
              Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:'logoUrl'}", :show-upload-list="false")
                Icon(type="md-cloud-upload" v-show="!loading")
                Icon.spin-icon-load(type="ios-loading" v-show="loading")
            div {{$lang('建议使用PNG透明图标160*160')}}
            div.background(v-if="logoUrl")
              img(:src="logoUrl")
    Card(dis-hover style="margin-top:15px")
      p(slot="title") {{$lang('合约分享配置')}}
      FormItem
        Input(v-model='profitBackgroundUrl.value', :placeholder="$lang('盈利分享背景图')" )
          template(slot="prepend") {{$lang('盈利分享背景图')}}
          Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:'profitBackgroundUrl.value'}", :show-upload-list="false")
            Icon(type="md-cloud-upload" v-show="!loading")
            Icon.spin-icon-load(type="ios-loading" v-show="loading")
        div {{$lang("建议图片尺寸")}} ：414×736px , < 300KB

      FormItem
        Input(v-model='lossBackgroundUrl.value', :placeholder="$lang('亏损分享背景图')" )
          template(slot="prepend") {{$lang('亏损分享背景图')}}
          Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:'lossBackgroundUrl.value'}", :show-upload-list="false")
            Icon(type="md-cloud-upload" v-show="!loading")
            Icon.spin-icon-load(type="ios-loading" v-show="loading")
        div {{$lang("建议图片尺寸")}} ：414×736px , < 300KB

      Alert
        Checkbox(v-for="item in shareTitles.value", v-model="item.enabled", :key="item.language") {{lang[item.language]}}
      template(v-for="item,index in shareTitles.value" v-if="item.enabled")
        Divider(size="small") {{lang[item.language]}}
        Row(:gutter="20")
          Col(span="8")
            FormItem(:label="$lang('合约盈利随机文案')")
              Input(v-model="item.profitShareTitles", :placeholder="$lang('合约盈利随机文案')" type="textarea" :rows="5")
          Col(span="8")
            FormItem(:label="$lang('合约亏损随机文案')")
              Input(v-model="item.lossShareTitles", :placeholder="$lang('合约亏损随机文案')" type="textarea" :rows="5")
          Col(span="8")
            FormItem(:label="$lang('合约0盈利随机文案')")  
              Input(v-model="item.zeroShareTitles", :placeholder="$lang('合约0盈利随机文案')" type="textarea" :rows="5")
    Card(dis-hover style="margin-top:15px")
      p(slot="title") {{$lang('分享配置')}}
      Alert
        Checkbox(v-for="item in localeInfo", v-model="item.enable", :key="item.language") {{lang[item.language]}}
      Row(:gutter="20")
        Col(v-for="item,index in localeInfo" v-if="item.enable" :key="index" span="12")
          Divider {{lang[item.language]}}
          FormItem
            Input(v-model="item.title", :placeholder="$lang('品牌名称')" )
              template(slot="prepend") {{$lang('品牌名称')}}
          FormItem
            Input(v-model="item.description", :placeholder="$lang('下载描述')" )
              template(slot="prepend") {{$lang('下载描述')}}
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" type="primary" long v-else) {{$lang('保存')}}
</template>
<script>
import { mapState } from 'vuex'
import { initData } from '@/libs/common'
import CONSTS from '@/libs/consts'

const { staticUrl } = CONSTS
export default {
  computed: {
    ...mapState(['lang', 'isRead']),
  },
  data() {
    return {
      pageLoading: false,
      loading: false,
      logoUrl: '',
      watermarkImageUrl: '',
      localeInfo: [],
      defaultEnTitle: {
        profitShareTitles: [
          'Never satisfied with these profit',
          'I AM RICH',
          'Greedyisgood',
          'todaMOOOOOOON',
        ],
        lossShareTitles: [
          'Cry for my $',
          'In Crypto we HOLD',
          'I WILL BE BACK',
          'Where is the bull',
        ],
        zeroShareTitles: ['Breakeven is a bless', 'No loss = big gain'],
      },
      defaultZnTitle: {
        profitShareTitles: [
          '挣这点不够，我还要更多',
          "I'm Rich",
          '多买多涨，人生赢家',
          '哈哈，离100倍不远了',
        ],
        lossShareTitles: [
          '被割了，呜呜',
          '人在币市飘，哪有不挨刀',
          '我还会挣回来的',
          '啊啊，我的别墅没了',
        ],
        zeroShareTitles: ['不挣不亏，刚刚好', '没亏就是挣！'],
      },
      defaultProfitBackgroundUrl: `https://${staticUrl}/bhop/image/H0oX9D0sltJidhjMzXuNGLc1P6-BC9kNyVZ3wh5T8Tc.png`,
      defaultLossBackgroundUrl: `https://${staticUrl}/bhop/image/-Nt4xLG7i1133ktAgRb9MAXAzS8AbNsu14vJBwasU3I.png`,
      profitBackgroundUrl: {
        group: 'contract.share.background',
        value: '',
        key: 'profitBackgroundUrl',
        status: 1,
      },
      lossBackgroundUrl: {
        group: 'contract.share.background',
        value: '',
        key: 'lossBackgroundUrl',
        status: 1,
      },
      shareTitles: {
        group: 'contract.share.title',
        key: 'shareTitles',
        value: [],
      },
    }
  },
  methods: {
    loadLossBackground() {
      return this.$axios.post(
        '/api/v1/broker/config/common_config/get_config',
        this.lossBackgroundUrl
      )
    },
    loadProfitBackground() {
      return this.$axios.post(
        '/api/v1/broker/config/common_config/get_config',
        this.profitBackgroundUrl
      )
    },
    loadShareTitle() {
      return this.$axios.post(
        '/api/v1/broker/config/common_config/get_aggerate_config',
        { group: 'contract.share.title', key: 'shareTitles' }
      )
    },

    loadShareConfig() {
      return this.$axios.get('/api/v1/share_config/query')
    },

    saveLossBackground() {
      return this.$axios.post(
        '/api/v1/broker/config/common_config/edit_config',
        this.lossBackgroundUrl
      )
    },
    saveProfitBackground() {
      return this.$axios.post(
        '/api/v1/broker/config/common_config/edit_config',
        this.profitBackgroundUrl
      )
    },

    saveShareTitle() {
      let value = this.shareTitles.value.filter((el) => el.enabled)

      return this.$axios.post(
        '/api/v1/broker/config/common_config/edit_aggerate_config',
        {
          group: 'contract.share.title',
          key: 'shareTitles',
          value: value.map((el) => {
            return {
              language: el.language,
              enabled: true,
              profitShareTitles: el.profitShareTitles.split('\n'),
              lossShareTitles: el.lossShareTitles.split('\n'),
              zeroShareTitles: el.zeroShareTitles.split('\n'),
            }
          }),
        }
      )
    },

    saveShareConfig() {
      let json = {
        logoUrl: this.logoUrl,
        watermarkImageUrl: this.watermarkImageUrl,
        localeInfo: this.localeInfo.filter((el) => el.enable),
      }
      return this.$axios.post('/api/v1/share_config/save', json)
    },

    submit() {
      this.pageLoading = true
      this.$axios
        .all([
          this.saveProfitBackground(),
          this.saveLossBackground(),
          this.saveShareTitle(),
          this.saveShareConfig(),
        ])
        .then((result) => {
          let [profitBackgroundUrl, lossBackgroundUrl, title, config] = result
          if (
            profitBackgroundUrl.code == 0 &&
            lossBackgroundUrl.code == 0 &&
            title.code == 0 &&
            config.code == 0
          ) {
            this.pageLoading = false
            this.$Notice.success({
              title: this.$lang('成功'),
            })
          }
        })
    },
    uploadSuccess(result) {
      this.loading = false
      if (result.code != 0) {
        return
      }
      let arr = result.data.echoStr.split('.')
      if (arr.length > 1) {
        this[arr[0]][arr[1]] = result.data.url
      } else {
        this[arr[0]] = result.data.url
      }

      this.$Notice.success({
        title: this.$lang('成功'),
      })
    },
    beforeUpload() {
      this.loading = true
    },
  },
  created() {
    this.pageLoading = true
    this.$axios
      .all([
        this.loadProfitBackground(),
        this.loadLossBackground(),
        this.loadShareTitle(),
        this.loadShareConfig(),
      ])
      .then((result) => {
        let [profitBackgroundUrl, lossBackgroundUrl, title, config] = result
        if (
          profitBackgroundUrl.code == 0 &&
          lossBackgroundUrl.code == 0 &&
          title.code == 0 &&
          config.code == 0
        ) {
          this.pageLoading = false

          if (profitBackgroundUrl.data) {
            if (profitBackgroundUrl.data.value === '') {
              profitBackgroundUrl.data.value = this.defaultProfitBackgroundUrl
            }
            Object.assign(this.profitBackgroundUrl, profitBackgroundUrl.data)
          }
          if (lossBackgroundUrl.data) {
            if (profitBackgroundUrl.data.value === '') {
              profitBackgroundUrl.data.value = this.defaultLossBackgroundUrl
            }
            Object.assign(this.lossBackgroundUrl, lossBackgroundUrl.data)
          }

          // 合约分享文案

          let titles = initData(
            this.lang,
            JSON.stringify({
              profitShareTitles: '',
              lossShareTitles: '',
              zeroShareTitles: '',
            })
          )

          titles.forEach((el) => {
            let temp = {
              profitShareTitles: '',
              lossShareTitles: '',
              zeroShareTitles: '',
            }
            if (el.language === 'en-us') {
              temp.profitShareTitles = this.defaultEnTitle.profitShareTitles.join(
                '\n'
              )
              temp.lossShareTitles = this.defaultEnTitle.lossShareTitles.join(
                '\n'
              )
              temp.zeroShareTitles = this.defaultEnTitle.zeroShareTitles.join(
                '\n'
              )
              Object.assign(el, temp)
            } else if (el.language === 'zh-cn') {
              temp.profitShareTitles = this.defaultZnTitle.profitShareTitles.join(
                '\n'
              )
              temp.lossShareTitles = this.defaultZnTitle.lossShareTitles.join(
                '\n'
              )
              temp.zeroShareTitles = this.defaultZnTitle.zeroShareTitles.join(
                '\n'
              )
              Object.assign(el, temp)
            } else {
              Object.assign(el, temp)
            }
            let tmp = title.data.value.filter(
              (_el) => el.language == _el.language
            )
            if (tmp.length) {
              tmp[0].enabled = true
              tmp[0].profitShareTitles = tmp[0].profitShareTitles.join('\n')
              tmp[0].lossShareTitles = tmp[0].lossShareTitles.join('\n')
              tmp[0].zeroShareTitles = tmp[0].zeroShareTitles.join('\n')
              Object.assign(el, tmp[0])
            }
          })

          this.shareTitles.value = titles

          // 分享配置

          let localeInfo = initData(
            this.lang,
            JSON.stringify({ title: '', description: '', downloadUrl: '' }),
            'language',
            'enable'
          )
          localeInfo.forEach((el) => {
            let tmp = config.data.localeInfo.filter(
              (_el) => el.language == _el.language
            )
            if (tmp.length) {
              tmp[0].enable = true
              Object.assign(el, tmp[0])
            }
          })
          this.localeInfo = localeInfo
          this.logoUrl = config.data.logoUrl
          this.watermarkImageUrl = config.data.watermarkImageUrl
        }
      })
  },
}
</script>
