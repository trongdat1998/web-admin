<style lang="less">
.index-settings-theme {
  .ivu-card {
    margin-top: 30px;
  }

  // .ivu-card-body {
  //   padding: 0;
  // }
  // &-wraper {
  //   padding: 16px;
  // }

  &-select {
    padding-top: 100px;
  }

  .padding {
    padding-top: 15px;
    padding-bottom: 15px;
  }
}
</style>
<template lang="pug">
.index-settings-theme
  Alert
    a(
      href="https://xxxxx.zendesk.com/hc/zh-cn/articles/360043021234",
      target="_blank"
    ) {{ $lang('网站首页配置及配色帮助说明') }}
  .index-settings-theme-select(v-if="!isinit")
    Row(:gutter="20")
      Col(span="5") &nbsp;
      Col(span="6")
        Button(
          type="primary",
          to="/manage/website/theme?status=0",
          long,
          size="large",
          ghost,
          @click="loadConfig(0)"
        ) {{ $lang('加载最后一次预览配置') }}
      Col(span="2") &nbsp;
      Col(span="6")
        Button(
          type="primary",
          to="/manage/website/theme?status=0",
          long,
          size="large",
          @click="loadConfig(1)"
        ) {{ $lang('加载线上配置') }}
      Col(span="5") &nbsp;
  template(v-for="(_data, index) in data")
    Card(
      dis-hover,
      :title="$lang(item.useModule == 1 ? '全站配色' : '交易页配色')",
      v-for="(item, _index) in _data.contentlist",
      :key="_index"
    )
      Dropdown(slot="extra")
        a(href="javascript:void(0)") {{ $lang('重置配色') }}
          Icon(type="ios-arrow-down")
        DropdownMenu(slot="list")
          DropdownItem(@click.native="resetTheme(item, 'blue')") {{ $lang('蓝色系主题') }}
          DropdownItem(@click.native="resetTheme(item, 'green')") {{ $lang('绿色系主题') }}
          DropdownItem(@click.native="resetTheme(item, 'yellow')") {{ $lang('黄色系主题') }}
          DropdownItem(@click.native="resetTheme(item, 'purple')") {{ $lang('紫色系主题') }}
      Form(:label-width="120", label-position="left")
        //- FormItem(:label="$lang('基础风格')")
        //-   RadioGroup(v-model="item.type")
        //-     Radio(:label="1") {{$lang("亮色系")}}
        //-     Radio(:label="2") {{$lang("暗色系")}}
        FormItem(:label="$lang('应用平台')")
          CheckboxGroup(v-model="item.platform")
            Checkbox(:label="1") WEB
            Checkbox(:label="2") {{ $lang('移动端') }}-WEB
            //Checkbox(:label="3") {{$lang("移动端")}}-APP
      template(v-for="(_item, _key) in item.content")
        template(v-if="Object.keys(options).indexOf(_key) > -1")
          Divider(orientation="left", size="small") {{ $lang(options[_key]) }}
          Row.padding(:gutter="20")
            template(v-for="(__item, __key) in _item")
              Col(span="4")
                Button(
                  :style="{ background: __key === 'contrastText' ? '' : __item }",
                  long,
                  type="text"
                )
                  span(:style="objectStyle(_item.contrastText, __key)") {{ $lang(desc[__key]) }}
                Input(v-model="_item[__key]")
              Col(span="2")
                ColorPicker(v-model="_item[__key]", :editable="false")
        //- Divider(orientation="left") {{$lang("交易页配色")}}
  Fixed(v-if="isinit && !isRead")
    Row(:gutter="20")
      Col(span="6")
        Tag(size="large") {{ $lang('当前配置') }}:{{ $lang(status == 1 ? '线上配置' : '预览配置') }}
      Col(span="10") &nbsp;
      Col(span="4")
        Button(v-if="pageLoading", loading, long) {{ $lang('加载中') }}
        Button(
          @click="submit(0)",
          :loading="loading",
          :disabled="loading",
          type="primary",
          long,
          v-else,
          ghost,
          :icon="status == 0 ? 'md-cloud-upload' : 'md-swap'"
        ) {{ $lang('保存并预览') }}
      Col(span="4")
        Button(v-if="pageLoading", loading, long) {{ $lang('加载中') }}
        Button(
          @click="submit(1)",
          :loading="loading",
          :disabled="loading",
          type="primary",
          long,
          v-else,
          :icon="status == 1 ? 'md-cloud-upload' : 'md-swap'"
        ) {{ $lang('发布到线上') }}
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      status: this.$route.query.status,
      isinit: false,
      loading: false,
      pageLoading: false,
      options: {
        primary: '主要配色',
        secondary: '次要配色',
        error: '错误、异常',
        success: '成功、完成',
        down: '跌信息',
        up: '涨信息',
      },
      desc: {
        main: '主色',
        light: '浅色',
        dark: '深色',
        contrastText: '填充文本色',
      },
      data: [],
    }
  },
  computed: {
    ...mapState(['apiDomain', 'isRead']),
  },
  methods: {
    objectStyle(color, key) {
      let s = { color: color }
      if (color > '#DDD' && key === 'contrastText') {
        s.background = '#000'
      }
      return s
    },

    resetTheme(item, type) {
      if (item.useModule == 1) {
        Object.assign(item.content, this.defaultTheme(type))
      }
      //  else {
      // }
    },

    defaultTheme(color) {
      if (color == 'green') {
        return {
          primary: {
            main: '#00C499',
            light: '#4AD6AE',
            dark: '#008F70',
            contrastText: '#fff',
          },
          secondary: {
            main: '#FFB600',
            light: '#FFCF00',
            dark: '#D78201',
            contrastText: '#000',
          },
          error: {
            main: '#EC4D5C',
            light: '#EE5F6C',
            dark: '#AC3843',
            contrastText: '#fff',
          },
          success: {
            main: '#00C499',
            light: '#4AD6AE',
            dark: '#008F70',
            contrastText: '#fff',
          },
          down: {
            main: '#EC4D5C',
            light: '#EE5F6C',
            dark: '#AC3843',
            contrastText: '#fff',
          },
          up: {
            main: '#00C499',
            light: '#4AD6AE',
            dark: '#008F70',
            contrastText: '#fff',
          },
        }
      } else if (color === 'yellow') {
        return {
          primary: {
            main: '#FFC300',
            light: '#FFD14B',
            dark: '#EE9900',
            contrastText: '#000000',
          },
          secondary: {
            main: '#FF922E',
            light: '#FFD14B',
            dark: '#C67100',
            contrastText: '#000',
          },
          error: {
            main: '#EC4D5C',
            light: '#EE5F6C',
            dark: '#D44553',
            contrastText: '#fff',
          },
          success: {
            main: '#6BB96D',
            light: '#7AC07C',
            dark: '#60A762',
            contrastText: '#fff',
          },
          down: {
            main: '#EC4D5C',
            light: '#EE5F6C',
            dark: '#D44553',
            contrastText: '#fff',
          },
          up: {
            main: '#6BB96D',
            light: '#7AC07C',
            dark: '#60A762',
            contrastText: '#fff',
          },
        }
      } else if (color === 'purple') {
        return {
          primary: {
            main: '#6C5FC6',
            light: '#A093FF',
            dark: '#3B3566',
            contrastText: '#FFFFFF',
          },
          secondary: {
            main: '#4AD6AE',
            light: '#8DEBD2',
            dark: '#55AB94',
            contrastText: '#000',
          },
          error: {
            main: '#EC4D5C',
            light: '#EE5F6C',
            dark: '#D44553',
            contrastText: '#fff',
          },
          success: {
            main: '#4AD6AE',
            light: '#8DEBD2',
            dark: '#55AB94',
            contrastText: '#fff',
          },
          down: {
            main: '#EC4D5C',
            light: '#EE5F6C',
            dark: '#D44553',
            contrastText: '#fff',
          },
          up: {
            main: '#4AD6AE',
            light: '#8DEBD2',
            dark: '#55AB94',
            contrastText: '#fff',
          },
        }
      } else {
        return {
          primary: {
            main: '#3375E0',
            light: '#4299FF',
            dark: '#1F5DC1',
            contrastText: '#fff',
          },
          secondary: {
            main: '#FFC000',
            light: '#FFF04E',
            dark: '#F69400',
            contrastText: '#000',
          },
          error: {
            main: '#ED3756',
            light: '#FF695E',
            dark: '#99000D',
            contrastText: '#fff',
          },
          success: {
            main: '#05AD83',
            light: '#6df18e',
            dark: '#34a04f',
            contrastText: '#fff',
          },
          down: {
            main: '#ED3756',
            light: '#FF695E',
            dark: '#99000D',
            contrastText: '#fff',
          },
          up: {
            main: '#05AD83',
            light: '#6df18e',
            dark: '#34a04f',
            contrastText: '#fff',
          },
        }
      }
    },

    defaultKlineTheme(type) {
      let theme = {
        dark: {
          black: '#000000',
          white: '#FFFFFF',
          line: '#111217',
          shadowColor: [
            'rgba(36, 43, 50, 0.2)',
            'rgba(84, 184, 131, 0.3)',
            'rgba(237, 55, 86, 0.3)',
          ],
          switchBg: 'rgba(176, 191, 219, 0.3)',
          grey: {
            '900': '#0A1825',
            '800': '#0E1D2C',
            '700': '#202F44',
            '500': '#475563',
            '300': '#6E8196',
            '200': '#B0BFDB',
            '100': '#E5EDFE',
            '50': '#F4F7FF',
          },
        },
        light: {
          black: '#000000',
          white: '#202F44',
          line: '#E5EDFE',
          shadowColor: [
            'rgba(36, 43, 50, 0.2)',
            'rgba(84, 184, 131, 0.3)',
            'rgba(237, 55, 86, 0.3)',
          ],
          switchBg: 'rgba(176, 191, 219, 0.3)',
          grey: {
            '900': '#F4F7FF',
            '800': '#FFFFFF',
            '700': '#E5EDFE',
            '500': '#B0BFDB',
            '300': '#6E8196',
            '200': '#475563',
            '100': '#202F44',
            '50': '#0A1825',
          },
        },
      }

      return theme[type == 'dark' ? 'dark' : 'light']
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
            _json.content = JSON.stringify(_el.content)
            arr.push(_json)
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

    loadConfig(status) {
      this.status = status
      this.isinit = true
      this.pageLoading = true
      this.$axios
        .post('/api/v1/broker/index_customer_config/query', { status })
        .then((result) => {
          if (result.code == 0) {
            this.pageLoading = false

            let data = [
              {
                moduleName: 'mainColorTheme',
                open: true, //是否打开
                status: 1, //1-直接保存 0-预览
                contentlist: [
                  {
                    enable: true,
                    tabName: '',
                    type: 1, //1-light 2-dark
                    platform: [1], // 1 - pc , 2-h5, 3-app,
                    useModule: 1, // 1 主站, 2-交易页
                    content: this.defaultTheme(),
                  },
                  // ,
                  // {
                  //   enable: true,
                  //   tabName: "",
                  //   type: 2, //1-light 2-dark
                  //   platform: [1,2], // 1 - pc , 2-h5, 3-app,
                  //   useModule: 2, // 1 主站, 2-交易页
                  //   content: this.defaultKlineTheme("dark")
                  // },
                  // {
                  //   enable: true,
                  //   tabName: "",
                  //   type: 1, //1-light 2-dark
                  //   platform: [1,2], // 1 - pc , 2-h5, 3-app,
                  //   useModule: 2, // 1 主站, 2-交易页
                  //   content: this.defaultKlineTheme("light")
                  // }
                ],
              },
            ]

            result.data.items.forEach((online) => {
              data.forEach((local) => {
                if (online.moduleName == local.moduleName) {
                  //同步列表
                  online.contentlist &&
                    online.contentlist.forEach((onlineEl, index) => {
                      local.contentlist &&
                        local.contentlist.forEach((localEl, _index) => {
                          if (index === _index) {
                            localEl.platform = onlineEl.platform
                            localEl.useModule = onlineEl.useModule
                            localEl.enable = true
                            Object.assign(
                              localEl.content,
                              JSON.parse(onlineEl.content)
                            )
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
  },
  created() {
    if (this.status == 1 || this.status == 0) {
      this.loadConfig(this.status)
    }
  },
}
</script>
