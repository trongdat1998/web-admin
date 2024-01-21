<template lang="pug">
div
  Card(dis-hover, :title="$lang('统计代码')")
    Form(:label-width="120")
      Row(:gutter="20")
        Col(span="12")
          FormItem(:label="$lang('百度统计id')")
            Input(
              v-model="analytics.baidu",
              placeholder="e7b0fxxxxxxxxxxxxxxxxxxxxxxc3"
            )
        Col(span="12")
          FormItem(:label="$lang('Google统计id')")
            Input(v-model="analytics.google", placeholder="UA-12XXXXXX1-1")
  Card(dis-hover, style="margin-top:15px", :title="$lang('微信分享专用域名')")
    Input(v-model="bakDomain.domain", :placeholder="$lang('微信分享专用域名')")
    Alert(style="margin-top: 6px;display: block") {{$lang("wechatUrlTip")}}
  Card(dis-hover, style="margin-top:15px", :title="$lang('页尾配置')")
    Form(:label-width="120")
      Row(:gutter="20")
        Col(span="12")
          FormItem(:label="$lang('平台LOGO')")
            Input(v-model="data.logo", :placeholder="$lang('平台LOGO')")
              Upload(
                slot="suffix",
                action="/api/v1/storage/file/image",
                name="uploadFile",
                :on-success="uploadSuccess",
                :beforeUpload="beforeUpload",
                :data="{ echoStr: 'logo' }",
                :show-upload-list="false"
              )
                Icon(type="md-cloud-upload")
            div {{ $lang('建议图片尺寸') }} ：{{ $lang('高度45px，宽度自适应，按比例适配即可') }}
        Col(span="12")
          FormItem(label="favicon")
            Input(v-model="data.favicon", placeholder="favicon")
              Upload(
                slot="suffix",
                action="/api/v1/storage/file/image",
                name="uploadFile",
                :on-success="uploadSuccess",
                :beforeUpload="beforeUpload",
                :data="{ echoStr: 'favicon' }",
                :show-upload-list="false"
              )
                Icon(type="md-cloud-upload")
            div {{ $lang('建议图片尺寸') }} ：32×32px
        Col(span="12")
          FormItem(:label="$lang('Logo跳转URL')")
            Input(v-model="data.logoUrl", placeholder="logoUrl")
        Col(span="12", v-for="(item, key) in list", :key="key")
          FormItem(:label="$lang(item)")
            Input(
              v-model="data[key]",
              :placeholder="key == 'zendesk' ? 'https://static.zdassets.com/ekr/snippet.js?key=xxx' : $lang(item)"
            )
              template
                Upload(
                  slot="suffix",
                  action="/api/v1/storage/file/image",
                  name="uploadFile",
                  :on-success="uploadSuccess",
                  :beforeUpload="beforeUpload",
                  :data="{ echoStr: key }",
                  :show-upload-list="false"
                )
                  Icon(type="md-cloud-upload")
  Divider {{ $lang('补充配置') }}
  Alert
    Checkbox(
      v-for="item in data.localConfigList",
      v-model="item.enable",
      :key="item.locale",
      :true-value="1",
      :false-value="0"
    ) {{ lang[item.locale] }}
  Row(:gutter="20")
    Col(
      span="12",
      v-for="(item, index) in data.localConfigList",
      v-show="item.enable",
      :key="'card' + index",
      style="margin-top:15px"
    )
      Card(dis-hover)
        p(slot="title") {{ lang[item.locale] }}
        Form(:label-width="120")
          FormItem(:label="$lang('浏览器title')")
            Input(
              v-model="item.browserTitle",
              :placeholder="$lang('浏览器title')"
            )
          FormItem(:label="$lang('网站关键字')")
            Input(v-model="item.seoKeywords", :placeholder="$lang('网页关键字')")
          FormItem(:label="$lang('网站描述')")
            Input(v-model="item.seoDescription", :placeholder="$lang('网页描述')")
          FormItem(:label="$lang('用户协议')")
            Input(v-model="item.userAgreement", , :placeholder="$lang('用户协议')")
          FormItem(:label="$lang('隐私协议')")
            Input(
              v-model="item.privacyAgreement",
              :placeholder="$lang('隐私协议')"
            )
  div(style="height:50px")
  Spin(fix, v-show="spinShow")
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
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["lang", "isRead"]),
  },
  data() {
    return {
      pageLoading: false,
      loading: false,
      spinShow: false,
      analytics: {},
      bakDomain: { domain: "" },
      data: {
        localConfigList: [],
        internalHost: "",
        sslCrtFile: "",
        sslKeyFile: "",
        logo: "",
        favicon: "",
        copyright: "",
        zendesk: "",
        facebook: "",
        twitter: "",
        telegram: "",
        reddit: "",
        wechat: "",
        weibo: "",
        medium: "",
        linkedin: "",
        github: "",
        discord: "",
        line: "",
        biyong: "",
        qq: "",
        feixiaohao: "",
        myToken: "",
        coingecko: "",
        coinmarketcap: "",
      },
      list: {
        copyright: "版权说明",
        zendesk: "zendesk",
        facebook: "Facebook",
        twitter: "Twitter",
        telegram: "电报",
        reddit: "reddit",
        wechat: "微信",
        weibo: "微博",
        medium: "medium",
        linkedin: "linkedin",
        github: "github",
        discord: "discord",
        line: "line",
        biyong: "biyong",
        qq: "QQ",
        feixiaohao: "feixiaohao",
        myToken: "myToken",
        coingecko: "coingecko",
        coinmarketcap: "coinmarketcap",
      },
    };
  },
  methods: {
    getAnalytics() {
      return this.$axios.get("/api/v1/broker/config/common_config/get", {
        params: {
          key: "analytics",
        },
      });
    },
    getBakDomain() {
      return this.$axios.get("/api/v1/broker/config/common_config/get", {
        params: {
          key: "bakDomain",
        },
      });
    },
    getConfig() {
      return this.$axios.get("/api/v1/broker/config");
    },
    uploadSuccess(result) {
      this.spinShow = false;
      if (result.code != 0) {
        return;
      }
      this.$Notice.success({
        title: this.$lang("成功"),
      });
      this.data[result.data.echoStr] = result.data.url;
    },
    beforeUpload() {
      this.spinShow = true;
    },
    formatData(localConfigList) {
      localConfigList.forEach((el) => {
        this.concatFirstLevelData(el);
        if (el.featureConfigList && el.featureConfigList.length) {
          el.featureConfigList.forEach((el) => {
            this.concatData(el);
          });
        }
      });
    },
    concatFirstLevelData(data) {
      this.data.localConfigList.forEach((el) => {
        if (el.locale == data.locale) {
          Object.keys(data).forEach((key) => {
            if (key != "featureConfigList") {
              el[key] = data[key];
            }
          });
        }
      });
    },
    concatData(data) {
      this.data.localConfigList.forEach((el) => {
        if (el.locale == data.locale) {
          el.featureConfigList.forEach((el) => {
            if (el.index == data.index) {
              Object.assign(el, data);
            }
          });
        }
      });
    },
    load() {
      this.pageLoading = true;
      this.data.localConfigList = [];

      Object.keys(this.lang).forEach((locale, index) => {
        this.data.localConfigList.push({
          userAgreement: "",
          privacyAgreement: "",
          legalDescription: "",
          helpCenter: "",
          featureTitle: "",
          locale,
          enable: index === 0 ? 1 : 0,
          browserTitle: "",
          seoDescription: "",
          seoKeywords: "",
          featureConfigList: [
            {
              imageUrl: "",
              title: "",
              description: "",
              locale,
              index: 0,
            },
            {
              imageUrl: "",
              title: "",
              description: "",
              locale,
              index: 1,
            },
            {
              imageUrl: "",
              title: "",
              description: "",
              locale,
              index: 2,
            },
            {
              imageUrl: "",
              title: "",
              description: "",
              locale,
              index: 3,
            },
          ],
        });
      });

      this.$axios
        .all([this.getAnalytics(), this.getConfig(), this.getBakDomain()])
        .then((result) => {
          let [res1, res2, res3] = result;
          if (res1.code == 0 && res2.code == 0 && res3.code == 0) {
            this.pageLoading = false;
          }
          if (res1.code == 0) {
            if (res1.data.value) {
              this.analytics = JSON.parse(res1.data.value);
            } else {
              this.analytics = {
                baidu: "",
                google: "",
              };
            }
          }

          if (res2.code == 0) {
            Object.keys(res2.data).forEach((el) => {
              if (el == "localConfigList") {
                if (res2.data[el] && res2.data[el].length) {
                  this.formatData(res2.data[el]);
                }
              } else {
                this.data[el] = res2.data[el];
              }
            });
          }

          if (res3.code == 0) {
            if (res3.data.value) {
              this.bakDomain = JSON.parse(res3.data.value);
            } else {
              this.bakDomain = {
                domain: "",
              };
            }
          }
        });
    },

    setConfig() {
      return this.$axios.post("/api/v1/broker/config/submit", this.data);
    },

    setAnalytics() {
      return this.$axios.post("/api/v1/broker/config/common_config/set", {
        desc: "统计代码",
        key: "analytics",
        value: JSON.stringify(this.analytics),
      });
    },

    setBakDomain() {
      return this.$axios.post("/api/v1/broker/config/common_config/set", {
        desc: "微信分享专用域名",
        key: "bakDomain",
        value: JSON.stringify(this.bakDomain),
      });
    },

    submit() {
      this.$axios
        .all([this.setAnalytics(), this.setConfig(), this.setBakDomain()])
        .then((result) => {
          this.pageLoading = false;
          let [res1, res2, res3] = result;
          if (res1.code == 0 && res2.code == 0 && res3.code == 0) {
            this.loading = false;
            this.$Notice.success({
              title: this.$lang("成功"),
            });
            this.load();
          }
        });
    },
  },
  created() {
    this.load();
  },
};
</script>
