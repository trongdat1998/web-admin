<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="5")
      Select(v-model="searchForm.platform" @on-change="filter")
        Option(:value="1") {{$lang('网站')}}
        Option(:value="2") {{$lang('手机端')}}
    Col(span="5")
      Select(v-model="searchForm.bannerPosition" @on-change="filter")
        Option(:value="1") {{$lang('大BANNER')}}
        Option(:value="2") {{$lang('小BANNER')}}
        Option(:value="3" v-if="searchForm.platform==2") {{$lang('APP首页弹窗广告')}}
    Col(span="9") &nbsp;
    Col(span="5")
      Button(long type="primary" ghost @click="create" icon="md-add-circle" :disabled="isRead") {{$lang('新建')}}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
  .page-pages(v-if="total>searchForm.pageSize")
    Page(:current.sync="searchForm.current", :total="total", :pageSize="searchForm.pageSize" @on-change="loadData")
  
  // 创建修改Banner  
  Modal.page-exchange-win(v-model="creatWinStatus", :title="$lang(`${nextType =='create' ? '新建':'修改'}`)" width="800")
    Form(:model='formItem', :label-width='100')
      FormItem(:label="$lang('平台')")
        RadioGroup(v-model="formItem.platform" @on-change="changePlatform")
          Radio(:label="1") {{$lang('网站')}}
          Radio(:label="2") {{$lang('手机端')}}
      FormItem(:label="$lang('图片大小')")
        RadioGroup(v-model="formItem.bannerPosition")
          Radio(:label="1") {{$lang('大BANNER')}}
          Radio(:label="2") {{$lang('小BANNER')}} {{formItem.platform ==2 ? `(${$lang("最多配置3张")})` : ''}}
          Radio(:label="3" v-if="formItem.platform ==2") {{$lang('APP首页弹窗广告')}}
      FormItem(:label="$lang('上架周期')")
        DatePicker(type="datetimerange" format="yyyy-MM-dd HH:mm" style="width:100%" v-model="tempDate", :placeholder="$lang('时间')")
      FormItem(:label="$lang('排序')")
        Slider(show-input v-model="formItem.rank")
      Alert
        Checkbox(v-for="(item,index) in banner", v-model="item.enable", :key="index") {{lang[item.locale]}}
      template(v-for="(item,index) in banner" v-if="item.enable")
        Divider {{lang[item.locale]}}
        FormItem(:label="$lang('图片')")
          Input(v-model='item.imageUrl', :placeholder="$lang('图片')")
            span(slot="prefix")
              img(:src="item.imageUrl" height="100%" width="50"  v-if="item.imageUrl")
            Upload(slot="suffix" action="/api/v1/storage/image/banner", name="uploadFile", :on-success="uploadSuccess", :show-upload-list="false", :title="index", :before-upload="handleBeforeUpload" :disabled="uploading" :data="{echoStr:`imageUrl-${index}`}")
              Icon(type="md-cloud-upload" v-show="!uploading")
              Icon.spin-icon-load(type="ios-loading" v-show="uploading")
          div(v-if="formItem.platform==2 && formItem.bannerPosition==1") {{$lang("建议图片尺寸")}} ：1125×525px, <80KB
          div(v-else-if="formItem.platform==2 && formItem.bannerPosition==2") {{$lang("尺寸要求")}} ：1{{$lang("张图大小")}} 688*128；2{{$lang("张图大小")}} 336*128；3{{$lang("张图大小")}}224*128
          div(v-else-if="formItem.platform==1 && formItem.bannerPosition==1") {{$lang("建议图片尺寸")}} ：2560×552px, <100KB, 安全区域/版心是1000
          div(v-else-if="formItem.platform==2 && formItem.bannerPosition==3") {{$lang("建议图片尺寸")}} ：915 * 1200px, <150KB
          div(v-else) {{$lang("建议图片尺寸")}} ：528×288px, <50KB
        FormItem(:label="$lang('H5图片')" v-show="formItem.platform==1")
          Input(v-model='item.h5ImageUrl', :placeholder="$lang('H5图片')")
            span(slot="prefix")
              img(:src="item.h5ImageUrl" height="100%" width="50" v-if="item.h5ImageUrl")
            Upload(slot="suffix" action="/api/v1/storage/image/banner", name="uploadFile", :on-success="uploadSuccess", :show-upload-list="false", :title="index", :before-upload="handleBeforeUpload" :disabled="uploading" :data="{echoStr:`h5ImageUrl-${index}`}")
              Icon(type="md-cloud-upload" v-show="!uploading")
              Icon.spin-icon-load(type="ios-loading" v-show="uploading")
          div {{$lang("建议图片尺寸")}} ：1125×525px, <80KB
          
        FormItem(:label="$lang('标题')")
          Input(v-model='item.title', :placeholder="$lang('标题')")
        FormItem(:label="$lang('链接')")
          Input(v-model='item.pageUrl', :placeholder="$lang('链接')" v-if="formItem.platform==1" key="pageurl")
          template(v-else)
            AutoComplete(v-model="item.pageUrl")
              Option(v-for="(value, key, index) in pushUrlData" :value="key" :key="index") {{$lang(value)}}
            Tag(v-if="item.pageUrl")
                template(v-if="/^Page=/.test(item.pageUrl)") {{$lang('打开应用内页面')}} : {{pushUrlData[item.pageUrl]?pushUrlData[item.pageUrl]:pushUrlData['Page=']}}
                template(v-else) {{$lang('打开网页')}}
            Button.noBorder(size="small" type="primary", ghost, to="https://xxxxx.zendesk.com/hc/zh-cn/articles/360051990854" target="_blank" style="margin-top:6px ;float:right; font-size:12px") {{$lang('参数帮助')}}
    template(slot="footer")
      Button(@click="doNext", :loading="loading" type="primary") {{$lang('确定')}}
  Modal(v-model="removeWin" :title="$lang('删除')" footer-hide width="300")
    div(style="padding:10px 0 20px") {{$lang("您确定执行此操作吗？")}}
    div {{removeData.title}}
    Button(@click="remove"  long type="error") {{$lang("确定")}}

