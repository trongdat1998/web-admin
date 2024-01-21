<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="5")
      Select(v-model="searchForm.platform" @on-change="filter")
        Option(:value="1") {{$lang('网站')}}
        Option(:value="2") {{$lang('手机端')}}
    Col(span="9") &nbsp;
    Col(span="5")
      Button(long type="warning" ghost @click="loadSetting" :disabled="isRead") {{$lang("设置")}}
    Col(span="5")
      Button(long type="primary" ghost @click="create" icon="md-add-circle" :disabled="isRead") {{$lang("新建")}}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
  .page-pages(v-if="total>searchForm.pageSize")
    Page(:current.sync="searchForm.current", :total="total", :pageSize="searchForm.pageSize" @on-change="loadData")
  
  // 创建修改公告  
  Modal.page-exchange-win(v-model="creatWinStatus", :title="$lang(`${nextType =='create' ? '新建':'修改'}`)" width="600")
    Form(:model='formItem', :label-width='100')
      FormItem(:label="$lang('平台')")
        RadioGroup(v-model="formItem.platform")
          Radio(:label="1") {{$lang('网站')}}
          Radio(:label="2") {{$lang('手机端')}}
      FormItem(:label="$lang('上架周期')")
        DatePicker(type="datetimerange" format="yyyy-MM-dd HH:mm" style="width:100%" v-model="tempDate", :placeholder="$lang('上架周期')")
      FormItem(:label="$lang('排序')")
          Slider(show-input v-model="formItem.rank")
      Alert
        Checkbox(v-for="(item,index) in announcement", v-model="item.enable" :key="index") {{lang[item.locale]}}
      template(v-for="item in announcement" v-if="item.enable")
        Divider {{lang[item.locale]}}
        FormItem(:label="$lang('标题')")
          Input(v-model='item.title', :placeholder="$lang('标题')")
        FormItem(:label="$lang('链接')")
          Input(v-model='item.pageUrl', :placeholder="$lang('链接')")
    template(slot="footer")
      Button(@click="doNext", :loading="loading"  type="primary") {{$lang('确定')}}
  Modal(v-model="removeWin" :title="$lang('删除')" footer-hide width="300")
    div(style="padding:10px 0 20px") {{$lang("您确定执行此操作吗？")}}
    div {{removeData.title}}
    Button(@click="remove"  long type="error") {{$lang("确定")}}

  Modal(v-model="settingWin" :title="$lang('设置')" width="900")
    Alert
      Checkbox(v-for="item in formData.value", v-model="item.enabled", :key="item.language") {{lang[item.language]}}
    Row(:gutter="20")
      Col(span="12" v-for="item,index in formData.value" :key="index" v-if="item.enabled")
        Divider {{lang[item.language]}}
        Input(v-model="item.url" :placeholder="$lang('更多公告链接')")
          template(slot="prepend") {{$lang('更多公告链接')}}

    Divider {{$lang('公告展示条数')}}
    Select(v-model="formData2.value")
      Option(:value="item" v-for="item in 20" :key="'a' + item") {{item}}
    Button(type="primary" :loading="loading" :disabled="loading" long slot="footer" @click="saveSettings") {{$lang('确定')}}
