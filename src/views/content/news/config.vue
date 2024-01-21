<style lang="less" scoped>
.top {
  margin-top: 12px;
}
.editor {
  height: 200px;
  margin-bottom: 42px;
}
</style>
<template lang="pug">
Main.page-exchange
  Form(:label-width="100")
    FormItem(:label="$lang('新闻路径')")
      Input(
        v-model="formData.newsPath",
        :placeholder="$lang('字母、数字、-、_  ，50字以内，用于SEO优化')"
      )
    FormItem(:label="$lang('新闻时间')")
      DatePicker(format="yyyy/MM/dd HH:mm:ss" type="datetime" style="width:100%" v-model="times" :placeholder="$lang('新闻时间')")
  Alert
    Checkbox(
      v-for="item in list",
      v-model="item.enabled",
      :key="item.language",
      :disabled="isRead"
    ) {{ lang[item.language] }}

  Card(
    :title="lang[item.language]",
    v-for="(item, index) in list",
    v-if="item.enabled",
    :key="'c' + item.language",
    style="margin-top:15px"
    dis-hover
  )
    Row(:gutter="20")
      Col(span="16")
        Form(:label-width="100")
          FormItem(:label="$lang('标题')")
            Input(v-model="item.title", :placeholder="$lang('1-50字')")
          FormItem(:label="$lang('封面')")
            Input(v-model="item.news.images[0]", :placeholder="$lang('封面')")
              Upload(
                slot="suffix",
                action="/api/v1/storage/file/image",
                name="uploadFile",
                :on-success="uploadSuccess",
                :show-upload-list="false",
                @click.native="setUploadIndex(index)",
                :title="index",
                :before-upload="handleBeforeUpload",
                v-show="!uploadLoading && !isRead"
              )
                Icon(type="md-cloud-upload")
            div {{ $lang('建议图片尺寸') }} ：276×180, <80KB
          FormItem(:label="$lang('文章头图')")
            Input(v-model="item.news.images[1]", :placeholder="$lang('文章头图')")
              Upload(
                slot="suffix",
                action="/api/v1/storage/file/image",
                name="uploadFile",
                :on-success="uploadSuccessHead",
                :show-upload-list="false",
                @click.native="setUploadIndex(index)",
                :title="index",
                :before-upload="handleBeforeUpload",
                v-show="!uploadLoading && !isRead"
              )
                Icon(type="md-cloud-upload")
            div {{ $lang('建议图片宽度<1200px') }}

          FormItem(:label="$lang('来源')")
            Input(v-model="item.source", :placeholder="$lang('1-20字，原创或引用来源')")
          FormItem(:label="$lang('关键字')")
            Input(
              v-model="item.tags",
              :placeholder="$lang('不超过10个，每个关键字不超过10个字，用’,’隔开')"
            )
          FormItem(:label="$lang('摘要')")
            Input(
              v-model="item.summary",
              type="textarea",
              :rows="2",
              :placeholder="$lang('请输入摘要1-200字')"
            )
      Col(span="8")
        div(style="min-height:160px;background:rgba(91, 127, 175, 0.1)")
          img(
            v-if="item.news.images[0]",
            :src="item.news.images[0]",
            style="max-width:100%;max-height:160px;display:block;margin:0 auto;"
          )
        Divider(size="small") {{ $lang('封面') }}
        div(style="min-height:160px;background:rgba(91, 127, 175, 0.1)")
          img(
            v-if="item.news.images[1]",
            :src="item.news.images[1]",
            style="max-width:100%;max-height:160px;display:block;margin:0 auto;"
          )
        Divider(size="small") {{ $lang('文章头图') }}
    quill-editor.editor(
      v-model="item.content",
      ref="langQuillEditor",
      :options="editorOption"
    )
  Fixed(v-if="flag !== 'search'", style="border 1px solid #cdcdcd")
    Row(:gutter="20")
      Col(span="20") &nbsp;
      Col(span="4")
        Button(v-if="pageLoading", loading, long) {{ $lang('加载中') }}
        Button(
          @click="saveData",
          :loading="loading",
          :disabled="loading",
          type="primary",
          long,
          v-else
        ) {{ $lang('保存') }}
</template>
<script>
import { mapState } from "vuex";
import { initData } from "@/libs/common.js";
import { Quill, quillEditor } from "vue-quill-editor";
import "quill/dist/quill.snow.css";

const icons = Quill.import('ui/icons');
icons.header[3] = require('!html-loader!quill/assets/icons/header-3.svg')
icons.header[4] = require('!html-loader!quill/assets/icons/header-4.svg');
icons.header[5] = require('!html-loader!quill/assets/icons/header-5.svg');
icons.header[6] = require('!html-loader!quill/assets/icons/header-6.svg');