</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      pushUrlData: {
        'Page=TABHOME': this.$lang('APP首页'),
        'Page=TABQUOTE': this.$lang('行情TAB页面'),
        'Page=TABTRADE': this.$lang('币币交易TAB页面'),
        'Page=TABFUTURES': this.$lang('合约交易TAB页面'),
        'Page=TABASSETS': this.$lang('资产TAB页面'),
        'Page=': this.$lang('自定义参数跳转'),
        'https://': this.$lang('网页'),
      },
      removeWin: false,
      removeData: {
        bannerId: '',
      },
      uploading: false,
      uploadIndex: '',
      loadingTable: true,
      loading: false,
      tempDate: [], //日历临时存放值
      creatWinStatus: false,
      nextType: '',
      total: 0,
      locale: this.$i18n.locale,
      searchForm: {
        bannerPosition: 1,
        platform: 1,
        current: 1,
        pageSize: 100,
      },
      banner: [],
      formItem: {
        id: '',
        platform: 1,
        bannerPosition: 1,
        rank: 1,
        beginAt: '',
        endAt: '',
        localeDetails: [],
      },
      columns: [
        {
          title: this.$lang('平台'),
          minWidth: 140,
          render: (h) =>
            h('span', this.searchForm.platform === 1 ? 'PC' : 'APP'),
        },
        {
          title: this.$lang('标题'),
          minWidth: 160,
          render: (h, p, text) => {
            text = '-'
            if (p.row.localeDetails.length) {
              text = p.row.localeDetails[0].title
              p.row.localeDetails.forEach((el) => {
                if (el.locale == this.locale) {
                  text = el.title
                }
              })
            }
            return h('span', text)
          },
        },
        {
          title: this.$lang('图片'),
          minWidth: 140,
          render: (h, p, text) => {
            if (p.row.localeDetails.length) {
              text = p.row.localeDetails[0].imageUrl
              p.row.localeDetails.forEach((el) => {
                if (el.locale == this.locale) {
                  text = el.imageUrl
                }
              })
            }
            return h('img', {
              attrs: {
                src: text,
                style: 'padding:10px;max-height:100px;max-width:100%',
              },
            })
          },
        },
        {
          title: this.$lang('链接'),
          minWidth: 160,
          render: (h, params, href) => {
            if (params.row.localeDetails.length) {
              href = params.row.localeDetails[0].pageUrl
              params.row.localeDetails.forEach((el) => {
                if (el.locale == this.locale) {
                  href = el.pageUrl
                }
              })
            }

            return h(
              'a',
              {
                attrs: {
                  target: '_blank',
                  href: href,
                },
              },
              href
            )
          },
        },
        {
          title: this.$lang('排序'),
          minWidth: 70,
          key: 'rank',
        },
        {
          title: this.$lang('语言'),
          minWidth: 140,
          render: (h, p, temp = []) => {
            if (p.row.localeDetails.length) {
              p.row.localeDetails.forEach((el) => {
                temp.push(this.lang[el.locale])
              })
            }
            return h('span', temp.join('、'))
          },
        },
        {
          title: this.$lang('活动时间'),
          minWidth: 190,
          render: (h, p) =>
            h('div', [
              h('div', this.newDate(p.row.beginAt).format()),
              h('div', this.newDate(p.row.endAt).format()),
            ]),
        },
        {
          title: this.$lang('状态'),
          minWidth: 100,
          render: (h, params) => {
            let msg = ''
            if (params.row.status == 1) {
              msg = '未启用'
            } else if (params.row.status == 2) {
              msg = '已启用'
            } else {
              msg = '已禁用'
            }

            return h('div', [
              h(
                'Tag',
                {
                  props: {
                    color: params.row.status == 2 ? 'success' : 'error',
                  },
                },
                this.$lang(msg)
              ),
            ])
          },
        },

        {
          title: this.$lang('操作'),
          align: 'center',
          fixed: 'right',
          minWidth: 120,
          render: (h, params) => {
            return this.isRead
              ? h('span', '---')
              : [
                  h(
                    'a',
                    {
                      on: {
                        click: () => {
                          this.creatWinStatus = true
                          this.nextType = 'edit'
                          Object.assign(this.formItem, params.row)
                          //初始化表单数据
                          this.initFormItem()
                          this.banner.forEach((el, index) => {
                            params.row.localeDetails.forEach((_el) => {
                              if (_el.locale == el.locale) {
                                _el.enable = true
                                Object.assign(this.banner[index], _el)
                              }
                            })
                          })

                          //console.log(Number(params.row.beginAt),Number(params.row.endAt))
                          this.tempDate = [
                            new Date(Number(params.row.beginAt)),
                            new Date(Number(params.row.endAt)),
                          ]
                        },
                      },
                    },
                    this.$lang('修改')
                  ),
                  h('span', ' | '),
                  h(
                    'a',
                    {
                      on: {
                        click: () => {
                          this.removeData.bannerId = params.row.bannerId
                          this.removeWin = true
                        },
                      },
                    },
                    this.$lang('删除')
                  ),
                ]
          },
        },
      ],
      listData: [],
    }
  },
  methods: {
    changePlatform() {
      if (this.formItem.platform == 2) {
        this.formItem.bannerPosition = 1
      }
    },
    remove() {
      this.$axios
        .post('/api/v1/banner/delete', this.removeData)
        .then((result) => {
          if (result.code == 0) {
            this.removeWin = false
            this.loadData()
          }
        })
    },
    filter() {
      // if (this.searchForm.platform == 2) {
      //   this.searchForm.bannerPosition = 1;
      // }
      this.searchForm.current = 1
      this.loadData()
    },
    loadData() {
      this.loadingTable = true
      this.$axios
        .post('/api/v1/banner/query', this.searchForm)
        .then((result) => {
          this.loadingTable = false
          if (result.code === 0) {
            this.listData = result.data.list
            this.total = result.data.total
          }
        })
    },
    settings(row) {
      this.$axios
        .post(
          row.status
            ? '/api/v1/banner/forbid_publish'
            : '/api/v1/banner/allow_publish',
          {
            bannerId: row.id,
          }
        )
        .then((result) => {
          if (result.code === 0) {
            this.loadData()
          }
        })
    },
    create() {
      this.creatWinStatus = true
      this.nextType = 'create'
      this.initFormItem()
      this.tempDate = []
      this.formItem = Object.assign(this.formItem, {
        bannerPosition: this.searchForm.bannerPosition,
        platform: this.searchForm.platform,
        rank: 1,
        beginAt: '',
        endAt: '',
        localeDetails: [],
      })
    },
    doNext() {
      this.loading = true
      if (this.tempDate.length) {
        this.formItem.beginAt = new Date(this.tempDate[0]).getTime()
        this.formItem.endAt = new Date(this.tempDate[1]).getTime()
      }

      this.formItem.localeDetails = this.banner.filter((el) => el.enable)

      this.$axios
        .post(
          this.nextType == 'create'
            ? '/api/v1/banner'
            : '/api/v1/banner/update',
          this.formItem
        )
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.creatWinStatus = false
            this.loadData()
          }
        })
    },
    initFormItem() {
      this.banner = []
      for (let key in this.lang) {
        this.banner.push({
          title: '',
          pageUrl: '',
          type: 1,
          locale: key,
          imageUrl: '',
          h5ImageUrl: '',
          enable: this.nextType == 'create' && key == this.locale, // 添加的时候取系统默认语言
        })
      }
    },
    uploadSuccess(res) {
      if (res.code === 0) {
        const [type, index] = res.data.echoStr.split('-')
        this.banner[index][type] = res.data.url
      }
      this.uploading = false
    },
    handleBeforeUpload() {
      this.uploading = true
      return true
    },
  },
  computed: {
    ...mapState(['lang', 'isRead']),
  },
  created() {
    this.loadData()
  },
}
</script>
