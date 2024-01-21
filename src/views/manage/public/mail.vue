<template lang="pug">
div
  Alert
    Checkbox(v-for="item in list", v-model="item.enabled", :key="item.language") {{lang[item.language]}}
  Card(:title="lang[item.language]" v-for="item,index in list" :key="'c'+item.language"  dis-hover style="margin-top:15px" v-if="item.enabled")
    Row(:gutter="20")
      Col(span="12")
        Input(v-model="item.emailTemplate" type="textarea" :rows="18")
        Alert 
          | 1.
          strong #content# 
          | {{$lang("模板主体内容站位符不能删除")}}<br><br>
          | 2.{{$lang("模板中禁止使用超链接")}}

      Col(span="12")
        table(v-if="item.emailTemplate" style="border:0;border-spacing:0;border-collapse:collaps;" width="100%")
          tr
            td(v-html="formatHtml(item.emailTemplate)")
        template(v-else)
          Button(@click="defaultTemplate(item)") {{$lang("使用推荐模板")}}
          
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="saveData", :loading="loading" :disabled="loading" type="primary" long v-else) {{$lang('保存')}}
</template>
<script>
  import { mapState } from 'vuex';
  import { initData } from '@/libs/common.js';
  export default {
    data() {
      return {
        template: '',
        enTemplate: '',
        editorOption: {},
        pageLoading: false,
        loading: false,
        uploading: false,
        list: [],
      };
    },
    computed: {
      ...mapState(['lang', 'brokerName', 'isRead', 'isRoot', 'logo']),
    },
    methods: {
      defaultTemplate(item) {
        return (item.emailTemplate =
          item.language === 'zh-cn' ? this.template : this.enTemplate);
      },
      formatHtml(str) {
        return str.replace(
          '#content#',
          `<table style="border:0;margin:0 auto;border-spacing:0;border-collapse:collapse;font-size:14px;line-height:20px;" width="100%">
            <tr>
                <td style="font-weight:700;">#content#</td>
            </tr>
        </table>`
        );
      },
      loadData() {
        this.pageLoading = true;
        this.$axios
          .post('/api/v1/broker/get_email_template', {})
          .then((result) => {
            this.pageLoading = false;
            if (
              result.code == 0 &&
              result.data.list &&
              result.data.list.length
            ) {
              result.data.list.forEach((el) => {
                this.list.forEach((_el) => {
                  if (el.language == _el.language) {
                    Object.assign(_el, el);
                  }
                });
              });
            }
          });
      },

      saveData() {
        let canSubmit = true;

        this.list
          .filter((el) => el.enabled)
          .forEach((el) => {
            if (el.emailTemplate.indexOf('#content#') === -1) {
              this.$Message.error({
                content: [
                  this.lang[el.language],
                  this.$lang('模板主体内容站位符不能删除'),
                ].join(' : '),
                duration: 4,
              });
              this.canSubmit = false;
            }

            if (el.emailTemplate.indexOf('<a') > -1 && !this.isRoot) {
              this.$Message.error({
                content: [
                  this.lang[el.language],
                  this.$lang('模板中禁止使用超链接'),
                ].join(' : '),
                duration: 4,
              });
              this.canSubmit = false;
            }
          });
        if (canSubmit) {
          this.loading = true;
          this.$axios
            .post('/api/v1/broker/edit_email_template', {
              list: this.list,
            })
            .then((result) => {
              this.loading = false;
              if (result.code == 0) {
                this.$Notice.success({
                  title: this.$lang('操作成功'),
                });
              }
            });
        }
      },
    },
    created() {
      if (!this.isRoot) {
        location.href = '/404';
      }
      this.list = initData(this.lang, JSON.stringify({ emailTemplate: '' }));
      this.loadData();

      this.template = `<table style="border:0;margin:0 auto;border-spacing:0;border-collapse:collaps;color:#50555B;" width="100%" align="center">
        <tr style="margin:0;">
            <td class="main-table-2" align="center" style="background:#E0E0E0;padding:40px">
                <table style="border:0;margin:0 auto;border-spacing:0;border-collapse:collapse;width:600px;background:#fff;">
                    <tr>
                        <td style="margin:0;background:linear-gradient(90deg, #3375E0 0%, #4299FF 100%);background-color:#3375E0;padding:10px 20px;">
                            <img src="${this.logo}" style="max-height:44px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="margin:0;padding:32px 24px;">
                            #content#
                        </td>
                    </tr>
                    <tr>
                        <td style="margin:0;padding:10px 24px 20px;font-size:12px;line-height:20px;" colspan="2">风险提示：<br>为了防止钓鱼、诈骗等非法行为，请勿向任何人提供验证码、账号、密码等重要的个人信息。
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size:14px;line-height:24px;margin:0;padding:48px 24px;">感谢您选择${this.brokerName}！</td>
                    </tr>
                    <tr>
                        <td style="margin:0;background-color:#3375E0;height:6px;"></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>`;

      this.enTemplate = `<table style="border:0;margin:0 auto;border-spacing:0;border-collapse:collaps;color:#50555B;" width="100%" align="center">
        <tr style="margin:0;">
            <td class="main-table-2" align="center" style="background:#E0E0E0;padding:40px">
                <table style="border:0;margin:0 auto;border-spacing:0;border-collapse:collapse;width:600px;background:#fff;">
                    <tr>
                        <td style="margin:0;background:linear-gradient(90deg, #3375E0 0%, #4299FF 100%);background-color:#3375E0;padding:10px 20px;">
                            <img src="${this.logo}" style="max-height:44px;">
                        </td>
                    </tr>
                    <tr>
                        <td style="margin:0;padding:32px 24px;">
                            #content#
                        </td>
                    </tr>
                    <tr>
                        <td style="margin:0;padding:10px 24px 20px;font-size:12px;line-height:20px;" colspan="2">Risk Disclaimer:<br>To avoid Phishing, fraud and other illegal actions, please do not disclose your verification code, account or password to others.
                        </td>
                    </tr>
                    <tr>
                        <td style="font-size:14px;line-height:24px;margin:0;padding:48px 24px;">Enjoy trading with ${this.brokerName}！</td>
                    </tr>
                    <tr>
                        <td style="margin:0;background-color:#3375E0;height:6px;"></td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>`;
    },
  };
</script>
