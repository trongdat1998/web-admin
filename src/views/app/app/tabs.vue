<style lang="less" scoped>
.view {
  background: #f8f8f8;
  padding: 8px;
  overflow: hidden;
  max-width: 300px;
  margin: 0 auto;
  span,
  dl {
    float: left;
    width: 20%;
    text-align: center;
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
.draggable {
  width: 20%;
  float: left;
  overflow: hidden;
  position: relative;
}
</style>
<template lang="pug">
div
  Card(dis-hover style="margin-top:15px")
    p(slot="title") {{$lang('TAB配置')}}
    Alert
      Checkbox(v-for="item in modules", v-model="item.enable", :key="item.locale") {{lang[item.language]}}
    template(v-for="item,index in modules" v-if="item.enable")
      Divider {{lang[item.language]}}
      Row(:gutter="20")
        Col(span="4" :key="`${index}-${_index}`" v-for="_item,_index in item.items")
          List(border size="small")
            ListItem {{$lang(tabs[_index].text)}} 
              template(v-if="index==0") （{{$lang('默认')}}）
              a(href="javascript:;" @click="useDefault(index,_index)" v-else) （{{$lang('使用默认')}}）
            ListItem
              Input(v-model="_item.lightDefaultIcon", :placeholder="$lang('小于50kb 120*120 png图片')" :disabled="uploading")
                span(slot="prepend") {{$lang('亮:默认')}}
                Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.' + _index +'.'+ 'lightDefaultIcon'}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                  Icon(type="md-cloud-upload" v-show="!uploading")
                  Icon.spin-icon-load(type="ios-loading" v-show="uploading")
            ListItem
              Input(v-model="_item.lightSelectedIcon", :placeholder="$lang('小于50kb 120*120 png图片')" :disabled="uploading")
                span(slot="prepend") {{$lang('亮:选中')}}
                Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.' + _index +'.'+ 'lightSelectedIcon'}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                  Icon(type="md-cloud-upload" v-show="!uploading")
                  Icon.spin-icon-load(type="ios-loading" v-show="uploading")
            ListItem
              Input(v-model="_item.darkDefaultIcon", :placeholder="$lang('小于50kb 120*120 png图片')" :disabled="uploading")
                span(slot="prepend") {{$lang('暗:默认')}}
                Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.' + _index +'.'+ 'darkDefaultIcon'}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                  Icon(type="md-cloud-upload" v-show="!uploading")
                  Icon.spin-icon-load(type="ios-loading" v-show="uploading")
            ListItem
              Input(v-model="_item.darkSelectedIcon", :placeholder="$lang('小于50kb 120*120 png图片')" :disabled="uploading")
                span(slot="prepend") {{$lang('暗:选中')}}
                Upload(:disabled="uploading" slot="append" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.' + _index +'.'+ 'darkSelectedIcon'}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                  Icon(type="md-cloud-upload" v-show="!uploading")
                  Icon.spin-icon-load(type="ios-loading" v-show="uploading")
            ListItem
              Input(v-model="_item.moduleName", :placeholder="_item.jumpUrl" )
      Row(:gutter="20")
        Col(span="12" v-if="item.items.length")
          Divider {{$lang('亮')}}
          .view
            dl(v-for="_item,_index in item.items")
              dt
                img(:src="_item.lightDefaultIcon" v-if="_item.lightDefaultIcon")
                span(shape="square" icon="ios-person" v-else)
              dd(v-if="_item.moduleName") {{_item.moduleName}}
          .view
            dl(v-for="_item,_index in item.items")
              dt
                img(:src="_item.lightSelectedIcon" v-if="_item.lightSelectedIcon")
                span(shape="square" icon="ios-person" v-else)
              dd(v-if="_item.moduleName") {{_item.moduleName}}
        Col(span="12" v-if="item.items.length")
          Divider {{$lang('暗')}}
          .view(style="background:#000")
            dl(v-for="_item,_index in item.items")
              dt
                img(:src="_item.darkDefaultIcon" v-if="_item.darkDefaultIcon")
                span(shape="square" icon="ios-person" v-else)
              dd(v-if="_item.moduleName" style="color:#fff") {{_item.moduleName}}
          .view(style="background:#000")
            dl(v-for="_item,_index in item.items")
              dt
                img(:src="_item.darkSelectedIcon" v-if="_item.darkSelectedIcon")
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
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["lang","isRead"])
  },
  data() {
    return {
      tabs: [
        { text: "首页", jumpUrl: "Home" },
        { text: "行情", jumpUrl: "Quote" },
        { text: "交易", jumpUrl: "Trade" },
        { text: "合约", jumpUrl: "Contract" },
        { text: "资产", jumpUrl: "Assets" }
      ],
      uploading: false,
      pageLoading: false,
      loading: false,
      modules: []
    };
  },
  methods: {
    useDefault(index, _index) {
      Object.assign(
        this.modules[index].items[_index],
        this.modules[0].items[_index]
      );
    },
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
      let json = {
        moduleType: 2,
        modules: this.modules.filter(el => {
          if (el.enable) {
            return el;
          }
        })
      };
      this.$axios
        .post("/api/v1/broker/config/edit_app_index__module", json)
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
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
        this.modules[tmp[0]].items[tmp[1]][tmp[2]] = result.data.url;
      }
      this[result.data.echoStr] = result.data.url;
      this.$Notice.success({
        title: this.$lang("成功")
      });
    },
    beforeUpload() {
      this.uploading = true;
    }
  },
  created() {
    this.pageLoading = true;
    this.$axios
      .post("/api/v1/broker/config/app_index_modules?moduleType=2")
      .then(result => {
        this.pageLoading = false;

        if (result.code == 0) {
          Object.keys(this.lang).forEach((lang, index) => {
            let tmp = (result.data ? result.data.modules : []).filter(
              el => lang == el.language
            );
            if (tmp.length) {
              tmp[0].enable = true;
              this.modules.push(tmp[0]);
            } else {
              let items = [];

              this.tabs.forEach(el => {
                items.push({
                  moduleName: "",
                  darkDdefaultIcon: "",
                  darkSelectedIcon: "",
                  lightDefaultIcon: "",
                  lightSelectedIcon: "",
                  jumpUrl: el.jumpUrl
                });
              });

              this.modules.push({
                language: lang,
                enable: index == 0,
                items: items
              });
            }
          });
        }
      });
  }
};
</script>