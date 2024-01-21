<style lang="less" scoped>
</style>
<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="19") &nbsp;
    Col(span="5")
      Button(
        long,
        type="primary",
        to="/content/news/config",
        icon="md-add-circle",
        ghost,
        :disabled="isRead"
      ) {{ $lang('新建') }}
  Alert(v-html="newsDesc")
  Table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{ row, index }", slot="preview")
      Poptip(v-if="allApiDomain.length > 1")
        a {{ row.details[0].title }}
        div(slot="content")
          div(v-for="(item, index) in allApiDomain" :key="index")
            a(target="_blank", :href="`https://www${/^\\./.test(item)? item : `.${item}`}/content/news/${row.newsId}/${row.newsPath}/${row.version}`") {{ row.details[0].title }}{{`---${allApiDomain[index]}`}}
            br
      a(v-else, target="_blank", :href="`https://www${/^\\./.test(allApiDomain[0])? allApiDomain[0] : `.${allApiDomain[0]}`}/content/news/${row.newsId}/${row.newsPath}/${row.version}`") {{ row.details[0].title }}
    template(slot-scope="{ row, index }", slot="action")
      template(v-if="isRead")
        router-link(
          :to="`/content/news/config/${flag}/${row.id}/${searchForm.lastId}`"
        ) {{ $lang('查看') }}
      template(v-else)
        span(v-if="row.status == 1") {{ $lang('已发布') }}
        a(
          v-if="row.status == 0",
          @click.prevent="pushNews(row)",
          :disabled="handleLoading"
        ) {{ $lang('发布') }}
        | &nbsp;&nbsp;|&nbsp;&nbsp;
        router-link(
          :to="`/content/news/config/${row.id}/${searchForm.lastId}`"
        ) {{ $lang('修改') }}
        | &nbsp;&nbsp;|&nbsp;&nbsp;
        a(@click.prevent="remove(row)", :disabled="handleLoading") {{ $lang('删除') }}
  Row(:gutter="20", style="padding-top:30px")
    Col(span="10")
      ButtonGroup
        Button(
          @click="getFirstData",
          :disabled="searchForm.lastId == 0",
          icon="ios-skip-backward"
        )
        Button(
          @click="getNextData",
          :disabled="allListData.length < searchForm.pageSize",
          icon="ios-arrow-forward"
        )
  Modal(v-model="actionWin", :title="$lang('您确定要执行此操作吗？')", width="300")
    p(v-if="action === 'delete'") {{ $lang('删除新闻资讯') }}
    p(v-else) {{ $lang('发布新闻资讯') }}
    Button(
      slot="footer",
      long,
      type="error",
      @click="doAction",
      :loading="loading",
      :disabled="loading"
    ) {{ $lang('确定') }}
</template>
<script>
import { mapState } from "vuex";
import { initData } from "@/libs/common.js";
export default {
  computed: {
    ...mapState(["lang", "isRead", "apiDomain", "allApiDomain"]),
    newsDesc() {
      return this.$lang("news.desc")
        .replace(
          "{web}",
          `<a target="_blank" href="https://www${this.apiDomain}/content/news/"> https://www${this.apiDomain}/content/news/</a>`
        )
    },
  },
  components: {},
  data() {
    return {
      locale: this.$i18n.locale,
      currentRow: null,
      action: "",
      actionWin: false,
      pageLoading: false,
      loadingTable: true,
      loading: false,
      handleLoading: false,
      list: [],
      searchForm: {
        lastId: 0,
        pageSize: 100,
      },
      formData: {
        newsPath: "",
      },
      flag: "search",
      columns: [
        {
          title: this.$lang("标题"),
          minWidth: 140,
          slot: "preview",
        },
        {
          title: this.$lang("封面"),
          minWidth: 140,
          render: (h, p, url) => {
            if (p.row.details.length) {
              url = JSON.parse(p.row.details[0].images)[0];
              p.row.details.forEach((el) => {
                if (el.language == this.locale) {
                  url = JSON.parse(el.images)[0];
                }
              });
            }
            return h("img", {
              attrs: {
                src: url,
                style: "padding:10px;max-height:100px;max-width:100%",
              },
            });
          },
        },
        {
          title: this.$lang("关键字"),
          minWidth: 160,
          render: (h, p, text) => {
            text = "-";
            if (p.row.details.length) {
              text = p.row.details[0].tags;
              p.row.details.forEach((el) => {
                if (el.language == this.locale) {
                  text = el.tags;
                }
              });
            }
            return h("span", text);
          },
        },
        {
          title: this.$lang("语言"),
          minWidth: 100,
          render: (h, p, temp = []) => {
            if (p.row.details.length) {
              p.row.details.forEach((el) => {
                temp.push(this.lang[el.language]);
              });
            }
            return h("span", temp.join("、"));
          },
        },
        {
          title: this.$lang("新闻时间"),
          minWidth: 190,
          render: (h, p) =>
            h("div", [h("div", this.newDate(p.row.published).format())]),
        },
        {
          title: this.$lang("创建时间"),
          minWidth: 190,
          render: (h, p) =>
            h("div", [h("div", this.newDate(p.row.created).format())]),
        },
        {
          title: this.$lang("更新时间"),
          minWidth: 190,
          render: (h, p) =>
            h("div", [h("div", this.newDate(p.row.updated).format())]),
        },
        {
          title: this.$lang("操作"),
          align: "center",
          fixed: "right",
          minWidth: 160,
          slot: "action",
        },
      ],
      listData: [],
      allListData: [],
    };
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      this.$axios
        .get("/api/v1/news/query", {
          params: this.searchForm,
        })
        .then((result) => {
          this.loadingTable = false;
          if (result.code === 0 && result.data.length) {
            this.allListData = result.data;
            let data = result.data.filter((item) => {
              return item.status != 2;
            });
            this.listData = data;
          }
        });
    },
    remove(row) {
      this.currentRow = row;
      this.action = "delete";
      this.actionWin = true;
    },
    doAction() {
      if (this.action === "delete") {
        this.handleLoading = true;
        this.$axios
          .post("/api/v1/news/delete", { id: this.currentRow.id })
          .then((resp) => {
            this.handleLoading = false;
            if (resp.code === 0) {
              this.$Message.success(this.$lang("操作成功"));
              this.actionWin = false;
              this.loadData();
            }
          });
      } else {
        this.handleLoading = true;
        this.$axios
          .post("/api/v1/news/publish", { id: this.currentRow.id })
          .then((resp) => {
            this.handleLoading = false;
            if (resp.code === 0) {
              this.$Message.success(this.$lang("操作成功"));
              this.actionWin = false;
              this.loadData();
            }
          });
      }
    },
    pushNews(row) {
      this.currentRow = row;
      this.action = "push";
      this.actionWin = true;
    },
    getFirstData() {
      this.searchForm.lastId = 0;
      this.loadData();
    },
    getNextData() {
      this.searchForm.lastId = this.listData.slice(-1)[0].newsId;
      this.loadData();
    },
  },
  created() {
    this.list = initData(this.lang, JSON.stringify({ news: { images: [] } }));
    this.loadData();
  },
};
</script>
