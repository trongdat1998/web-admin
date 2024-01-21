<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="searchForm.status", @on-change="search")
        Option(value="0") {{$lang('全部')}}
        Option(value="10") {{$lang("进行中")}}
        Option(value="20") {{$lang("已下架")}}
        Option(value="30") {{$lang("已完成")}}
    Col(span="4")
      Select(v-model="searchForm.side", @on-change="search")
        Option(value="0") {{$lang("全部")}}
        Option(value="1") {{$lang("购买")}}
        Option(value="2") {{$lang("出售")}}
    Col(span="4")
      Select(v-model="searchForm.tokenId" @on-change="search" filterable)
        Option(value="") {{$lang('全部')}}
        Option(v-for="item in tokens" :value="item.tokenId" :key="item.tokenId") {{item.tokenName}}
    Col(span="4")
      Input(:placeholder="`${$lang('用户昵称')}`" v-model="searchForm.nickname")
    Col(span="8")
      Input(search :placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')}`" v-model="inputInfo", enter-button="" @on-search="search")
  Table(:columns="columns", :data="listData", :loading="loading")
  Modal.page-exchange-win(v-model="isVisible", :title="$lang('撤销广告')" width="600")
    Form(:model='formData', :labelWidth="140")
      FormItem(:label="$lang('谷歌验证码')" v-if="userInfo.bindGA" required style="margin-bottom:10px")
        Input( v-model='formData.verifyCode', :placeholder="$lang('谷歌验证码')")
      FormItem(:label="$lang('手机验证码')" v-else required style="margin-bottom:10px")
        Row
          Col(span="14")
            Input(v-model="formData.verifyCode" type="text" :placeholder="$lang('手机验证码')", :maxlength="6")
          Col(span="2" style="text-align: center") - 
          Col(span="8")
            Button(v-if="time" disabled long) {{time}}s
            Button(v-else @click="getCode" long type="primary" ghost) {{$lang("获取验证码")}}
      span(style="margin-left:54px;") {{$lang("提示：请确认要撤销该笔商家广告，谨慎操作避免引起用户纠纷投诉。")}}
    template(slot="footer")
      Button(@click="isVisible=false" type="text") {{$lang("取消")}}
      Button(slot="footer" type="primary" :loading="loading" @click="doHandle") {{$lang("确定")}}
</template>
<script>
import { formatParams } from "@/libs/common.js";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState([ "tokens","userInfo","isRead"])
  },
  data() {
    return {
      formData: {
        verifyCode: ""
      },
      time: 0,
      currentRow: {},
      inputInfo: "",
      isVisible: false,
      searchForm: {
        userId: "",
        phone: "",
        email: "",
        current: 1,
        pageSize: 100,
        side: "0",
        status: "10",
        tokenId: '',
        nickname: '',
      },
      loading: false,
      columns: [
        {
          title: this.$lang("时间"),
          minWidth: 190,
          render: (h, params) =>
            h("span", this.newDate(params.row.createDate).format())
        },
        {
          title: this.$lang("账户ID"),
          minWidth: 190,
          key: "accountId"
        },
        {
          title: this.$lang("类型"),
          minWidth: 130,
          // 目前后台筛选和出参对不上，暂不改
          render: (h, params) =>
            h("span", this.$lang(params.row.side == 0 ? "购买" : "出售"))
        },
        {
          title: this.$lang("币种"),
          minWidth: 130,
          key: "tokenId",
        },
        {
          title: this.$lang("数量"),
          minWidth: 130,
          key: "quantity"
        },
        {
          title: this.$lang("单价"),
          minWidth: 130,
          render: (h, params) =>
            h(
              "span",
              params.row.priceType == 0
                ? params.row.price + params.row.currencyId
                : "--"
            )
        },
        {
          title: this.$lang("浮动比例"),
          minWidth: 130,
          render: (h, params) =>
            h(
              "span",
              params.row.priceType == 1 ? params.row.premium + "%" : "--"
            )
        },
        {
          title: this.$lang("订单限额"),
          minWidth: 130,
          render: (h, params) =>
            h(
              "span",
              [params.row.minAmount, params.row.maxAmount].join("-") +
                params.row.currencyId
            )
        },

        {
          title: this.$lang("状态"),
          width: 120,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            let json = {
              10: "进行中",
              20: "已下架",
              30: "已完成"
            };
            return h("span", this.$lang(json[params.row.status]));
          }
        },
        {
          title: this.$lang("操作"),
          key: "status",
          minWidth: 80,
          fixed: "right",
          align: "center",
          render: (h, params) => {
            if (params.row.status == 10) {
              return h(
                "Button",
                {
                  on: {
                    click: () => {
                      this.isVisible = true;
                      this.currentRow = params.row;
                    }
                  },
                  attrs:{
                    disabled:this.isRead,
                    size:"small"
                  }
                },
                this.$lang("撤销")
              );
            } else {
              return h("span", "--");
            }
          }
        }
      ],
      listData: []
    };
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--;
        }, 1000);
      }
    }
  },
  methods: {
    search() {
      this.listData = [];
      this.loadData();
    },
    loadData() {
      this.loading = true;
      this.$axios
        .post(
          "/api/v1/otc/item/list",
          Object.assign(this.searchForm, formatParams(this.inputInfo))
        )
        .then(result => {
          if (result.code == 0) {
            this.listData = result.data;
          }
          this.loading = false;

        });
    },
    doHandle() {
      let data = Object.assign({}, this.formData, {
        itemId: this.currentRow.id,
        accountId: this.currentRow.accountId,
        authType: this.userInfo.bindGA ? 1 : 2,
      });
      this.$axios
        .post("/api/v1/otc/item/cancel", data)
        .then(result => {
          if (result.code == 0) {
            this.isVisible = false;
            this.loadData();
            this.$Notice.success({
              title: this.$lang("成功")
            });
          }
        });
    },
    getCode() {
      !this.time &&
      this.$axios
        .post("/api/v1/user/send_a_sms_verify_code", {})
        .then(result => {
          if (result.code == 0) {
            this.time = 60;
          }
        });
    },
  },
  created() {
    this.loadData();
  }
};
</script>