<template lang="pug">
div
  Row(:gutter="20")
    Col(span="12")
      Card(dis-hover)
        p(slot="title") {{ $lang('新闻列表模板') }}
        Input(v-model="newsListTemplate", type="textarea", :rows="18")
    Col(span="12")
      Card(dis-hover)
        p(slot="title") {{ $lang('新闻详情模板') }}
        Input(v-model="newsDetailTemplate", type="textarea", :rows="18")

  Card(dis-hover, style="margin-top:15px")
    p(slot="title") {{ $lang('模板参数') }}
    Alert
      Checkbox(
        v-for="item in list",
        v-model="item.enabled",
        :key="item.language"
      ) {{ lang[item.language] }}
    Card(
      v-for="(item, index) in list",
      :key="'c' + item.language",
      dis-hover,
      style="margin-top:15px",
      v-if="item.enabled"
    )
      p(slot="title") {{ lang[item.language] }}
      Row(:gutter="20")
        Col(span="4")
          strong {{ $lang('标识') }} KEY
        Col(span="11")
          strong {{ $lang('数据') }} VALUE
        Col(span="3")
          strong {{ $lang('操作') }}
      Row.border(
        v-if="item.params",
        :gutter="20",
        v-for="(_item, _index) in item.params",
        :key="index + '' + _index"
      )
        Col(span="4")
          Input(v-model="_item.key")
        Col(span="16")
          textarea.ivu-input.ivu-input-small(
            v-model="_item.value",
            :rows="_item.value && _item.value.length > 100 ? Math.floor(_item.value.length / 100) : 1"
          )
        Col(span="4")
          Button(
            size="small",
            type="error",
            ghost,
            long,
            @click="remove(index, _index)"
          ) {{ $lang('删除') }}
      Row.border(:gutter="20")
        Col(span="21") &nbsp;
        Col(span="3")
          Button(@click="newOne(index)", type="success", long) {{ $lang('新建') }}

  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
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
  import { mapState } from 'vuex';
  import { initData } from '@/libs/common.js';
  import { escapeHTML, unescapeHTML } from 'underscore.string';
  import { languageKeys } from '@/libs/consts';
  export default {
    data() {
      return {
        newsListTemplate: '',
        newsDetailTemplate: '',
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
      loadData() {
        this.pageLoading = true;
        this.$axios
          .get('/api/v1/news/get_template', {
            params: {
              name: 'news-list',
            },
          })
          .then((result) => {
            this.pageLoading = false;
            if (result.code == 0) {
              this.newsListTemplate = unescapeHTML(result.data.content);
              let params = JSON.parse(result.data.params);
              Object.keys(params).forEach((el) => {
                this.list.forEach((item) => {
                  if (el == languageKeys[item.language]) {
                    item.enabled = true;
                    item.params = Object.keys(params[el]).map((key) => {
                      return {
                        key,
                        value: params[el][key],
                      };
                    });
                  }
                });
              });
            }
          });
        this.$axios
          .get('/api/v1/news/get_template', {
            params: {
              name: 'news-detail',
            },
          })
          .then((result) => {
            this.pageLoading = false;
            if (result.code == 0) {
              this.newsDetailTemplate = unescapeHTML(result.data.content);
              let params = JSON.parse(result.data.params);
              Object.keys(params).forEach((el) => {
                this.list.forEach((item) => {
                  if (el == languageKeys[item.language]) {
                    item.enabled = true;
                    item.params = Object.keys(params[el]).map((key) => {
                      return {
                        key,
                        value: params[el][key],
                      };
                    });
                  }
                });
              });
            }
          });
      },

      saveData() {
        let params = {};
        this.list.forEach((item) => {
          if (item.enabled) {
            let lan = languageKeys[item.language];
            let temp = (params[lan] = {});
            item.params.forEach((param) => {
              temp[param.key] = param.value;
            });
          }
        });
        this.loading = true;
        Promise.all([
          this.$axios.post('/api/v1/news/set_template', {
            name: 'news-list',
            content: escapeHTML(this.newsListTemplate),
            params: JSON.stringify(params),
          }),
          this.$axios.post('/api/v1/news/set_template', {
            name: 'news-detail',
            content: escapeHTML(this.newsDetailTemplate),
            params: JSON.stringify(params),
          }),
        ]).then(([resp1, resp2]) => {
          this.loading = false;
          if (resp1.code == 0 && resp2.code == 0) {
            this.$Notice.success({
              title: this.$lang('操作成功'),
            });
          }
        });
      },

      newOne(index) {
        let item = this.list[index];
        item.params = item.params || [];
        item.params.push({
          key: '',
          value: '',
        });
      },

      remove(index, paramsIndex) {
        let item = this.list[index];
        item.params.splice(paramsIndex, 1);
      },
    },
    created() {
      if (!this.isRoot) {
        location.href = '/404';
      }
      this.list = initData(this.lang, JSON.stringify({ params: [] }));
      this.loadData();
    },
  };
</script>
<style scoped>
  .border {
    border-top: 1px solid #e8eaec;
    margin-top: 8px;
    padding-top: 8px;
    display: flex;
    align-items: center;
  }
</style>
