<style lang="less" scoped>
.border {
  border-top: 1px solid #e8eaec;
  margin-top: 8px;
  padding-top: 8px;
}
</style>
<template lang="pug">
div
  Alert
    Checkbox(v-for="item in formData.value", v-model="item.enabled", :key="item.language") {{lang[item.language]}}
  Card(v-for="item,index in formData.value" :key="'c'+item.language"  dis-hover style="margin-top:15px" v-if="item.enabled")
    p(slot="title") {{lang[item.language]}}
      template(v-if="index==0") （{{$lang('默认')}}）
      a(href="javascript:;" @click="useDefault(index)" v-else) （{{$lang('使用默认')}}）
    Row(:gutter="20")
      Col(span="4")
        strong {{$lang("标识")}} KEY
      Col(span="11")
        strong {{$lang("数据")}} VALUE
      Col(span="6")
        strong {{$lang("说明")}}
      Col(span="3")
        strong {{$lang("操作")}}
    Row.border(:gutter="20" v-for="_item,_index in item.list" :key="index+''+_index")
      Col(span="4")
        Input(size="small" v-model="_item.key")
      Col(span="9")
        textarea.ivu-input.ivu-input-small(v-model="_item.value" :rows="_item.value&&_item.value.length>35?Math.floor(_item.value.length/35):1")
      Col(span="2")
        Button(size="small" long)
          Upload(:disabled="uploading" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:`${index}.${_index}`}", :show-upload-list="false"  accept="image/png" )
            Icon(type="md-cloud-upload" v-show="!uploading")
            Icon.spin-icon-load(type="ios-loading" v-show="uploading")
      Col(span="6")
        Input(size="small" v-model="_item.text")
      Col(span="3")
        Button(size="small" type="error" ghost long @click="remove(index, _index)") {{$lang("删除")}}
    Row.border(:gutter="20")
      Col(span="21")  &nbsp;
      Col(span="3")
        Button(size="small" @click="newOne(index)" type="success" long) {{$lang("新建")}}
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
  data() {
    return {
      uploading: false,
      pageLoading: false,
      loading: false,
      formData: {
        group: "custom.config.group",
        key: "cust.platformData",
        value: []
      }
    };
  },
  computed: {
    ...mapState(["lang","isRead"])
  },
  methods: {
    uploadSuccess(result) {
      this.uploading = false;
      let arr = result.data.echoStr.split(".");
      this.formData.value[arr[0]].list[arr[1]].value = result.data.url;
      this.$Notice.success({
        title: this.$lang("成功")
      });
    },
    beforeUpload() {
      this.uploading = true;
    },
    newOne(index) {
      this.formData.value[index].list.push({
        key: "",
        value: "",
        text: ""
      });
    },
    useDefault(index) {
      this.formData.value[index].list.length = 0;
      this.formData.value[0].list.forEach(el => {
        this.formData.value[index].list.push(Object.assign({}, el));
      });
    },
    remove(index, _index) {
      this.formData.value[index].list = this.formData.value[index].list.filter(
        (el, idx) => _index !== idx
      );
    },
    load() {
      this.pageLoading = true;
      this.$axios
        .post(
          "/api/v1/broker/config/common_config/get_aggerate_config",
          this.formData
        )
        .then(result => {
          this.pageLoading = false;
          if (result.code === 0) {
            Object.keys(this.lang).forEach((lang, index) => {
              let arr = result.data.value.filter(el => el.language === lang);
              let json = {
                enabled: index === 0,
                language: lang,
                list: []
              };
              if (arr.length) {
                Object.assign(json, arr[0]);
              }
              this.formData.value.push(json);
            });
          }
        });
    },
    submit() {
      this.loading = true;
      this.$axios
        .post(
          "/api/v1/broker/config/common_config/edit_aggerate_config",
          this.formData
        )
        .then(result => {
          this.loading = false;
          if (result.code === 0) {
            this.$Notice.success({
              title: this.$lang("成功")
            });
          }
        });
    }
  },
  created() {
    this.load();
  }
};
</script>