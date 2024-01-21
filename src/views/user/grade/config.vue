<style lang="less" scoped>
  .quill-editor {
    height: 369px;
    .ql-container {
      height: 300px;
      border-color: #e8eaec !important;
    }
    .ql-toolbar {
      border-color: #e8eaec;
    }
  }
  .quill-code {
    .title {
      border: 1px solid #e8eaec;
      border-left: none;
      height: 3em;
      line-height: 3em;
      text-indent: 1rem;
      font-weight: bold;
    }
    code {
      display: block;
      width: 100%;
      margin: 0;
      padding: 1rem;
      border: 1px solid #e8eaec;
      border-left: none;
      border-top: 0;
      border-radius: 0;
      height: 369px;
      overflow-y: auto;
      resize: vertical;
    }
  }
</style>
<template lang="pug">
div
  Form
    Card(dis-hover style="margin-top:15px")
      p(slot="title") {{$lang('关于手续费等级')}}
      Alert
        Checkbox(v-for="item in formData.value", v-model="item.enabled", :key="item.language") {{lang[item.language]}}
      Row(:gutter="20")
        Col(v-for="item,index in formData.value" v-if="item.enabled" ,:key="index" span="24")
          Divider {{lang[item.language]}}
          Row
            Col(span="16")
              quill-editor(:options="editorOption" v-model="item.summary")
            Col.quill-code(span="8")
              .title Code
              code.html(v-html="contentCode(item.summary)")
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" type="primary" long v-else) {{$lang('保存')}}
</template>
<script>
import { mapState } from "vuex";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";
import { quillRedefine } from "vue-quill-editor-upload";
import { quillEditor } from "vue-quill-editor";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
export default {
  components: {
    quillRedefine,
    quillEditor
  },
  computed: {
    ...mapState(["lang","isRead"])
  },
  data() {
    return {
      editorOption: {},
      pageLoading: false,
      uploading: false,
      formData: {
        group: "custom.config.group",
        key: "cust.levelSettings",
        value: []
      },
      loading: false,
      listData: []
    };
  },
  methods: {
    contentCode(code) {
      return hljs.highlightAuto(code).value;
    },
    loadData() {
      this.$axios
        .post(
          "/api/v1/broker/config/common_config/get_aggerate_config",
          this.formData
        )
        .then(result => {
          if (result.code === 0) {
            Object.keys(this.lang).forEach((lang, index) => {
              let arr = result.data.value.filter(el => el.language === lang);
              let json = {
                enabled: index === 0,
                language: lang,
                title:'',
                summary:'',
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
      this.pageLoading = true;
      this.$axios
        .post(
          "/api/v1/broker/config/common_config/edit_aggerate_config",
          this.formData
        )
        .then(result => {
          this.pageLoading = false;
          if (result.code === 0) {
            this.$Notice.success({
              title: this.$lang("成功")
            });
          }
        });
    }
  },
  created() {
    this.loadData();
    this.editorOption = quillRedefine({
      // 图片上传的设置
      uploadConfig: {
        action: "/api/v1/storage/file/image", // 必填参数 图片上传地址
        res: respnse => {
          return respnse.data.url;
        },
        name: "uploadFile" // 图片上传参数名
      },
      toolOptions: [
        ["bold", "italic", "underline", "strike"],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["link", "image"],
        [{ color: [] }, { background: [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }]
      ]
    });
  }
};
</script>