</template>
<script>
import { mapState } from "vuex";
import { initData } from "@/libs/common.js";
export default {
  data() {
    return {
      settingWin: false,
      formData: {
        group: "custom.config.group",
        key: "announcement.more.url",
        value: [
          {
            language: "en-us",
            enabled: true,
            url:
              "https://hbtc.zendesk.com/hc/zh-cn/categories/360000882773-%E5%85%AC%E5%91%8A%E4%B8%AD%E5%BF%83"
          }
        ]
      },
      formData2: {
        group: "custom.config.group",
        key: "announcement.limit",
        value: 5,
        status: 1
      },
      removeWin: false,
      removeData: {
        announcementId: ""
      },
      loadingTable: true,
      loading: false,
      tempDate: [], //日历临时存放值
      creatWinStatus: false,
      nextType: "",
      total: 0,
      locale: this.$i18n.locale,
      searchForm: {
        platform: 1,
        current: 1,
        pageSize: 100
      },
      announcement: [],
      formItem: {
        id: "",
        platform: 1,
        rank: 1,
        beginAt: "",
        endAt: "",
        channel: 1,
        localeDetails: []
      },
      columns: [
        {
          minWidth: 100,
          title: this.$lang("平台"),
          render: (h, p) => h("span", p.row.platform === 1 ? "PC" : "APP")
        },
        {
          title: this.$lang("标题"),
          minWidth: 240,
          render: (h, p, text) => {
            text = "-";
            if (p.row.localeDetails.length) {
              text = p.row.localeDetails[0].title;
              p.row.localeDetails.forEach(el => {
                if (el.locale == this.locale) {
                  text = el.title;
                }
              });
            }
            return h("span", text);
          }
        },
        {
          title: this.$lang("链接"),
          minWidth: 240,
          render: (h, params, href) => {
            if (params.row.localeDetails.length) {
              href = params.row.localeDetails[0].pageUrl;
              params.row.localeDetails.forEach(el => {
                if (el.locale == this.locale) {
                  href = el.pageUrl;
                }
              });
            }

            return h(
              "a",
              {
                attrs: {
                  target: "_blank",
                  href: href
                }
              },
              href
            );
          }
        },
        {
          title: this.$lang("排序"),
          minWidth: 80,
          key: "rank"
        },
        {
          title: this.$lang("语言"),
          minWidth: 140,
          render: (h, p, temp = []) => {
            if (p.row.localeDetails.length) {
              p.row.localeDetails.forEach(el => {
                temp.push(this.lang[el.locale]);
              });
            }
            return h("span", temp.join("、"));
          }
        },
        {
          title: this.$lang("活动时间"),
          minWidth: 190,
          render: (h, p) =>
            h("div", [
              h("div", this.newDate(p.row.beginAt).format()),

              h("div", this.newDate(p.row.endAt).format())
            ])
        },
        {
          title: this.$lang("状态"),
          minWidth: 140,
          render: (h, params) => {
            let msg = "";
            if (params.row.status == 1) {
              msg = "未启用";
            } else if (params.row.status == 2) {
              msg = "已启用";
            } else {
              msg = "已禁用";
            }

            return h(
              "Tag",
              {
                props: {
                  color: params.row.status == 2 ? "success" : "error"
                }
              },
              this.$lang(msg)
            );
          }
        },
        {
          title: this.$lang("操作"),
          fixed: "right",
          align: "center",
          minWidth: 120,
          render: (h, params) => {
            return this.isRead
              ? h("span", "---")
              : [
                  h(
                    "a",
                    {
                      on: {
                        click: () => {
                          this.creatWinStatus = true;
                          this.nextType = "edit";
                          Object.assign(this.formItem, params.row);
                          //初始化表单数据
                          this.initFormItem();
                          this.announcement.forEach((el, index) => {
                            params.row.localeDetails.forEach(_el => {
                              _el.enable = false;
                              if (_el.locale == el.locale) {
                                _el.enable = true;
                                Object.assign(this.announcement[index], _el);
                              }
                            });
                          });
                          this.tempDate = [
                            Number(params.row.beginAt),
                            Number(params.row.endAt)
                          ];
                        }
                      }
                    },
                    this.$lang("修改")
                  ),
                  h("span", " | "),
                  h(
                    "a",
                    {
                      on: {
                        click: () => {
                          this.removeData.announcementId = params.row.id;
                          this.removeWin = true;
                        }
                      }
                    },
                    this.$lang("删除")
                  )
                ];
          }
        }
      ],
      listData: []
    };
  },
  methods: {
    remove() {
      this.$axios
        .post("/api/v1/announcement/delete", this.removeData)
        .then(() => {
          this.removeWin = false;
          this.loadData();
        });
    },
    filter() {
      this.searchForm.current = 1;
      this.loadData();
    },
    loadData() {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/announcement/query", this.searchForm)
        .then(result => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data.list;
            this.total = result.data.total;
          }
        });
    },
    settings() {},
    create() {
      this.creatWinStatus = true;
      this.nextType = "create";
      this.initFormItem();
      this.tempDate = [];
      this.formItem = Object.assign(this.formItem, {
        platform: this.searchForm.platform,
        rank: 1,
        beginAt: "",
        endAt: "",
        localeDetails: []
      });
    },
    doNext() {
      this.loading = true;
      if (this.tempDate.length) {
        this.formItem.beginAt = new Date(this.tempDate[0]).getTime();
        this.formItem.endAt = new Date(this.tempDate[1]).getTime();
      }

      this.formItem.localeDetails = this.announcement.filter(el => el.enable);

      this.$axios
        .post(
          this.nextType == "create"
            ? "/api/v1/announcement"
            : "/api/v1/announcement/update",
          this.formItem
        )
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.creatWinStatus = false;
            this.loadData();
          }
        });
    },
    initFormItem() {
      this.announcement = [];
      for (let key in this.lang) {
        this.announcement.push({
          title: "",
          pageUrl: "",
          type: 1,
          locale: key,
          enable: this.nextType == "create" && key == this.locale // 添加的时候取系统默认语言
        });
      }
    },

    loadSetting() {
      this.settingWin = true;
      this.loading = true;
      this.formData.value = initData(this.lang, JSON.stringify({ url: "" }));
      this.$axios.all([this.loadURL(), this.loadLimit()]).then(result => {
        this.loading = false;
        let [res1, res2] = result;

        this.formData.value.forEach(el => {
          res1.data.value.forEach(_el => {
            if (el.language == _el.language) {
              Object.assign(el, _el);
            }
          });
        });

        if (res2.code == 0 && res2.data) {
          this.formData2.value = Number(res2.data.value);
        }
      });
    },

    saveSettings() {
      this.loading = true;

      this.$axios
        .all([this.saveURL(), this.saveLimit()])
        .then(result => {
          this.loading = false;
          let [res1, res2] = result;
          if (res1.code == 0 && res2.code == 0) {
            this.settingWin = false;
            this.$Notice.success({
              title: this.$lang("成功")
            });
          }
        });
    },

    loadURL() {
      return this.$axios.post(
        "/api/v1/broker/config/common_config/get_aggerate_config",
        this.formData
      );
    },

    loadLimit() {
      return this.$axios.post(
        "/api/v1/broker/config/common_config/get_config",
        this.formData2
      );
    },

    saveURL() {
      return this.$axios.post(
        "/api/v1/broker/config/common_config/edit_aggerate_config",
        this.formData
      );
    },

    saveLimit() {
      return this.$axios.post(
        "/api/v1/broker/config/common_config/edit_config",
        this.formData2
      );
    }
  },
  computed: {
    ...mapState(["lang", "isRead"])
  },
  created() {
    this.loadData();
  }
};
</script>