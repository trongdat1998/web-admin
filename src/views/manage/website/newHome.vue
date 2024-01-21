<style lang="less">
.index-settings {
  .ivu-card {
    margin-top: 30px;
    border-top: 4px solid #999 !important;
  }

  .ivu-card-body {
    padding: 0;
  }
  &-wraper {
    padding: 16px;
  }

  &-select {
    padding-top: 100px;
  }
}
</style>
<template lang="pug">
.index-settings
  Alert
    a(href="https://xxxxx.zendesk.com/hc/zh-cn/articles/360043021234" target="_blank") {{$lang("网站首页配置及配色帮助说明")}}
  .index-settings-select(v-if="!isinit")
    Row(:gutter="20")
      Col(span="5") &nbsp;
      Col(:span="indexNewVersion?6:14")
        Button(type="primary" to="/manage/website/newHome?status=0" long size="large" ghost @click="loadConfig(0)") {{$lang('加载最后一次预览配置')}}
      Col(span="2") &nbsp;
      Col(span="6" v-if="indexNewVersion")
        Button(type="primary" to="/manage/website/newHome?status=1" long size="large" @click="loadConfig(1)") {{$lang('加载线上配置')}}
      Col(span="5") &nbsp;
  Row(:gutter="30")
    Col(span="20")
      Card(dis-hover :title="$lang(options[index].name)" :id="options[index].key" v-for="item,index in data" :key="options[index].key")
        template(slot="extra")
          iSwitch(size="large" v-model="item.open")
            span(slot="open") {{$lang('开')}}
            span(slot="close") {{$lang('关')}}

        // 一键买币
        .index-settings-wraper(v-show="item.open" v-if="options[index].key==='oneKeyBuy'")
          Button(to="/otc/settings/tokens" target="_blank") {{$lang('修改配置')}}

        // 首页推荐币对
        .index-settings-wraper(v-show="item.open" v-else-if="options[index].key==='recommended'")
          Button(to="/manage/public/home" target="_blank") {{$lang('修改配置')}}

        // 行情
        .index-settings-wraper(v-show="item.open" v-else-if="options[index].key==='symbols'")
          Alert
            Checkbox(v-for="_item in item.contentlist", v-model="_item.enable", :key="_item.locale") {{lang[_item.locale]}}
          Row(:gutter="20")
            Col(v-for="(_item,_index) in item.contentlist" v-show="_item.enable" :key="_index" span="12")
              Divider {{lang[_item.locale]}}
              Select(v-model="_item.content")
                Option(value="0") {{$lang("全部")}}
                Option(value="5") 5{{$lang("条")}}
                Option(value="10") 10{{$lang("条")}}
                Option(value="15") 15{{$lang("条")}}
                Option(value="20") 20{{$lang("条")}}
        
        // 优势特点介绍
        .index-settings-wraper(v-show="item.open" v-else-if="options[index].key==='platform'")
          Alert
            Checkbox(v-for="_item in item.contentlist", v-model="_item.enable", :key="_item.locale") {{lang[_item.locale]}}
          div(v-for="(_item,_index) in item.contentlist" v-show="_item.enable")
            Divider  {{$lang(options[index].name)}} - {{lang[_item.locale]}} 
              template(v-if="_index==0") （{{$lang('默认')}}）
              a(href="javascript:;" @click="useDefault(options[index].key,item.contentlist,_index)" v-else) （{{$lang('使用默认')}}）
            Form
              FormItem
                Input(v-model="_item.content.featureTitle", :placeholder="$lang('标题')")
                  span(slot="prepend") {{$lang('标题')}}
              FormItem
                Input(v-model="_item.content.featureDesc", :placeholder="$lang('描述')")
                  span(slot="prepend") {{$lang('描述')}}
              Row(:gutter="20")
                Col(span="12")
                  FormItem
                    Input(v-model='_item.content.image', :placeholder="$lang('背景图片')")
                      Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:'image_'+index+'_'+_index}")
                        Icon(type="md-cloud-upload" v-show="!uploading")
                        Icon.spin-icon-load(type="ios-loading" v-show="uploading")
                      template(slot="prepend") {{$lang('背景图片')}}
                Col(span="12")
                  FormItem
                    Input(v-model="_item.content.background", :placeholder="$lang('背景色')")
                      span(slot="prepend") {{$lang('背景色')}}
                      ColorPicker(v-model="_item.content.background" slot="append" size="small")
              Row(:gutter="20")
                Col(span="6" v-for="(__item,__index) in _item.content.features", :key="__index")
                  FormItem
                    Input(v-model='__item.image', :placeholder="$lang('图片')")
                      Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:'image_'+index+'_'+_index+'_'+__index}")
                        Icon(type="md-cloud-upload" v-show="!uploading")
                        Icon.spin-icon-load(type="ios-loading" v-show="uploading")
                      template(slot="prepend") {{$lang('图片')}}
                    div 300×300 {{$lang("透明背景")}}
                  FormItem
                    Input(v-model="__item.title", :placeholder="$lang('标题')")
                      template(slot="prepend") {{$lang('标题')}}
                  FormItem(:label="$lang('描述')")
                    Input(v-model="__item.description", :placeholder="$lang('描述')" type="textarea" :rows="3")
              
        // 自定义和下载区域
        .index-settings-wraper(v-show="item.open" v-else-if='/userDefine/.test(options[index].key)||options[index].key === "download"||options[index].key === "quickRegistration"')
          Alert
            Checkbox(v-for="_item in item.contentlist", v-model="_item.enable", :key="_item.locale") {{lang[_item.locale]}}
          Row(:gutter="20")
            Col(v-for="_item,_index in item.contentlist" v-show="_item.enable" :key="_index" span="12")
              Divider  {{$lang(options[index].name)}} - {{lang[_item.locale]}}
                template(v-if="_index==0") （{{$lang('默认')}}）
                a(href="javascript:;" @click="useDefault(options[index].key,item.contentlist,_index)" v-else) （{{$lang('使用默认')}}）
              Form
                FormItem
                  Input(v-model="_item.content.title", :placeholder="$lang('标题')")
                    span(slot="prepend") {{$lang('标题')}}
                FormItem
                  Input(v-model="_item.content.desc", :placeholder="$lang('描述')")
                    span(slot="prepend") {{$lang('描述')}}
                FormItem
                  Input(v-model='_item.content.image', :placeholder="$lang('背景图片')")
                    Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:'image_'+index+'_'+_index}")
                      Icon(type="md-cloud-upload" v-show="!uploading")
                      Icon.spin-icon-load(type="ios-loading" v-show="uploading")
                    template(slot="prepend") {{$lang('背景图片')}}
                FormItem
                  Input(v-model="_item.content.background", :placeholder="$lang('背景色')")
                    span(slot="prepend") {{$lang('背景色')}}
                    ColorPicker(v-model="_item.content.background" slot="append" size="small")
                FormItem(v-if="/userDefine/.test(options[index].key)")
                  Input(v-model="_item.content.link", :placeholder="$lang('链接')")
                    span(slot="prepend") {{$lang('链接')}}
          template(v-if='options[index].key === "download"')
            Divider {{$lang('下载图标')}}
            Form
              Row(:gutter="20")
                Col(span="6" v-for="(_item,_index) in item.contentlist[0].content.list", :key="_index")
                  FormItem
                    Input(v-model='_item.image', :placeholder="$lang('图标')")
                      Upload(slot="append" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:'icon_'+index+'_'+_index}")
                        Icon(type="md-cloud-upload" v-show="!uploading")
                        Icon.spin-icon-load(type="ios-loading" v-show="uploading")
                      template(slot="prepend") {{$lang('图标')}}
                  FormItem
                    Input(v-model="_item.name", :placeholder="_item.tag")
                      template(slot="prepend") {{_item.tag}}
                  FormItem
                    Input(v-model="_item.link", :placeholder="$lang(_item.tag=='Iphone'||_item.tag=='Android'?'建议不填写':'下载链接')")
                      template(slot="prepend") {{$lang('下载链接')}}
    Col(span="4" v-if="!pageLoading&&isinit")
      Anchor(show-ink)
        AnchorLink(:scroll-offset="-180" :href="'#'+ item.key" :title="$lang(item.name)" v-for="item in options" :key="item.key")
  Fixed(v-if="isinit&&!isRead")
    Row(:gutter="20")
      Col(:span="indexNewVersion?16:20")
        Tag(size="large") {{$lang('当前配置')}}:{{status==1?$lang('线上配置'):$lang('预览配置')}}
      Col(span="4")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit(0)", :loading="loading" :disabled="loading" type="primary" long v-else ghost :icon='status==0?"md-cloud-upload":"md-swap"') {{$lang('保存并预览')}}
      Col(span="4" v-if="indexNewVersion")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit(1)", :loading="loading" :disabled="loading" type="primary" long v-else :icon='status==1?"md-cloud-upload":"md-swap"') {{$lang('发布到线上')}}
  Modal(v-model="win" :title="$lang('使用旧版本')" width="300")
    Alert(type="error") {{$lang('您确定执行此操作吗？')}}
    Button(slot="footer" long type="error" @click="loadVersion" :loading="loading" :disabled="loading") {{$lang('确定')}}
