<style lang="less" scoped>
.success {
  text-align: center;
  dt {
    height: 80px;
    color: #66bb6a;
  }
}
</style>
<template lang="pug">
.page-login(:style="{backgroundImage:`url(${background})`}")
  Dropdown.locale(trigger="click") 
    a(href="javascript:void(0)") {{lang[$i18n.locale]}}
      Icon(type="ios-arrow-down")
    DropdownMenu(slot="list")
      DropdownItem(@click.native="setLocale(key)" v-for="(item,key) in lang" :key="item") {{item}}
  .loginBox(v-if="step==1" key="first")
    .logo
      img(:src="logo")
    .text {{$lang('找回密码')}}
    Form(ref="stepOne", :model="formItem", :rules="stepOneValidate")
      FormItem(prop="email")
        Input(size="large" @on-enter="verifyEmail" v-model="formItem.email" prefix="md-person" , :placeholder="$lang('账号')")
      FormItem(prop="captcha")
        Input(size="large" @on-enter="verifyEmail" v-model="formItem.captcha" type="text" prefix="md-lock", :placeholder="$lang('验证码')", :maxlength="6")
          span(slot="append" v-if="time") {{time}}s
          a(slot="append" v-else @click="getCode") {{$lang("获取验证码")}}
      Button(type="primary" @click="verifyEmail" long icon="ios-fastforward", :loading="loading" size="large") {{$lang('下一步')}}
  .loginBox(v-if="step==2" key="second")
    .logo.logo2
      img(:src="logo")
      .text {{$lang('设置密码')}}
    Form(ref="stepTwo", :model="formItem", :rules="stepTwoValidate")
      FormItem(:label="$lang('新密码')" prop="password")
        Input(@on-enter="submit" v-model="formItem.password", type="password" :placeholder="$lang('新密码')")
      FormItem(:label="$lang('确认密码')" prop="repassword")
        Input(@on-enter="submit" v-model="formItem.repassword", type="password" :placeholder="$lang('确认密码')")
      FormItem
        Button(type="primary" @click="submit" long ghost :loading="loading") {{$lang('确定')}}

  .loginBox(v-if="step==3" key="three")
    .logo.logo2
      img(:src="logo")
      .text {{$lang('成功')}}
    dl.success
      dt
        Icon(type="md-checkmark-circle" size="40")
      dd
        Button(to="/login" type="primary" long ghost) {{$lang('登录')}}
    
  SenseComp(v-if="captchaType == captchaTypes.sense", ref="captchaRef", @success="post", @error="onCaptchaError")
  RecaptchaComp(v-if="captchaType == captchaTypes.google", ref="captchaRef", @success="post", @error="onCaptchaError")
 
</template>
<script>
import md5 from 'md5'
import { mapState, mapActions } from 'vuex'
import v from '@/libs/validator'
import SenseComp from '@/components/common/senseRecaptchaComp'
import RecaptchaComp from '@/components/common/recaptchaComp'
import { senseId, captchaType, captchaTypes } from '@/libs/consts.js'

export default {
  components: {
    SenseComp,
    RecaptchaComp,
  },
  data() {
    return {
      captchaType,
      captchaTypes,
      step: 1,
      loading: false,
      time: 0,
      formItem: {
        email: '',
        captcha: '',
        password: '',
        repassword: '',
        resetPwToken: '',
        captchaId: senseId,
        captchaResponse: '',
      },
      stepOneValidate: {
        email: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('账号')))
              } else if (!v.isEmail(value)) {
                callback(new Error(this.$lang('账号是登录时的邮箱')))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
        captcha: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('验证码')))
              } else if (!/^\d{6}$/.test(value)) {
                callback(new Error(this.$lang('验证码是6位数字')))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      },
      stepTwoValidate: {
        password: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('新密码')))
              } else if (
                value.length < 8 ||
                value.length > 20 ||
                !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)
              ) {
                callback(
                  new Error(
                    this.$lang('密码8-20位字符，必须包含大小写字母和数字')
                  )
                )
              } else {
                if (this.formItem.repassword !== '') {
                  this.$refs.stepTwo.validateField('repassword')
                }
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
        repassword: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('确认密码')))
              } else if (value != this.formItem.password) {
                callback(new Error(this.$lang('两次密码输入不一致')))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    ...mapState(['lang', 'logo', 'background']),
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--
        }, 1000)
      }
    },
  },
  methods: {
    ...mapActions(['setLocale']),
    getCode() {
      if (!v.isEmail(this.formItem.email)) {
        return this.$refs.stepOne.validateField('email')
      }
      this.$refs.captchaRef.execute()
    },
    post(response) {
      const params = Object.assign({}, this.formItem, response)
      this.$axios
        .post('/api/v1/user/reset_password/email_captcha', params)
        .then(
          (result) => {
            if (result.code == 0) {
              this.time = 60
            } else {
              this.$refs.captchaRef.reset()
            }
          },
          () => {
            this.$refs.captchaRef.reset()
          }
        )
    },
    verifyEmail() {
      this.$refs['stepOne'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.$axios
            .post(
              '/api/v1/user/reset_password/verify_email_captcha',
              this.formItem
            )
            .then((result) => {
              this.loading = false
              if (result.code === 0) {
                this.formItem.resetPwToken = result.data
                this.step = 2
              }
            })
        }
      })
    },
    submit() {
      this.$refs['stepTwo'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.$axios
            .post('/api/v1/user/reset_password', {
              email: this.formItem.email,
              resetPwToken: this.formItem.resetPwToken,
              password: md5(this.formItem.password),
            })
            .then((result) => {
              this.loading = false
              if (result.code === 0) {
                this.$Message.success(this.$lang('成功'))
                this.step = 3
              }
            })
        }
      })
    },
    onCaptchaError() {
      this.$refs.captchaRef.reset()
    },
  },
}
</script>