export default {
  computed: {
    ...mapState(["lang", "isRead"]),
  },
  components: {
    quillEditor,
  },
  data() {
    return {
      lastId: this.$route.params.lastId || "",
      id: this.$route.params.id || "",
      flag: this.$route.params.flag || "",
      row: "",
      type: "",
      editor: null, // 富文本编辑器对象
      content: "", // 富文本编辑器默认内容
      editorOption: {
        //  富文本编辑器配置
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"], //加粗，斜体，下划线，删除线
            [{ 'header': 1 }, { 'header': 2 }, {'header': 3}, {'header': 4}, {'header': 5}],
            [{ 'size': ['small', false, 'large']}],
            [{ list: "ordered" }, { list: "bullet" }], //列表
            [{ indent: "-1" }, { indent: "+1" }], // 缩进
            [{'align': null}, { 'align': 'center'}, { 'align': 'right'}],
            // ['link', 'image'],
          ],
        },
        theme: "snow",
        placeholder: "请输入正文1-5000字",
      },
      times: new Date(),
      locale: this.$i18n.locale,
      currentRow: null,
      pageLoading: false,
      uploadLoading: false,
      uploadIndex: "",
      loading: false,
      list: [],
      formData: {
        newsPath: "",
      },
    };
  },
  methods: {
    saveData() {
      let allData = this.list;
      let data = allData.filter((item) => {
        return item.enabled;
      });
      let localeDetails = [];
      data.forEach((ret) => {
        if(!ret.news.images[0]) {
          ret.news.images[0] = ''
        }
        if(!ret.news.images[1]) {
          ret.news.images[1] = ''
        }
        ret.images = JSON.stringify(ret.news.images);
        localeDetails.push(ret);
      });
      if (!/^[0-9a-zA-Z_-]*$/.test(this.formData.newsPath)) {
        this.$Notice.warning({
          title: this.$lang("新闻路径不符合要求"),
        });
        return;
      }
      let finalParams = {
        details: localeDetails,
        newsPath: this.formData.newsPath,
        published: new Date(this.times).getTime(),
      };
      this.loading = true;
      if (this.type === "create") {
        this.$axios.post("/api/v1/news/create", finalParams).then((resp) => {
          this.loading = false;
          if (resp.code === 0) {
            this.$Notice.success({
              title: this.$lang("成功"),
            });
            this.$router.replace(`/content/news`);
          }
        });
      } else {
        Object.assign(finalParams, {
          id: this.currentRow.id,
          newsId: this.currentRow.newsId,
        });
        this.$axios.post("/api/v1/news/modify", finalParams).then((resp) => {
          this.loading = false;
          if (resp.code === 0) {
            this.$Notice.success({
              title: this.$lang("成功"),
            });
            this.$router.replace(`/content/news`);
          }
        });
      }
    },
    getDetail(row) {
      this.formData = {
        newsPath: row.newsPath,
      };
      if (row.details && row.details.length) {
        let language = [];
        row.details.forEach((el) => {
          this.list.forEach((_el) => {
            if (el.language == _el.language) {
              language.push(_el.language);
              Object.assign(_el, el);
              _el.news.images[0] = JSON.parse(el.images)[0];
              _el.news.images[1] = JSON.parse(el.images)[1];
            }
          });
        });
        this.list.forEach((item) => {
          if (language.includes(item.language)) {
            item.enabled = true;
          } else {
            item.enabled = false;
          }
        });
      }
    },
    uploadSuccess(res) {
      this.list[this.uploadIndex].news.images[0] = res.data.url;
      this.uploadIndex = "";
      this.uploadLoading = false;
    },
    uploadSuccessHead(res) {
      this.list[this.uploadIndex].news.images[1] = res.data.url;
      this.uploadIndex = "";
      this.uploadLoading = false;
    },
    setUploadIndex(index) {
      if (this.uploadIndex === "") {
        this.uploadIndex = index;
        return true;
      }
      return false;
    },
    handleBeforeUpload() {
      this.uploadLoading = true;
      return true;
    },
    loadData() {
      if (this.id) {
        this.loading = true;
        this.pageLoading = true;
        this.$axios
          .get("/api/v1/news/query", {
            params: {
              lastId: this.lastId,
              pageSize: 100,
            },
          })
          .then((result) => {
            this.loading = false;
            this.pageLoading = false;
            if (result.code === 0 && result.data.length) {
              let allData = result.data;
              let row = {};
              allData.forEach((item) => {
                if (item.id == this.id) {
                  Object.assign(row, item);
                }
              });
              this.row = row;
              if (this.flag) {
                this.type = this.flag;
              } else {
                this.type = "edit";
              }
              this.currentRow = row;
              this.getDetail(row);
            }
          });
      } else {
        this.list = initData(
          this.lang,
          JSON.stringify({ news: { images: [] } })
        );
        this.formData.newsPath = "";
        // this.list.forEach((item) => {
        //   if (item.language == this.locale) {
        //     // 取系统默认语言
        //     item.enabled = true;
        //   } else {
        //     item.enabled = false;
        //   }
        // });
        this.type = "create";
      }
    },
  },
  created() {
    this.list = initData(this.lang, JSON.stringify({ news: { images: [] } }));
    this.loadData();
  },
  beforeDestroy() {
    this.editor = null;
    delete this.editor;
  },
};
</script>
