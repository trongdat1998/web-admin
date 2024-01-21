<style lang="less" scoped>
.auth {
  table {
    width: 100%;
    border-top: 1px solid #e5edfe;
    border-right: 1px solid #e5edfe;
  }
  td,
  th {
    border-left: 1px solid #e5edfe;
    border-bottom: 1px solid #e5edfe;
    padding: 5px 10px;
    text-align: left;
  }
  dl {
    border: 1px dashed #e5edfe;
    padding:5px;
    background: #f6f6f6;
    margin: 5px 0;
    color: #777;
    font-size: 12px;
    overflow: hidden;
    &.read {
      background: #f90;
      color: #fff;
    }
    &.write {
      background: #19be6b;
      color: #fff;
    }
  }
  dt {
    //background: rgba(91, 127, 175, 0.1);
    line-height: 28px;
    font-weight: 700;
    margin-top: -5px;
  }
  dd {
    /deep/ .ivu-btn{
      width: 50%;
      font-size: 12px;
      line-height: 28px;
      height:28px;
    }

    /deep/ .ivu-btn-group {
      display: block;overflow: hidden;
    }
  }
  .icon {
    margin-right: 5px;
    font-size: 18px;
  }
}
</style>
<template lang="pug">
Main.page-exchange
  Form
    Row.search(:gutter="15")
      Col(span="20") &nbsp;
      Col(span="4")
        Button(long  type="primary" @click="create()" icon="md-add-circle" ghost :disabled="isRead") {{$lang('新建')}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable")
  Modal(v-model="userModal", :title="$lang('用户管理')" :loading="loading" width="1000" @on-ok="save" :footer-hide="isRead")
    Form
      FormItem
        Input(v-model='formData.name', :placeholder="$lang('用户姓名')" :readonly="view")
          template(slot="prepend") {{$lang('角色名称')}}
      FormItem.auth
        table(cellspacing="0" cellpadding="0" border="0")
          template(v-for="item in menuList")
            tr.main(v-if="canuse[item.id]")
              td(width="15%")
                Icon.icon(:type="item.type")
                strong {{$lang(item.name)}}
              td
                Row(:gutter="10")
                  Col(span="6")
                    dl
                      dd
                        ButtonGroup
                          Button(size="small" :type="authPathIds[item.id] === 1?'warning' : 'default'" @click="selectParent(item.id,item.children,1)") {{$lang("仅查看")}}
                          Button(size="small" :type="authPathIds[item.id] === 2?'success' : 'default'" @click="selectParent(item.id,item.children,2)") {{$lang("可操作")}}
            tr(v-if="item.children && item.children.length")
              td &nbsp;
              td
                Row(:gutter="10")
                  Col(span="6" v-for="_item,index in item.children" :key="_item.id" v-if="canuse[_item.id]")
                    dl
                      dt {{$lang(_item.name)}}
                      dd
                        ButtonGroup(style="width:100%")
                          Button(size="small" :type="authPathIds[_item.id] === 1?'warning' : 'default'" @click.native="cancel(_item.id,item,1)") {{$lang("仅查看")}}
                          Button(size="small" :type="authPathIds[_item.id] === 2?'success' : 'default'" @click.native="cancel(_item.id,item,2)") {{$lang("可操作")}}
      Divider {{$lang('关联用户')}}
      FormItem
        CheckboxGroup(v-model="formData.userIds")
          Checkbox(:disabled="view" :label="item.id" v-for="item in listUser" :key="item.id") {{item.username}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["menuList", "functions", "isRead"])
  },
  data() {
    return {
      view: false,
      formData: {
        roleId: "",
        name: "",
        userIds: [],
        authPaths: {}
      },
      authPathIds: {},
      canuse: {},
      userModal: false,
      loadingTable: true,
      loading: true,
      columns: [
        {
          title: this.$lang("创建时间"),
          minWidth: 180,
          render: (h, params) =>
            h("span", this.newDate(params.row.createdAt).format())
        },
        {
          title: this.$lang("角色名称"),
          minWidth: 160,
          key: "name"
        },
        {
          title: this.$lang("用户数量"),
          minWidth: 160,
          key: "userCount"
        },
        {
          title: this.$lang("状态"),
          fixed: "right",
          align: "center",
          width: 100,
          render: (h, params) => {
            return h("iSwitch", {
              props: {
                disabled: this.isRead,
                value: params.row.status,
                "true-value": 1,
                "false-value": 2,
                size: "small"
              },
              on: {
                "on-change": status => {
                  this.roleEnable(status, params.row.roleId);
                }
              }
            });
          }
        },
        {
          title: this.$lang("操作"),
          fixed: "right",
          align: "center",
          width: 140,
          render: (h, params) => {
            return h("div", [
              h(
                "a",
                {
                  on: {
                    click: () => {
                      this.create({
                        roleId: params.row.roleId,
                        name: params.row.name
                      });
                    }
                  }
                },
                this.isRead ? this.$lang("查看") : this.$lang("修改")
              ),
              h("span", " | "),
              h(
                "a",
                {
                  on: {
                    click: () => {
                      this.create(
                        {
                          roleId: params.row.roleId,
                          name: params.row.name
                        },
                        true
                      );
                    }
                  }
                },
                this.$lang("详情")
              )
            ]);
          }
        }
      ],
      listData: [],
      listUser: []
    };
  },
  methods: {
    cancel(id, parentItem, status) {
      if (this.authPathIds[id] === status) {
          this.authPathIds[id] = 0;
          if (
            parentItem &&
            !parentItem.children.filter(el => this.authPathIds[el.id]).length
          ) {
            this.authPathIds[parentItem.id] = 0;
          }
      } else {
        this.authPathIds[id] = status;
        if (!this.authPathIds[parentItem.id]) {
          this.authPathIds[parentItem.id] = status;
        }
      }
    },
    selectParent(id, children, status) {
      if (this.authPathIds[id] === status) {
        this.authPathIds[id] = 0;
        children &&
          children.forEach(el => {
            this.authPathIds[el.id] = 0;
          });
      } else {
        this.authPathIds[id] = status;
        children &&
          children.forEach(el => {
            if (!this.authPathIds[el.id]) {
              this.authPathIds[el.id] = status;
            }
          });
      }
    },
    loadData() {
      this.loadingTable = true;
      this.$axios.post("/api/v1/role_auth/role/list", {}).then(result => {
        this.loadingTable = false;
        this.listData = [];
        if (result.code === 0) {
          this.listData = result.data;
        }
      });
    },
    roleEnable(status, roleId) {
      this.$axios
        .post("/api/v1/role_auth/role/enable", {
          roleId,
          status
        })
        .then(() => {
          this.loadData();
        });
    },
    loadUser(roleId) {
      this.$axios
        .post("/api/v1/role_auth/role/user/list", {
          roleId
        })
        .then(result => {
          this.listUser = result.data;
          this.listUser.forEach(el => {
            if (el.enable) {
              this.formData.userIds.push(el.id);
            }
          });
        });
      this.$axios
        .post("/api/v1/role_auth/role/auth_path/list_v1", {
          roleId
        })
        .then(result => {
          if (result.code === 0) {
            Object.assign(this.authPathIds, result.data);
          }
        });
    },

    save() {
      if (this.view) {
        this.userModal = false;
      } else {
        this.formData.authPaths = {};

        Object.keys(this.authPathIds).forEach(el => {
          if (this.authPathIds[el]) {
            this.formData.authPaths[el] = this.authPathIds[el];
          }
        });

        this.$axios
          .post(
            this.formData.roleId
              ? "/api/v1/role_auth/role/update"
              : "/api/v1/role_auth/role/create",
            this.formData
          )
          .then(result => {
            this.loading = false;
            if (result.code == 0) {
              location.reload();
            }
            setTimeout(() => {
              this.loading = true;
            }, 100);
          });
      }
    },
    create(json = { roleId: "", name: "" }, view = false) {
      Object.keys(this.authPathIds).forEach(el => (this.authPathIds[el] = 0));
      this.formData = {
        roleId: json.roleId,
        name: json.name,
        userIds: [],
        authPaths: []
      };
      this.view = view;
      this.userModal = true;
      this.loadUser(json.roleId);
    }
  },
  created() {
    this.$axios.post("/api/v1/role_auth/auth_id/list").then(result => {
      let json = {};
      result.data.forEach(el => {
        json[el] = 1;
      });
      this.canuse = Object.assign({}, json);
      this.authPathIds = Object.assign({}, json);
      this.loadData();
    });
  }
};
</script>