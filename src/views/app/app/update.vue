<template lang="pug">
div
  Card(dis-hover)
    p(slot="title") {{$lang('升级管理')}}
    Form(:label-width="160")
      Row(:gutter="20")
        Col(span="12")
          Card(dis-hover)
            p(slot="title") Android
            Alert(v-if="!pageLoading && !androidVersions.length") {{$lang('没有可用历史数据无需升级')}}
            FormItem(:label="$lang('最新版本号')")
              Input(v-model="androidAppVersion"  readonly)
            FormItem(:label="$lang('升级版本区间')")
              Row
                Col(span="11")
                  Select(v-model="android.minVersion" @on-change="changeVersion('android')")
                    Option(v-for="item,index in androidVersions" :value="item" :key="'android' + item + index") {{item}}
                Col(span="2" style="textAlign:center") -
                Col(span="11")
                  Select(v-model="android.maxVersion")
                    Option(v-for="item,index in androidVersions" :value="item" :disabled="item<android.minVersion" :key="'android2' + item + index") {{item}}
            FormItem(:label="$lang('升级版本号')" v-if="versions('android').length")
              Tag(v-for="item,index in versions('android')" color="success"  :key="'androidTag' + item + index") {{item}}
            FormItem(:label="$lang('选择升级渠道')")
              CheckboxGroup( v-model="androidAppChannel")
                Checkbox(label="official") {{$lang('官方渠道')}}
                Checkbox(label="googleplay") {{$lang('Google Play渠道')}}
            FormItem(:label="$lang('升级类型')")
              RadioGroup( v-model="android.updateType")
                Radio(:label="0") {{$lang('可选升级')}}
                Radio(:label="1") {{$lang('强制升级')}}
            Alert
              Checkbox(v-for="item in androidNewFeatures", v-model="item.enable", :key="item.language") {{lang[item.language]}}
            template(v-for="item in androidNewFeatures" v-if="item.enable")
              Divider {{lang[item.language]}}
              FormItem(:label="$lang('升级提示')")
                Input(v-model="item.description" type="textarea" :rows="4")
        Col(span="12")
          Card(dis-hover)
            p(slot="title") Ios
            Alert(v-if="!pageLoading && !iosVersions.length") {{$lang('没有可用历史数据无需升级')}}
            FormItem(:label="$lang('最新版本号')")
              Input(v-model="iosAppVersion"  readonly)
            FormItem(:label="$lang('升级版本区间')")
              Row
                Col(span="11")
                  Select(v-model="ios.minVersion" @on-change="changeVersion('ios')")
                    Option(v-for="item,index in iosVersions" :value="item"  :key="'ios' + item + index") {{item}}
                Col(span="2" style="textAlign:center") -
                Col(span="11")
                  Select(v-model="ios.maxVersion")
                    Option(v-for="item,index in iosVersions" :value="item" :disabled="item<ios.minVersion" :key="'ios2' + item + index") {{item}}
            FormItem(:label="$lang('升级版本号')" v-if="versions('ios').length")
              Tag(v-for="item,index in versions('ios')" color="success" :key="'tag' + item + index") {{item}}
            FormItem(:label="$lang('选择升级渠道')")
              CheckboxGroup( v-model="iosAppChannel")
                Checkbox(label="enterprise") {{$lang('企业版')}}
                Checkbox(label="testflight") {{$lang('TestFlight版')}}
                Checkbox(label="appstore") {{$lang('AppStore版')}}
            FormItem(:label="$lang('升级类型')")
              RadioGroup( v-model="ios.updateType")
                Radio(:label="0") {{$lang('可选升级')}}
                Radio(:label="1") {{$lang('强制升级')}}
            Alert
              Checkbox(v-for="item in iosNewFeatures", v-model="item.enable", :key="item.language") {{lang[item.language]}}
            template(v-for="item in iosNewFeatures" v-if="item.enable")
              Divider {{lang[item.language]}}
              FormItem(:label="$lang('升级提示')")
                Input(v-model="item.description" type="textarea" :rows="4")
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="18") &nbsp;
      Col(span="3" style="padding-top:5px")
        iSwitch(v-model="switchValue" @on-change="switchChange")
        span(v-if="switchValue") &nbsp&nbsp&nbsp{{$lang('已启用升级')}}
        span(v-if="!switchValue") &nbsp&nbsp&nbsp{{$lang('已停用升级')}}
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" type="primary" long v-else) {{$lang('保存配置')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["lang","isRead"])
  },
  data() {
    return {
      switchValue: true,
      androidNewFeatures:[],
      iosNewFeatures:[],
      pageLoading: false,
      loading: false,
      iosVersions: [],
      android: {
        updateVersion: "",
        minVersion: "",
        maxVersion: "",
        updateType: 0,
        newFeatures: [],
        appChannel: '',
      },
      androidAppChannel: ['official'],
      ios: {
        updateVersion: "",
        minVersion: "",
        maxVersion: "",
        updateType: 0,
        newFeatures: [],
        appChannel: '',
      },
      iosAppChannel: ['enterprise'],
      androidAppVersion: "",
      iosAppVersion: "",
      androidVersions: []
    };
  },
  methods: {
    versions(type) {
      return this[type + "Versions"].filter(
        el => el >= this[type].minVersion && el <= this[type].maxVersion
      );
    },
    changeVersion(type) {
      if (this[type].minVersion > this[type].maxVersion) {
        this[type].maxVersion = this[type].minVersion;
      }
    },
    switchChange() {
      this.$axios
        .post("/api/v1/broker/config/common_config/edit_config", {
          group: "app.download.url",
          key: "upgrade.switch",
          status: 1,
          value: this.switchValue,
        }).then(result => {
          if (result.code == 0) {
            this.getConfig()
          }
        });
    },
    submit() {
      let ios = {
        items: []
      };
      let android = {
        items: []
      };
      if (this.iosVersions.length && this.iosAppChannel.length) {
        let iosItems = [];
        for (let i = 0; i <this.iosAppChannel.length ; i++) {
          this.ios.appChannel = this.iosAppChannel[i];
          let result = Object.assign({},this.ios);
          iosItems.push(result);
        }
        iosItems.forEach((item) => {
          item.newFeatures = this.iosNewFeatures.filter(el => {
            if (el.enable) {
              return el;
            }
          });
        });
        ios['items'] = iosItems;
      }
      if (this.androidVersions.length && this.androidAppChannel.length) {
        let androidItems = [];
        for (let i = 0; i <this.androidAppChannel.length ; i++) {
          this.android.appChannel = this.androidAppChannel[i];
          let result = Object.assign({},this.android);
          androidItems.push(result);
          // androidItems.push(this.android);
        }
        androidItems.forEach((item) => {
          item.newFeatures = this.androidNewFeatures.filter(el => {
            if (el.enable) {
              return el;
            }
          });
        });
        android['items'] = androidItems;
      }
      if (ios.items.length || android.items.length) {
        this.loading = true;

        this.$axios
          .post("/api/v1/broker/config/app_package/save_update_info", {
            ios,
            android
          })
          .then(result => {
            this.loading = false;
            if (result.code == 0) {
              location.reload();
            }
          });
      }
    },
    getConfig() {
      this.$axios
        .post("/api/v1/broker/config/common_config/get_config", {
          group: "app.download.url",
          key: "upgrade.switch",
        })
        .then(result => {
          if (result.code == 0 && result.data) {
            this.switchValue = result.data.value == "false" ? false : true;
          }
        });
    }
  },
  created() {
    this.getConfig();
    this.pageLoading = true;
    this.$axios
      .get("/api/v1/broker/config/app_package/query_update_list")
      .then(result => {
        this.pageLoading = false;
        if (result.code == 0) {
          // Object.assign(this, result.data);

          Object.assign(this.androidVersions, result.data.androidVersions);
          Object.assign(this.iosVersions, result.data.iosVersions);
          this.iosAppVersion= result.data.iosAppVersion;
          this.ios.updateVersion = result.data.iosAppVersion;
          this.androidAppVersion= result.data.androidAppVersion;
          this.android.updateVersion = result.data.androidAppVersion;

          let temp = [];
          if (result.data.android && result.data.android.items.length) {
            result.data.android.items.forEach((item)=>{
              temp.push(item.appChannel);
            })
            // 支持多选，多选的渠道版本号统一，所以取首项即可
            Object.assign(this.android,result.data.android.items[0]);
          } else {
            temp.push('official');
          }
          this.androidAppChannel = temp;

          let iosTemp = [];
          if (result.data.ios && result.data.ios.items.length) {
            result.data.ios.items.forEach((item)=>{
              iosTemp.push(item.appChannel);
            })
            // 支持多选，多选的渠道版本号统一，所以取首项即可
            Object.assign(this.ios,result.data.ios.items[0]);
          } else {
            iosTemp.push('enterprise');
          }
          this.iosAppChannel = iosTemp;

          Object.keys(this.lang).forEach((lang, index) => {
            let _ios = (result.data.ios && result.data.ios.items.length && result.data.ios.items[0].newFeatures
              ? result.data.ios.items[0].newFeatures
              : []
            ).filter(el => lang == el.language);

            let _android = (result.data.android && result.data.android.items.length && result.data.android.items[0].newFeatures
              ? result.data.android.items[0].newFeatures
              : []
            ).filter(el => lang == el.language);
  
            if (_ios.length) {
              _ios[0].enable = true;
              this.iosNewFeatures.push(_ios[0]);
            } else {
              this.iosNewFeatures.push({
                description: "",
                language: lang,
                enable: index == 0
              });
            }

            if (_android.length) {
              _android[0].enable = true;
              this.androidNewFeatures.push(_android[0]);
            } else {
              this.androidNewFeatures.push({
                description: "",
                language: lang,
                enable: index == 0
              });
            }
          });
        }
      });
  },
};
</script>