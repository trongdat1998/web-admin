<style lang="less" scoped>
.view {
  background: #f8f8f8;
  padding: 8px;
  overflow: hidden;
  max-width: 250px;
  margin: 0 auto;
  span,
  dl {
    float: left;
    width: 25%;
    text-align: center;
    height: 70px;
    dt {
      overflow: hidden;
      background: #ccc;
      height: 50px;
      max-width: 50px;
      margin: 0 auto;
    }
    dd {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  span,
  img {
    width: 100%;
  }
}
.draggable,
.button {
  width: 25%;
  float: left;
  border: 5px solid #fff;
  overflow: hidden;
  position: relative;
}
</style>
<template lang="pug">
div
  Card(dis-hover style="margin-top:15px")
    Button(size="small" slot="extra" to="https://xxxxx.zendesk.com/hc/zh-cn/articles/360038526713" type="error" target="_blank") {{$lang('配置说明，必读')}}
    p(slot="title") {{$lang('宫格配置')}} &nbsp; &nbsp; &nbsp;
      Checkbox(v-model="pro") {{$lang('专业版')}}
    Alert
      Checkbox(v-for="item in modules", v-model="item.enable", :key="item.locale") {{lang[item.language]}}
    template(v-for="item,index in modules" v-if="item.enable")
      Divider {{lang[item.language]}}
        template(v-if="index==0") （{{$lang('默认')}}）
        a(href="javascript:;" @click="useDefault(index)" v-else) （{{$lang('使用默认')}}）
      Row(:gutter="20")
        Col(span="24")
          draggable.move(v-model="item.items" draggable=".draggable" style="overflow:hidden")
            .draggable(:key="`${index}-${_index}`" v-for="_item,_index in item.items" style="margin-bottom:15px;")
              List(border size="small")
                template(v-if="pro")
                  ListItem
                    RadioGroup(v-model="_item.loginShow" type="button" size="small")
                      Radio(:label="0") {{$lang("不区分")}}
                      Radio(:label="1") {{$lang("登录后")}}
                      Radio(:label="2") {{$lang("登录前")}}
                  ListItem
                    Input(v-model="_item.lightDefaultIcon", :placeholder="$lang('小于50kb 120*120 png图片')" :disabled="uploading")
                      span(slot="prepend")
                        img(:src="_item.lightDefaultIcon" v-if="_item.lightDefaultIcon" height="20" style="background:#fff;vertical-align:middle;margin:0 5px 0 0")
                        | {{$lang('亮')}}
                      Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.' + _index +'.'+ 'lightDefaultIcon'}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                        Icon(type="md-cloud-upload" v-show="!uploading")
                        Icon.spin-icon-load(type="ios-loading" v-show="uploading")
                  ListItem
                    Input(v-model="_item.darkDefaultIcon", :placeholder="$lang('小于50kb 120*120 png图片')" :disabled="uploading")
                      span(slot="prepend")
                        img(:src="_item.darkDefaultIcon" v-if="_item.darkDefaultIcon" height="20" style="background:#000;vertical-align:middle;margin:0 5px 0 0")
                        | {{$lang('暗')}}
                      Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.' + _index +'.'+ 'darkDefaultIcon'}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                        Icon(type="md-cloud-upload" v-show="!uploading")
                        Icon.spin-icon-load(type="ios-loading" v-show="uploading")
                ListItem(v-else)
                  Input(v-model="_item.darkDefaultIcon", :placeholder="$lang('小于50kb 120*120 png图片')" :disabled="uploading")
                    span(slot="prepend") 
                      img(:src="_item.darkDefaultIcon" v-if="_item.darkDefaultIcon" height="20" style="background:#fff;vertical-align:middle;margin:0 5px 0 0")
                      | {{$lang('亮')}}/{{$lang('暗')}}
                    Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.' + _index +'.'+ 'darkDefaultIcon.lightDefaultIcon'}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                      Icon(type="md-cloud-upload" v-show="!uploading")
                      Icon.spin-icon-load(type="ios-loading" v-show="uploading")
                ListItem(:key="`a${index}-${_index}`")
                  Input(v-model="_item.moduleName", :placeholder="$lang('名称')" )
                ListItem(:key="`b${index}-${_index}`")
                  Input(v-model="_item.jumpUrl", :placeholder="$lang('链接')" )
                ListItem(:key="`c${index}-${_index}`")
                  RadioGroup(v-model="_item.jumpType" size="small")
                    Radio(:label="0") {{$lang("APP链接")}}
                    Radio(:label="1") {{$lang("https链接")}}
                  Icon.hand(@click.native="remove(item.items,index,_index)" type="md-trash" style="color:#ed4014" :title="$lang('删除')")
            .button(v-if="item.items.length<50")
              Button(@click="newOne(index)" long type="primary" icon="md-add-circle" ghost) {{$lang("新建")}}
        Col(span="12" v-if="item.items.length")
          Divider {{$lang('登录前')}}
          .view
            dl(v-for="_item,_index in item.items" v-if="_item.loginShow==0||_item.loginShow==2")
              dt
                img(:src="_item.lightDefaultIcon" v-if="_item.lightDefaultIcon")
                span(shape="square" icon="ios-person" v-else)
              dd(v-if="_item.moduleName") {{_item.moduleName}}
          .view(style="background:#000")
            dl(v-for="_item,_index in item.items" v-if="_item.loginShow==0||_item.loginShow==2")
              dt
                img(:src="_item.darkDefaultIcon" v-if="_item.darkDefaultIcon")
                span(shape="square" icon="ios-person" v-else)
              dd(v-if="_item.moduleName" style="color:#fff") {{_item.moduleName}}
        Col(span="12" v-if="item.items.length")
          Divider {{$lang('登录后')}}
          .view
            dl(v-for="_item,_index in item.items" v-if="_item.loginShow==0||_item.loginShow==1")
              dt
                img(:src="_item.lightDefaultIcon" v-if="_item.lightDefaultIcon")
                span(shape="square" icon="ios-person" v-else)
              dd(v-if="_item.moduleName") {{_item.moduleName}}
          .view(style="background:#000")
            dl(v-for="_item,_index in item.items" v-if="_item.loginShow==0||_item.loginShow==1")
              dt
                img(:src="_item.darkDefaultIcon" v-if="_item.darkDefaultIcon")
                span(shape="square" icon="ios-person" v-else)
              dd(v-if="_item.moduleName" style="color:#fff") {{_item.moduleName}}
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" type="primary" long v-else) {{$lang('保存')}}
</template>
<script>
import { mapState } from 'vuex'
import draggable from 'vuedraggable'

export default {
  components: {
    draggable,
  },
  computed: {
    ...mapState(['lang', 'isRead']),
  },
  data() {
    return {
      pro: false,
      uploading: false,
      pageLoading: false,
      loading: false,
      modules: [],
    }
  },
  methods: {
    useDefault(index) {
      this.modules[index].items.length = 0
      this.modules[0].items.forEach((el) => {
        this.modules[index].items.push(Object.assign({}, el))
      })
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
    submit() {
      let json = {
        moduleType: 1,
        modules: this.modules.filter((el) => {
          if (el.enable) {
            return el
          }
        }),
      }
      this.$axios
        .post('/api/v1/broker/config/edit_app_index__module', json)
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            location.reload()
          }
        })
    },
    uploadSuccess(result) {
      this.uploading = false
      if (result.code != 0) {
        return
      }
      let tmp = result.data.echoStr.split('.')

      if (tmp.length == 3) {
        this.modules[tmp[0]].items[tmp[1]][tmp[2]] = result.data.url
      }

      if (tmp.length == 4) {
        this.modules[tmp[0]].items[tmp[1]][tmp[2]] = result.data.url
        this.modules[tmp[0]].items[tmp[1]][tmp[3]] = result.data.url
      }
      this.$Notice.success({
        title: this.$lang('成功'),
      })
    },
    beforeUpload() {
      this.uploading = true
    },
    newOne(index) {
      this.modules[index].items.push({
        moduleName: '',
        jumpType: 0, //0-native  1-h5跳转
        jumpUrl: '',
        loginShow: 0, //0-不区分都可展示、1-登录时展示、2-未登录时展示,
        darkDdefaultIcon: '',
        lightDefaultIcon: '',
      })
    },
    remove(arr, index, _index) {
      this.modules[index]['items'] = arr.filter((el, i) => _index != i)
    },
  },
  created() {
    this.pageLoading = true
    this.$axios
      .post('/api/v1/broker/config/app_index_modules?moduleType=1')
      .then((result) => {
        this.pageLoading = false

        if (result.code == 0) {
          Object.keys(this.lang).forEach((lang, index) => {
            let tmp = (result.data ? result.data.modules : []).filter(
              (el) => lang == el.language
            )
            if (tmp.length) {
              tmp[0].enable = true
              this.modules.push(tmp[0])
            } else {
              this.modules.push({
                language: lang,
                enable: index == 0,
                items: [],
              })
            }
          })
        }
      })
  },
}
</script>
