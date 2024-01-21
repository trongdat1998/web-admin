<style lang="less" scoped>
  .editor {
    height: 200px;
    margin-bottom: 42px;
  }
</style>
<template lang="pug">
Main.page-exchange
  Table(v-if="!showConfig" :columns="columns", :data="listData", :loading="loading")
  div(v-else)
    div(style="padding: 12px 0 12px 0")
      Button.bottom(@click="goBack")  {{$lang('返回')}}
    Divider {{$lang('免责声明')}}
    Alert
      Checkbox(
        v-for="item in list",
        v-model="item.enabled",
        :key="item.language",
        :disabled="isRead && false"
      ) {{ lang[item.language] }}
    Card(
      v-for="(item, index) in list",
      :title="lang[item.language]",
      v-if="item.enabled",
      :key="'c' + item.language",
      style="margin-top:15px"
      dis-hover
    )
      quill-editor.editor(
        v-model="item.disclaimer",
        ref="langQuillEditor",
        :options="editorOption"
      )
    Fixed(style="border 1px solid #cdcdcd")
      Row(:gutter="20")
        Col(span="20") &nbsp;
        Col(span="4")
          Button(v-if="pageLoading", loading, long) {{ $lang('加载中') }}
          Button(
            @click="saveData",
            :loading="loading",
            :disabled="loading || isRead",
            type="primary",
            long,
            v-else
          ) {{ $lang('保存') }}
</template>
<script>
import { mapState } from "vuex";
import { initData } from "@/libs/common.js";
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.snow.css";
export default {
  computed: {
    ...mapState(["dateRangeOptions", "isRead", "lang"])
  },
  components: {
    quillEditor,
  },
  data() {
    return {
      pageLoading: false,
      editorOption: {
        //  富文本编辑器配置
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"], //加粗，斜体，下划线，删除线
            [{ header: 1 }, { header: 2 }], // 标题，键值对的形式；1、2表示字体大小
            [{ list: "ordered" }, { list: "bullet" }], //列表
            [{ indent: "-1" }, { indent: "+1" }], // 缩进
            ['link'],
          ],
        },
        theme: "snow",
        placeholder: "请输入正文1-2000字",
      },
      list: [],
      currentRow: null,
      showConfig: false,
      loading: false,
      columns: [
        {
          title: this.$lang("平台商家"),
          minWidth: 190,
          key: "thirdPartyName"
        },
        {
          title: this.$lang("操作"),
          minWidth: 100,
          // fixed: "right",
          render: (h, params) => {
            return h(
              "Button",
              {
                attrs:{
                  disabled:this.isRead,
                  size:"small",
                  type:"primary"
                },
                on: {
                  click: () => {
                    this.showConfig = true;
                    this.getDetail(params)
                  }
                }
              },
              this.$lang("设置免责声明")
            );
          }
        }
      ],
      listData: []
    };
  },
  watch: {
  },
  methods: {
    loadData() {
      this.loading = true;
      this.$axios
        .get(
          "/api/v1/otc/third_party/get",
        )
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    getDetail(params) {
      this.currentRow = params.row;
      this.loading = true;
      let json = {
        thirdPartyId: params.row.thirdPartyId
      };
      this.$axios
        .get(
          "/api/v1/otc/third_party/disclaimer/query",{
            params: json
          }
        )
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.list.forEach(el => {
              result.data.forEach((item) => {
                if (el.language == item.language) {
                  Object.assign(el, item);
                  Object.assign(el, {enabled: true});
                }
              })
            })
          }
        });
    },
    saveData() {
      let ret = this.list.filter((item) => {
        Object.assign(item, {orgId: this.currentRow.orgId}, {thirdPartyId: this.currentRow.thirdPartyId});
        return item.enabled
      });
      this.$axios
        .post("/api/v1/otc/third_party/disclaimer/update", {
          disclaimerList: ret,
        })
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            this.$Message.success(this.$lang("操作成功"));
          }
        });
    },
    goBack() {
      this.showConfig = false;
      this.loadData()
    },
  },
  created() {
    this.list = initData(this.lang, JSON.stringify({ content: '' }));
    this.loadData();
  },
};
</script>
