<template lang="pug">
Modal(v-model="visible", width="400", footer-hide)
  p(style="padding-bottom: 30px; font-size: 18px; font-weight: 700") {{ $lang(userInfo.bindGA ? '谷歌验证码' : '手机验证码') }}
  div(v-if="userInfo.bindGA")
    Input(size="large", v-model="code", :maxlength="6")
  div(v-else)
    Row(:gutter="10")
      Col(span="12")
        Input(v-model="code", :maxlength="6", size="large")
      Col(span="12")
        Button(v-if="time", disabled, long, size="large") {{ time }}s
        Button(
          v-else,
          @click="getMoileCode",
          :loading="codeLoading",
          type="primary",
          long,
          size="large",
          ghost
        ) {{ $lang('获取验证码') }}
  Button(
    type="primary",
    long,
    @click="submit",
    :loading="loading",
    style="margin-top: 30px",
    size="large"
  ) {{ $lang('确定') }}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["userInfo", "isRead"]),
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    time() {
      if (this.time>0) {
        setTimeout(() => {
          this.time--;
        }, 1000);
      }else{
        this.time = 0
      }
    },
    value(val) {
      this.visible = val;
      this.code = "";
    },
    visible() {
      this.$emit("input", this.visible);
    },
  },
  data() {
    return {
      time: 0,
      visible: this.value,
      code: "",
      codeLoading: false,
      submitLoading: false,
    };
  },
  methods: {
    getMoileCode() {
      this.codeLoading = true;
      this.$axios
        .post("/api/v1/user/send_a_sms_verify_code?__feedback=1", {})
        .then((result) => {
          this.codeLoading = false;
          if (result.code == 0) {
            this.time = 60;
          }
        });
    },
    submit() {
      if (!/^\d{6}$/.test(this.code)) {
        return this.$Message.error({
          content: this.$lang("验证码不正确"),
          duration: 5,
          background: true,
        });
      }
      this.$emit("submit", {
        verifyCode: this.code,
        authType: this.userInfo.bindGA ? 1 : 2,
      });
      this.time = 0;
    },
  },
};
</script>