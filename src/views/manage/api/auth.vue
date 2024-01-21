<template lang="pug">
.page-exchange
  Row.search(:gutter="24")
    Col(span="19")
      Alert {{$lang("您可以通过API使用行情查询、实时交易等服务，请参阅API文档查看使用 实名认证成功后可以创建OrgApi Key 每个账户仅可创建2组OrgApi Key 为了您的账户安全考虑，每个OrgApi Key最多绑定10个IP")}}
    Col(span="5" v-if="canCreateOrgApi")
      Button(long type="primary" ghost @click="create" icon="md-add-circle" :disabled="!canCreate||isRead") {{$lang('新建')}}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{ row }" slot="change")
      iSwitch(size="small"  v-model="row.status" :true-value="1" :false-value="2")
  Modal.page-exchange-win(v-model="creatWin", :title="$lang('新建')")
    Form(:label-width='120')
      FormItem(:label="$lang('OrgApi备注名')")
        Input(v-model='formItem.tag', :placeholder="$lang('OrgApi备注名')")
    template(slot="footer")
      Button(@click="submit", :loading="loading" :disabled="loading"  type="primary") {{$lang('确定')}}
  Modal.page-exchange-win(v-model="settingsWin", :title="$lang('白名单设置')" :footer-hide="isRead")
    Form(:label-width='120')
      Alert {{$lang("提示：白名单最多可以添加20个IP地址")}}
      Input(v-model='ipList[index]', placeholder="0.0.0.0" v-for="(item, index) in ipList" :key="index" style="margin-bottom:10px;")
    template(slot="footer")
      Button(@click="saveips", :loading="loading" :disabled="loading"  type="primary") {{$lang('确定')}}
  Modal(v-model="removeWin" :title="`${$lang('删除')}“${removeData.tag}”`" footer-hide width="300")
    div(style="padding:10px 0 20px") {{$lang("您确定执行此操作吗？")}}
    Button(@click="remove"  long type="error") {{$lang("确定")}}

  Modal(v-model="copyWin" title="secretKey" width="700" :closable="false" :mask-closable="false")
    Alert(type="error") {{$lang("仅展示一次，请妥善保存，遗失不可找回")}}
    Input(element-id="copy" :value="secretKey" readonly)
    template(slot="footer")
      Button.copy(data-clipboard-target="#copy") {{$lang("复制")}}
</template>
<script>
import { mapState } from "vuex";
import ClipboardJS from "clipboard";
export default {
  data() {
    return {
      copyWin: false,
      canCreate: false,
      loading: false,
      creatWin: false,
      removeWin: false,
      settingsWin: false,
      loadingTable: true,
      editIndex: "",
      removeData: {},
      secretKey: "",
      formItem: {
        tag: ""
      },
      ipList: [],
      ips: {
        id: "",
        ips: ""
      },
      columns: [
        {
          title: this.$lang("时间"),
          minWidth: 190,
          render: (h, p) => h("span", this.newDate(p.row.created).format())
        },
        {
          title: "OrgApi key",
          minWidth: 260,
          key: "apiKey"
        },
        {
          title: this.$lang("备注"),
          minWidth: 160,
          key: "tag"
        },
        {
          title: this.$lang("白名单"),
          minWidth: 80,
          render: (h, params) => {
            return h(
              "Button",
              {
                props: {
                  type: "primary",
                  size: "small",
                  ghost: true
                },
                on: {
                  click: () => {
                    this.settingsWin = true;
                    this.ips.id = params.row.id;
                    this.ipList = [];
                    let tmp = params.row.ipWhiteList.split(",");
                    for (let index = 0; index < 20; index++) {
                      if (tmp[index]) {
                        this.ipList.push(tmp[index]);
                      } else {
                        this.ipList.push("");
                      }
                    }
                  }
                }
              },
              this.isRead ? this.$lang("查看") : this.$lang("设置")
            );
          }
        },
        {
          title: this.$lang("状态"),
          minWidth: 80,
          slot: "change",
          render: (h, params) => {
            return h("iSwitch", {
              props: {
                disabled: this.isRead,
                value: params.row.status,
                "true-value": 1,
                "false-value": 2,
                loading: this.editIndex === params.index
              },
              on: {
                "on-change": status => {
                  this.editIndex = params.index;
                  this.$axios
                    .post("/api/v1/org_api/api_key/change_status", {
                      id: params.row.id,
                      status
                    })
                    .then(result => {
                      this.editIndex = "";
                      if (result.code == 0) {
                        location.reload();
                      }
                    });
                }
              }
            });
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
                "Button",
                {
                  attrs: {
                    type: "error",
                    size: "small",
                    ghost: true,
                    disabled: this.isRead
                  },
                  on: {
                    click: () => {
                      this.removeWin = true;
                      Object.assign(this.removeData, p.row);
                    }
                  }
                },
                this.$lang("删除")
              )
            ]);
          }
        }
      ],
      listData: []
    };
  },
  methods: {
    remove() {
      this.loading = true;
      this.$axios
        .post("/api/v1/org_api/api_key/delete", this.removeData)
        .then(result => {
          this.loading = false;
          if (result.code === 0) {
            this.removeWin = false;
            this.loadData();
          }
        });
    },
    saveips() {
      this.loading = true;
      this.ips.ips = this.ipList.filter(el => el).join(",");
      this.$axios
        .post("/api/v1/org_api/api_key/update_ips", this.ips)
        .then(result => {
          this.loading = false;
          if (result.code === 0) {
            this.settingsWin = false;
            this.loadData();
          }
        });
    },
    loadData() {
      this.loadingTable = true;
      this.$axios.get("/api/v1/org_api/api_keys").then(result => {
        this.loadingTable = false;
        if (result.code === 0) {
          this.listData = result.data;
          if (this.listData.length >= 2) {
            this.canCreate = false;
          } else {
            this.canCreate = true;
          }
        }
      });
    },
    submit() {
      this.loading = true;
      this.$axios
        .post("/api/v1/org_api/api_key/create", this.formItem)
        .then(result => {
          this.loading = false;
          if (result.code === 0) {
            this.creatWin = false;
            this.secretKey = result.data.secretKey;
            this.copyWin = true;
            this.loadData();
          }
        });
    },
    create() {
      this.creatWin = true;
      this.formItem.tag = "";
    }
  },
  computed: {
    ...mapState(["lang", "canCreateOrgApi", "isRead"])
  },
  created() {
    this.loadData();
  },
  mounted() {
    let clipboard = new ClipboardJS(".copy");
    clipboard.on("success", () => {
      this.$Message.success(this.$lang("已复制"));
      this.copyWin = false;
    });
  }
};
</script>
