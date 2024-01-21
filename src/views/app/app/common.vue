<style lang="less" scoped>
.view {
  padding: 20px;
  img {
    background: #ccc;
    max-width: 320px;
    max-height: 500px;
    min-height: 50px;
  }
}
</style>
<template lang="pug">
div
  Card(dis-hover style="margin-top:15px")
    p(slot="title") {{$lang('配置')}}LOGO
    div(v-for="item,index in logo")
      Row(:gutter="20" :key="`${index}-${_index}`" v-for="_item,_index in item.items" style="margin-bottom:15px;")
        Col(span="12")
          List(border)
            ListItem
              Input(v-model="_item.lightDefaultIcon", :placeholder="$lang('小于50kb 300*60 png图片')" :disabled="uploading")
                span(slot="prepend") {{$lang('亮')}}
                Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.' + _index +'.'+ 'lightDefaultIcon'}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                  Icon(type="md-cloud-upload" v-show="!uploading")
                  Icon.spin-icon-load(type="ios-loading" v-show="uploading")
          .view
            img(:src="_item.lightDefaultIcon" v-if="_item.lightDefaultIcon")
        Col(span="12")
          List(border)
            ListItem
              Input(v-model="_item.darkDefaultIcon", :placeholder="$lang('小于50kb 300*60 png图片')" :disabled="uploading")
                span(slot="prepend") {{$lang('暗')}}
                Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.' + _index +'.'+ 'darkDefaultIcon'}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                  Icon(type="md-cloud-upload" v-show="!uploading")
                  Icon.spin-icon-load(type="ios-loading" v-show="uploading")
          .view
            img(:src="_item.darkDefaultIcon" v-if="_item.darkDefaultIcon")
  Card(dis-hover style="margin-top:15px")
    p(slot="title") {{$lang('合约帮助URL')}}
    Alert
      Checkbox(v-for="item in help", v-model="item.enabled", :key="item.language") {{lang[item.language]}}
    Row(:gutter="20")
      Col(v-for="item in help" v-if="item.enabled" :span="12" :key="item.language")
        Divider {{lang[item.language]}}
        Input(v-model="item.url", :placeholder="$lang('帮助URL')" )
          template(slot="prepend") {{$lang('帮助URL')}}
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" :disabled="loading" type="primary" long v-else) {{$lang('保存')}}
</template>
<script>
import { mapState } from "vuex";
import { initData } from "@/libs/common.js";
export default {
  computed: {
    ...mapState(["lang","isRead"])
  },
  data() {
    return {
      uploading: false,
      pageLoading: false,
      loading: false,
      logo: [
        {
          language: "en-us",
          items: [
            {
              lightDefaultIcon: "",
              darkDefaultIcon: ""
            }
          ]
        }
      ],
      help: []
    };
  },
  methods: {
    exceededSize() {
      this.uploading = false;
      this.$Notice.error({
        title: this.$lang("图片过大，请压缩后重新上传")
      });
    },
    formatError() {
      this.uploading = false;
      this.$Notice.error({
        title: this.$lang("图片格式不正确，仅支持.png格式的图片")
      });
    },
    submit() {
      this.loading = true;
      this.$axios.all([this.saveLogo(), this.saveHelp()]).then(result => {
        this.loading = false;
        let [logo, help] = result;
        if (logo.code == 0 && help.code == 0) {
          location.reload();
        }
      });
    },
    uploadSuccess(result) {
      this.uploading = false;
      if (result.code != 0) {
        return;
      }
      let tmp = result.data.echoStr.split(".");

      if (tmp.length == 3) {
        this.logo[tmp[0]].items[tmp[1]][tmp[2]] = result.data.url;
      }
      this[result.data.echoStr] = result.data.url;
      this.$Notice.success({
        title: this.$lang("成功")
      });
    },
    beforeUpload() {
      this.uploading = true;
    },

    saveLogo() {
      let json = {
        moduleType: 4,
        modules: this.logo
      };
      return this.$axios.post(
        "/api/v1/broker/config/edit_app_index__module",
        json
      );
    },

    saveHelp() {
      let json = {
        group: "custom.config.group",
        key: "cust.contractHelp",
        value: this.help
      };
      return this.$axios.post(
        "/api/v1/broker/config/common_config/edit_aggerate_config",
        json
      );
    },

    loadLogo() {
      return this.$axios.post(
        "/api/v1/broker/config/app_index_modules?moduleType=4"
      );
    },
    loadHelp() {
      return this.$axios.post(
        "/api/v1/broker/config/common_config/get_aggerate_config",
        {
          group: "custom.config.group",
          key: "cust.contractHelp"
        }
      );
    }
  },
  created() {
    this.pageLoading = true;
    this.$axios.all([this.loadLogo(), this.loadHelp()]).then(result => {
      this.pageLoading = false;
      let [logo, help] = result;
      if (
        logo.code == 0 &&
        logo.data &&
        logo.data.modules &&
        logo.data.modules.length
      ) {
        Object.assign(this.logo[0].items[0], logo.data.modules[0].items[0]);
      }

      this.help = initData(this.lang, JSON.stringify({ url: "" }));

      if (help.code == 0 && help.data) {
        this.help.forEach(el => {
          help.data.value.forEach(_el => {
            if (el.language == _el.language) {
              Object.assign(el, _el, { enabled: !!_el.url });
            }
          });
        });
      }
    });
  }
};
</script>