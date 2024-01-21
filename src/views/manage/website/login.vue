<style lang="less" scoped>
.thumb {
  width: 300px;
  height: 220px;
  position: relative;
  overflow: hidden;
  background: linear-gradient(-180deg, #272d42, #445078);
  background-size: cover;
  .login {
    margin: 15% auto;
    padding: 5px;
    width: 70%;
    background: url('~/assets/register.png') right center no-repeat;
    background-size: auto 100%;
    img {
      display: block;
    }
  }
}
</style>
<template lang="pug">
div

  Alert
    | {{$lang('邀请注册')}} ：{{$lang('开启邀请注册后，必须使用邀请码用户才可以注册')}}。
    iSwitch(size="small" v-model="checkInviteCode" @on-change="editCheckInviteCode" :loading="sloading" :disabled="isRead")
    | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    Button(to="https://xxxxx.zendesk.com/hc/zh-cn/articles/360039935113" type="success" target="_blank" size="small") {{$lang('自定义渠道使用说明')}}

  Card(dis-hover v-for="item,index in data" style="margin-top:15px" :key="index")
    Button(size="small" v-if="item.system" slot="extra" type="primary" @click="newOne(false)" icon="md-add-circle" ghost) {{$lang("新建")}}
    Button(size="small" v-else slot="extra" type="error" @click="remove(index)") {{$lang("删除")}}
    p(slot="title" v-if="item.system") {{$lang('系统方案')}}
    Input(slot="title" v-else v-model="item.source"  style="width:200px" :placeholder="$lang('推广定制参数')")
    Row(:gutter="20")
      Col(span="12")
        Form(:label-width="120")
          FormItem(:label="$lang('注册')")
            .thumb(ref="thumb" :style="regWrapStyle(item)")
              .login(:style="regStyle(item)")
                img(:src="thumb" :width="item.regPage.type==1?'100%':'43%'")
          FormItem(:label="$lang('推广链接')" v-if="!item.system")
            .ivu-input-wrapper.ivu-input-wrapper-default.ivu-input-type
              input.ivu-input.ivu-input-default.ivu-input-with-suffix(:id="'reg'+index" :value="copyText(item,'register')" readonly)
              span.ivu-input-suffix
                Icon.copy(type="ios-copy" :data-clipboard-target="'#reg' + index")
          FormItem(:label="$lang('全屏背景')")
            Input( v-model='item.regPage.wrapBackground', :placeholder="$lang('建议图片尺寸：1024*768')")
              Upload(slot="suffix" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:index + '.regPage.wrapBackground'}")
                Icon(type="md-cloud-upload" v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading" v-show="uploading")
          FormItem(:label="$lang('类型')")
            RadioGroup(v-model="item.regPage.type" )
              Radio(:label="2") {{$lang('复式')}}
              Radio(:label="1") {{$lang('简单')}}
          FormItem(:label="$lang('模块背景')" v-if="item.regPage.type==2")
            Input( v-model='item.regPage.layoutBackground', :placeholder="$lang('建议图片尺寸：640*710')")
              Upload(slot="suffix" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:index+'.regPage.layoutBackground'}")
                Icon(type="md-cloud-upload" v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading" v-show="uploading")
      Col(span="12")
        Form(:label-width="120")
          FormItem(:label="$lang('登录')")
            .thumb(ref="thumb" :style="loginWrapStyle(item)")
              .login(:style="loginStyle(item)")
                img(:src="thumb" width="100%")
          FormItem(:label="$lang('推广链接')" v-if="!item.system")
            .ivu-input-wrapper.ivu-input-wrapper-default.ivu-input-type
              input.ivu-input.ivu-input-default.ivu-input-with-suffix(:id="'login'+index" :value="copyText(item,'login')" readonly)
              span.ivu-input-suffix
                Icon.copy(type="ios-copy" :data-clipboard-target="'#login' + index")
          FormItem(:label="$lang('全屏背景')")
            Input( v-model='item.loginPage.wrapBackground', :placeholder="$lang('建议图片尺寸：1024*768')")
              Upload(slot="suffix" action="/api/v1/storage/file/image", name="uploadFile", :beforeUpload="beforeUpload", :on-success="uploadSuccess", :show-upload-list="false", :data="{echoStr:index + '.loginPage.wrapBackground'}")
                Icon(type="md-cloud-upload" v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading" v-show="uploading")
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" type="primary" long v-else) {{$lang('保存')}}
</template>
<script>
import { mapState } from 'vuex'
import thumb from '@/assets/login.png'
import ClipboardJS from 'clipboard'
export default {
  computed: {
    ...mapState(['lang', 'apiDomain', 'isRead']),
  },
  data() {
    return {
      pageLoading: false,
      thumb,
      loading: false,
      sloading: false,
      uploading: false,
      checkInviteCode: false,
      data: [],
    }
  },
  methods: {
    copyText(item, type) {
      let apiDomain = /^\./.test(this.apiDomain)
        ? this.apiDomain
        : `.${this.apiDomain}`
      return `https://www${apiDomain}/${type}?source=${item.source}`
    },
    regWrapStyle(item) {
      let style = {}
      if (item.regPage.wrapBackground) {
        style.backgroundImage = 'url(' + item.regPage.wrapBackground + ')'
      }
      return style
    },
    regStyle(item) {
      let style = {}
      if (item.regPage.type == 1) {
        style.width = '30%'
        style.background = 'rgba(0, 0, 0,.7)'
      } else {
        if (item.regPage.wrapBackground) {
          style.backgroundColor = 'rgba(0, 0, 0,.7)'
        }
        if (item.regPage.layoutBackground) {
          style.backgroundImage = 'url(' + item.regPage.layoutBackground + ')'
        }
      }
      return style
    },
    loginWrapStyle(item) {
      let style = {}
      if (item.loginPage.wrapBackground) {
        style.backgroundImage = 'url(' + item.loginPage.wrapBackground + ')'
      }
      return style
    },
    loginStyle(item) {
      let style = {
        width: '30%',
      }
      if (item.loginPage.wrapBackground) {
        style.background = 'rgba(0, 0, 0,.7)'
      } else {
        style.background = '#333c5a'
      }
      return style
    },
    uploadSuccess(result) {
      this.uploading = false
      if (result.code != 0) {
        return
      }
      this.$Notice.success({
        title: this.$lang('成功'),
      })
      let key = result.data.echoStr.split('.')
      this.data[key[0]][key[1]][key[2]] = result.data.url
    },
    beforeUpload() {
      this.uploading = true
    },

    getLoginReg() {
      return this.$axios.get('/api/v1/broker/config/common_config/get', {
        params: {
          key: 'loginReg',
        },
      })
    },

    getCheckInviteCode() {
      return this.$axios.get('/api/v1/broker/config/common_config/get', {
        params: {
          key: 'checkInviteCode',
        },
      })
    },

    load() {
      this.pageLoading = true
      this.$axios
        .all([this.getLoginReg(), this.getCheckInviteCode()])
        .then((result) => {
          this.pageLoading = false
          let [res1, res2] = result
          if (res1.code == 0) {
            if (res1.data.value) {
              this.data = JSON.parse(res1.data.value)
            } else {
              this.newOne(true)
            }
          }

          if (res2.code == 0) {
            this.checkInviteCode = res2.data.value == 'true' ? true : false
          }
        })
    },
    submit() {
      this.loading = true
      this.$axios
        .post('/api/v1/broker/config/common_config/set', {
          desc: '登录注册设置',
          key: 'loginReg',
          value: JSON.stringify(this.data),
        })
        .then((result) => {
          if (result.code == 0) {
            location.reload()
          }
          this.loading = false
        })
    },
    editCheckInviteCode() {
      this.sloading = true
      this.$axios
        .post('/api/v1/broker/config/common_config/set', {
          desc: '邀请注册',
          key: 'checkInviteCode',
          value: this.checkInviteCode,
        })
        .then((result) => {
          if (result.code != 0) {
            this.checkInviteCode = !this.checkInviteCode
          }
          this.sloading = false
        })
    },
    remove(index) {
      this.data = this.data.filter((el, _index) => {
        return index !== _index
      })
    },
    newOne(system) {
      this.data.push({
        source: system ? 'default' : '',
        system: system,
        regPage: {
          type: 2,
          wrapBackground: '',
          layoutBackground: '',
        },
        loginPage: {
          wrapBackground: '',
        },
      })
    },
  },
  created() {
    this.load()
  },
  mounted() {
    let clipboard = new ClipboardJS('.copy')
    clipboard.on('success', () => {
      this.$Message.success(this.$lang('已复制'))
    })
  },
}
</script>