</template>
<script>
import { mapState } from 'vuex'
import CONSTS from '@/libs/consts'

const { staticUrl } = CONSTS
export default {
  data() {
    return {
      status: this.$route.query.status,
      win: false,
      options: [
        { name: '法币一键购买', key: 'oneKeyBuy' },
        { name: '推荐币对行情', key: 'recommended' },
        { name: '币对行情', key: 'symbols' },
        { name: '优势特点介绍', key: 'platform' },
        { name: '自定义区域1', key: 'userDefine1' },
        { name: '自定义区域2', key: 'userDefine2' },
        { name: '自定义区域3', key: 'userDefine3' },
        { name: '下载模块', key: 'download' },
        { name: '一分钟注册模块', key: 'quickRegistration' },
      ],
      isinit: false,
      loading: false,
      uploading: false,
      pageLoading: false,
      data: [],
      historyFeatures: {},
    }
  },
  computed: {
    ...mapState(['lang', 'apiDomain', 'indexNewVersion', 'isRead']),
  },
  methods: {
    useDefault(moduleName, contentlist, index) {
      if (moduleName === 'platform') {
        contentlist[index].content.featureTitle =
          contentlist[0].content.featureTitle
        contentlist[index].content.image = contentlist[0].content.image
        contentlist[index].content.background =
          contentlist[0].content.background
        contentlist[
          index
        ].content.features = contentlist[0].content.features.map((el) =>
          Object.assign({}, el)
        )
      } else {
        Object.assign(contentlist[index].content, contentlist[0].content)
      }
    },
    loadVersion() {
      this.$axios
        .post('/api/v1/broker/index_customer_config/switch', {
          newVersion: false,
        })
        .then((result) => {
          if (result.code == 0) {
            location.reload()
          }
        })
    },

    postData(items) {
      return this.$axios.post('/api/v1/broker/index_customer_config/edit', {
        items,
      })
    },
    async submit(status) {
      this.loading = true
      let items = []
      this.data.forEach((el) => {
        let json = Object.assign({}, el, { status })

        let arr = []

        if (json.contentlist && json.contentlist.length) {
          json.contentlist.forEach((_el) => {
            let _json = Object.assign({}, _el)
            if (_el.enable) {
              // download数据特殊处理

              if (json.moduleName === 'download') {
                _json.content.list = el.contentlist[0].content.list
              }

              if (json.moduleName !== 'symbols') {
                _json.content = JSON.stringify(_el.content)
              }

              arr.push(_json)
            }
          })
          json.contentlist = arr
        }

        items.push(json)
      })

      let result = await this.postData(items)
      this.loading = false
      if (result.code === 0) {
        this.$Notice.success({
          title: this.$lang('成功'),
        })
      }
      if (status == 0) {
        window.open(['https://www' + this.apiDomain, 'preview=true'].join('?'))
      }
    },
    uploadSuccess(result) {
      this.uploading = false
      if (result.code != 0) {
        return
      }
      let tmp = result.data.echoStr.split('_')

      if (tmp.length == 4) {
        this.data[tmp[1]].contentlist[tmp[2]].content.features[tmp[3]].image =
          result.data.url
      } else {
        if (tmp[0] === 'icon') {
          this.data[tmp[1]].contentlist[0].content.list[tmp[2]].image =
            result.data.url
        } else {
          this.data[tmp[1]].contentlist[tmp[2]].content.image = result.data.url
        }
      }
      this.$Notice.success({
        title: this.$lang('成功'),
      })
    },
    beforeUpload() {
      this.uploading = true
    },
    loadConfig(status) {
      this.status = status
      this.isinit = true
      this.pageLoading = true
      this.$axios
        .post('/api/v1/broker/index_customer_config/query', { status })
        .then((result) => {
          if (result.code == 0) {
            this.pageLoading = false
            let data = this.initData()
            result.data.items.forEach((online) => {
              data.forEach((local) => {
                if (online.moduleName == local.moduleName) {
                  //同步开关
                  local.open = online.open
                  //同步列表
                  online.contentlist &&
                    online.contentlist.forEach((onlineEl) => {
                      local.contentlist &&
                        local.contentlist.forEach((localEl) => {
                          if (onlineEl.locale == localEl.locale) {
                            //当前语言存在默认开启
                            localEl.enable = true

                            //逐项数据覆盖
                            if (online.moduleName === 'symbols') {
                              localEl.content = onlineEl.content
                            } else if (
                              /userDefine/.test(online.moduleName) ||
                              online.moduleName === 'download' ||
                              online.moduleName === 'quickRegistration'
                            ) {
                              Object.assign(
                                localEl.content,
                                JSON.parse(onlineEl.content)
                              )
                            } else if (online.moduleName === 'platform') {
                              let _json = JSON.parse(onlineEl.content)

                              localEl.content.featureTitle = _json.featureTitle
                              localEl.content.featureDesc = _json.featureDesc
                              localEl.content.background =
                                _json.background || ''
                              localEl.content.image = _json.image || ''

                              localEl.content.features.forEach(
                                (localElFeature) => {
                                  _json.features.forEach((onlineElFeature) => {
                                    if (
                                      localElFeature.index ==
                                      onlineElFeature.index
                                    ) {
                                      Object.assign(
                                        localElFeature,
                                        onlineElFeature
                                      )
                                    }
                                  })
                                }
                              )
                            }
                          }
                        })
                    })
                }
              })
            })
            this.data = data
          }
        })
    },

    initData() {
      let data = []
      this.options.forEach((el) => {
        let json = {
          moduleName: el.key,
          open: false, //是否打开
          status: 1, //1-直接保存 0-预览
          contentlist: [],
        }

        Object.keys(this.lang).forEach((locale, index) => {
          let _json = {
            enable: index === 0,
            locale: locale,
          }

          if (el.key === 'symbols') {
            _json.content = '0'
          } else if (
            /userDefine/.test(el.key) ||
            el.key === 'quickRegistration'
          ) {
            _json.content = {
              title: '',
              desc: '',
              image: '',
              background: '',
              link: '',
            }
          } else if (el.key === 'download') {
            let icon = {
              Iphone: `https://${staticUrl}/bhop/image/_X7p4grED31FILAisw9XcSC2-lwu3p9XSBmwJ-kpSBk.png`,
              Android: `https://${staticUrl}/bhop/image/P8vUSSexOGm8RjOZ7OlGOorT0TkNBPEjd_jJhTFTV-M.png`,
            }
            _json.content = {
              title: '',
              image: `https://${staticUrl}/static/media/download.e65857d4.png`,
              background: '#F4F7FF',
              list: [],
            }
            ;['Windows', 'Mac OS', 'Iphone', 'Android'].forEach((_el) => {
              _json.content.list.push({
                name: _el,
                link: '',
                image: icon[_el] || '',
                tag: _el,
              })
            })
          } else if (el.key === 'platform') {
            let content = this.historyFeatures[locale] || {}
            if (content['featureTitle']) {
              _json.enable = true
            }

            _json.content = {
              featureTitle: content['featureTitle'] || '',
              featureDesc: '',
              background: '',
              image: '',
              features: [],
            }
            ;[0, 1, 2, 3].forEach((_el) => {
              let tmp = {}
              if (content.features && content.features[_el]) {
                tmp = content.features[_el]
              }
              _json.content.features.push({
                image: tmp.imageUrl || '',
                title: tmp.title || '',
                description: tmp.description || '',
                index: _el,
              })
            })
          } else {
            return delete json.contentlist
          }

          json.contentlist.push(_json)
        })

        data.push(json)
      })

      return data
    },
  },
  created() {
    if (!this.indexNewVersion && sessionStorage.features) {
      this.historyFeatures = JSON.parse(sessionStorage.features)
      sessionStorage.removeItem('features')
    }
    if (this.status == 1 || this.status == 0) {
      this.loadConfig(this.status)
    }
  },
}
</script>
