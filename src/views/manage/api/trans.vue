<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="5")
      Select(v-model="parentSubject" @on-change="loadData")
        Option(:value="key*1" v-for="item, key in types" :key="'a'+key") {{$lang(item)}}
    Col(span="14") &nbsp;
    Col(span="5")
      Button(long type="primary" ghost @click="create" icon="md-add-circle" :disabled="isRead") {{$lang('新建')}}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
  Modal.page-exchange-win(v-model="creatWinStatus", :title="$lang('二级流水')" width="700" :footer-hide="isRead")
    Form(:label-width='120')
      FormItem(:label="$lang('一级流水类型')")
        RadioGroup(v-model="formItem.parentSubject")
          Radio(:label="key*1" v-for="item, key in types" :key="'c'+key" :disabled="!formItem.create") {{$lang(item)}}
      FormItem(:label="$lang('二级流水')")
        Input(v-model='formItem.subject', :placeholder="$lang('自定义的4-5位整形数数')" :disabled="!formItem.create")
      FormItem(:label="$lang('语言')")
        Alert
          Checkbox(v-for="(item,index) in formItem.names", v-model="item.enable" :key="index") {{lang[item.language]}}
      Divider {{$lang('名称')}}
      template(v-for="item in formItem.names" v-if="item.enable")
        FormItem(:label="lang[item.language]")
          Input(v-model='item.name', :placeholder="$lang('名称')")
    template(slot="footer")
      Button(@click="submit", :loading="loading" :disabled="loading"  type="primary") {{$lang('确定')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  data() {
    return {
      types: {
        3: "转账",
        70: "空投"
      },
      loading: false,
      creatWinStatus: false,
      loadingTable: true,
      locale: this.$i18n.locale,
      parentSubject: 3,
      formItem: {
        create: true,
        parentSubject: 3,
        subject: "",
        names: []
      },
      columns: [
        {
          title: this.$lang("一级流水类型"),
          minWidth: 140,
          render: (h, p) =>
            h("span", this.$lang(this.types[p.row.parentSubject]))
        },
        {
          title: this.$lang("二级流水"),
          minWidth: 160,
          key: "subject"
        },

        {
          title: this.$lang("名称"),
          minWidth: 140,
          render: (h, p) => {
            let text = "-";
            if (p.row.names.length) {
              text = p.row.names[0].name;
              p.row.names.forEach(el => {
                if (el.language == this.locale) {
                  text = el.name;
                }
              });
            }
            return h("span", text);
          }
        },

        {
          title: this.$lang("操作"),
          align: "center",
          fixed: "right",
          minWidth: 80,
          render: (h, p) => {
            return h("div", [
              h(
                "a",
                {
                  on: {
                    click: () => {
                      this.create();
                      this.formItem.create = false;
                      this.formItem.subject = p.row.subject
                      this.formItem.parentSubject = p.row.parentSubject
                      this.formItem.names.forEach(el => {
                        p.row.names.forEach(_el => {
                          if (el.language == _el.language) {
                            _el.enable = true;
                            Object.assign(el, _el);
                          }
                        });
                      });
                    }
                  }
                },
                this.isRead ? this.$lang("查看"): this.$lang("修改")
              )
            ]);
          }
        }
      ],
      listData: []
    };
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      this.$axios
        .get("/api/v1/org_api/query_sub_business_subject", {
          params: {
            parentSubject: this.parentSubject
          }
        })
        .then(result => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data;
          }
        });
    },
    submit() {
      this.loading = true;
      this.$axios
        .post("/api/v1/org_api/save_sub_business_subject", this.formItem)
        .then(result => {
          this.loading = false;
          if (result.code === 0) {
            this.creatWinStatus = false;
            this.loadData();
          }
        });
    },
    create() {
      this.creatWinStatus = true;
      this.formItem.parentSubject = this.parentSubject;
      this.formItem.subject = "";
      this.formItem.names = [];
      this.formItem.create = true;
      Object.keys(this.lang).forEach(el => {
        this.formItem.names.push({
          name: "",
          language: el,
          enable: el == this.locale // 添加的时候取系统默认语言
        });
      });
    }
  },
  computed: {
    ...mapState(["lang","isRead"])
  },
  created() {
    this.loadData();
  }
};
</script>