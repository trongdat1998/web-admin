<style lang="less" scoped>
.view {
  background: #f8f8f8;
  padding: 8px;
  overflow: hidden;
  text-align: center;
  span,
  img {
    background: #ccc;
    max-width: 320px;
    max-height: 500px;
    min-height: 50px;
  }
}
.draggable,
.button {
  width: 100%;
  float: left;
  border: 5px solid #fff;
  overflow: hidden;
  position: relative;
}
</style>
<template lang="pug">
div
  Card(dis-hover style="margin-top:15px")
    p(slot="title") {{$lang('闪屏配置')}}
    Alert
      Checkbox(v-for="item in modules", v-model="item.enable", :key="item.locale") {{lang[item.language]}}
    template(v-for="item,index in modules" v-if="item.enable")
      Divider {{lang[item.language]}}
      Row(:gutter="20")
        Col(span="12")
          .draggable(:key="`${index}-${_index}`" v-for="_item,_index in item.items" style="margin-bottom:15px;")
            List(border )
              ListItem
                Input(v-model="_item.lightDefaultIcon", :placeholder="$lang('小于150kb 900*750 png图片')" :disabled="uploading")
                  Upload(:disabled="uploading" slot="suffix" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index+ '.' + _index}", :show-upload-list="false" :max-size="50" accept="image/png" :on-format-error="formatError" :on-exceeded-size="exceededSize")
                    Icon(type="md-cloud-upload" v-show="!uploading")
                    Icon.spin-icon-load(type="ios-loading" v-show="uploading")
              ListItem
                Input(v-model="_item.jumpUrl", :placeholder="$lang('链接')" )
              ListItem
                RadioGroup(v-model="_item.jumpType" size="small")
                  Radio(:label="0") {{$lang("APP链接")}}
                  Radio(:label="1") {{$lang("html链接")}}
                Icon.hand(@click.native="remove(item.items,index,_index)" type="md-trash" style="color:#ed4014" :title="$lang('删除')")
          .button(v-if="item.items.length<1")
            Button(@click="newOne(index)" long type="primary" icon="md-add-circle" ghost) {{$lang("新建")}}
        Col(span="12" v-if="item.items.length")
          .view
            template(v-for="_item,_index in item.items")
              img(:src="_item.lightDefaultIcon" v-if="_item.lightDefaultIcon")
              span(shape="square" icon="ios-person" v-else)
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
      uploading: false,
      pageLoading: false,
      loading: false,
      modules: []
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
      let json = {
        moduleType: 3,
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

      if (tmp.length == 2) {
        this.modules[tmp[0]].items[tmp[1]].lightDefaultIcon = result.data.url;
      }
      this[result.data.echoStr] = result.data.url;
      this.$Notice.success({
        title: this.$lang("成功")
      });
    },
    beforeUpload() {
      this.uploading = true;
    },
    newOne(index) {
      this.modules[index].items.push({
        moduleName:"",
        lightDefaultIcon: "",
        jumpType: 1, //0-native  1-h5跳转
        jumpUrl: "",
        loginShow: 0 //0-不区分都可展示、1-登录时展示、2-未登录时展示
      });
    },
    remove(arr, index, _index) {
      this.modules[index]["items"] = arr.filter((el, i) => _index != i);
    }
  },
  created() {
    this.pageLoading = true;
    this.$axios
      .post("/api/v1/broker/config/app_index_modules?moduleType=3")
      .then(result => {
        this.pageLoading = false;

        if (result.code == 0) {
          Object.keys(this.lang).forEach((lang, index) => {
            let tmp = (result.data ? result.data.modules : []).filter(el => lang == el.language);
            if (tmp.length) {
              tmp[0].enable = true;
              this.modules.push(tmp[0]);
            } else {
              this.modules.push({
                language: lang,
                enable: index == 0,
                items: []
              });
            }
          });
        }
      });
  }
};
</script>