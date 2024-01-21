<style lang="less" scoped>
.list {
  height: 400px;
  overflow: hidden;
  overflow-y: auto;
  img {
    min-width: 300px;
    max-width: 300px;
  }
  dl {
    dt {
      color: #ff9900;
    }
    dd {
      padding: 5px;
    }
  }
}
.nodata {
  padding: 100px;
}
</style>
<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="24")
      RadioGroup(v-model="searchForm.status" @on-change="search")
        Radio(border label="0") {{$lang("全部")}}
        Radio(border label="10") {{$lang("等待付款")}}
        Radio(border label="20") {{$lang("等待放币")}}
        Radio(border label="30") {{$lang("申诉中")}}
        Radio(border label="50") {{$lang("已完成")}}
        Radio(border label="40") {{$lang("取消订单")}}
      Divider
    Col(span="4")
      Select(v-model="searchForm.side", @on-change="loadData")
        Option(value="0") {{$lang("全部")}}
        Option(value="1") {{$lang("购买")}}
        Option(value="2") {{$lang("出售")}}
    Col(span="5")
     DatePicker(type="daterange"  :options="dateRangeOptions", :editable="false" :placeholder="$lang('选择日期')"  format="yyyy-MM-dd" style="width:100%" v-model="tempDate", @on-change="loadData")
    Col(span="5")
      Input(:placeholder="$lang('用户ID')"  v-model="searchForm.userId")
    Col(span="5")
      Input(:placeholder="$lang('订单号')" v-model="searchForm.orderId")
    Col(span="5")
      Button(@click="loadData" long type="primary") {{$lang('搜索')}}

  Table(:columns="columns", :data="listData", :loading="loading")
    template(slot-scope="{ row }" slot="status")
      template(v-if="row.status == 30")
        Button(@click="loadMessages(row)" type="error" size="small") {{status[row.status]}}
      span(v-else) {{status[row.status]}}
  div(style="padding-top:30px")
    ButtonGroup
      Button(icon="ios-arrow-back" @click="prev"  :disabled="searchForm.current==1")
      Button(icon="ios-arrow-forward" @click="next"  :disabled="listData.length<searchForm.pageSize")
  
  Modal(v-model="bussInfoWin" :title="$lang('券商信息')" width="300" footer-hide)
    p(style="margin-bottom:20px;font-size:14px") {{$lang('券商')}}：{{bussInfo.brokerName}}
    p(style="margin-bottom:20px;font-size:14px") TEL：{{bussInfo.phone}}
    p(style="margin-bottom:20px;font-size:14px") {{$lang('若联系不到券商请与BHOP客服联系')}}
    Button(long type="success" @click="bussInfoWin=false") {{$lang('确定')}}

  // 仲裁管理-用户
  Modal(v-model="editUserWin", :title="$lang('修改')" @on-ok="saveUserAppeal")
    RadioGroup(v-model="editUserForm.type")
      Radio(:label="1") {{$lang("撤销")}}
      Radio(:label="2") {{$lang("完全成交")}}
    Input(v-model='editUserForm.remark', :placeholder="$lang('请输入原因')",  type="textarea", :rows="4" style="margin-top:15px")
  // 仲裁管理-商家
  Modal(v-model="editBussWin", :title="$lang('修改')" @on-ok="saveUserAppeal")
    Alert
      template(v-if="editBussForm.target.type") {{$lang("对方")}} : {{editBussForm.target.type==1?$lang("撤销"):$lang("完全成交")}}
        br
        | {{$lang("描述")}} : {{editBussForm.target.remark}}
      template(v-else) {{$lang("对方")}} : {{$lang("未处理")}}
    RadioGroup(v-model="editUserForm.type")
      Radio(:label="1") {{$lang("撤销")}}
      Radio(:label="2") {{$lang("完全成交")}}
    Input(v-model='editUserForm.remark', :placeholder="$lang('请输入原因')",  type="textarea", :rows="4" style="margin-top:15px")
  Modal(v-model="appealWin", :title="$lang('查看')" :width="780")
    Alert {{$lang('申诉原因')}} ：{{appealContent}}
    Row(:gutter="20")
      Col(span="12")
        Divider {{$lang('商家')}}
        .list(v-if="messagesData.makerMessages.length")
          dl(v-for="item in messagesData.makerMessages")
            dt {{newDate(item.createDate).format('yyyy/MM/dd hh:mm:ss')}}
            dd(v-if="item.messageType=='image'")
              img(:src="item.message")
            dd(v-else) {{item.message}}
        .nodata(v-else-if="init")
          Icon(type="ios-chatbubbles" size="20") 
          | {{$lang('暂无数据')}}
      Col(span="12")
        Divider {{$lang('用户')}}
        .list(v-if="messagesData.takerMessages.length")
          dl(v-for="item in messagesData.takerMessages")
            dt {{newDate(item.createDate).format('yyyy/MM/dd hh:mm:ss')}}
            dd(v-if="item.messageType=='image'")
              img(:src="item.message")
            dd(v-else) {{item.message}}
        .nodata(v-else-if="init")
          Icon(type="ios-chatbubbles" size="20") 
          | {{$lang('暂无数据')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["dateRangeOptions","isRead"])
  },
  data() {
    return {
      appealContent:"",
      status: {
        10: this.$lang("待支付"),
        20: this.$lang("已支付待确认"),
        30: this.$lang("申诉中"),
        40: this.$lang("撤销"),
        50: this.$lang("完全成交")
      },
      tempDate: [],
      init: false,
      editUserWin: false,
      editBussWin: false,
      bussInfoWin: false,
      appealWin: false,
      editBussForm: {
        self: {
          brokerId: 7008,
          type: 40, //40=取消，50=成交
          remark: this.$lang("没收到钱")
        },
        target: {
          brokerId: 7008, //brokerid
          type: 50, //40=取消，50=成交
          remark: this.$lang("已经打款")
        }
      },
      messagesData: {
        makerMessages: [],
        takerMessages: []
      },
      bussInfo: {
        phone: "", //电话
        brokerName: "" //券商名称
      },
      editUserForm: {
        remark: "",
        orderId: "",
        type: 1
      },
      searchForm: {
        orderId: "",
        current: 1,
        pageSize: 50,
        status: this.$route.params.status || "30",
        userId: this.$route.query.userId || "",
        side: "0",
        startTime: "",
        endTime: ""
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
          title: this.$lang("订单号"),
          minWidth: 170,
          key: "id"
        },
        {
          title: this.$lang("剩余时间"),
          minWidth: 120,
          render: (h, params) =>
            h(
              "span",
              params.row.remainSeconds &&
                (this.searchForm.status == 10 || this.searchForm.status == 20) >
                  0
                ? [
                    Math.floor(params.row.remainSeconds / 60).fullNumber(),
                    (params.row.remainSeconds % 60).fullNumber()
                  ].join(":")
                : "--"
            )
        },
        {
          title: this.$lang("深度共享"),
          minWidth: 120,
          key: "depthShare",
          sortable: true,
          render: (h, params) =>
            h(
              "Tag",
              {
                attrs: { color: params.row.depthShare ? "success" : "default" }
              },
              params.row.depthShare ? "Y" : "N"
            )
        },
        {
          title: this.$lang("类型"),
          minWidth: 80,
          sortable: true,
          key: "side",
          render: (h, params) =>
            h("span", this.$lang(params.row.side == 0 ? "购买" : "出售"))
        },
        {
          title: this.$lang("总价"),
          minWidth: 140,
          key: "amount",
          render: (h, params) =>
            h("span", params.row.amount + params.row.currencyId)
        },
        {
          title: this.$lang("单价"),
          minWidth: 140,
          key: "price",
          render: (h, params) =>
            h("span", params.row.price + params.row.currencyId)
        },
        {
          title: this.$lang("数量"),
          minWidth: 130,
          key: "quantity"
        },
        {
          title: this.$lang("币种"),
          minWidth: 130,
          key: "tokenId",
          filters: [
            {
              label: "BTC",
              value: "BTC"
            },
            {
              label: "ETH",
              value: "ETH"
            },
            {
              label: "USDT",
              value: "USDT"
            },
            {
              label: "OTHER",
              value: "OTHER"
            }
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value === "BTC") {
              return row.tokenId == value;
            } else if (value === "ETH") {
              return row.tokenId == value;
            } else if (value === "USDT") {
              return row.tokenId == value;
            } else if (value === "OTHER") {
              return (
                row.tokenId !== "ETH" &&
                row.tokenId !== "BTC" &&
                row.tokenId !== "USDT"
              );
            }
          }
        },
        {
          title: this.$lang("用户"),
          minWidth: 130,
          render: (h, params) => {
            return params.row.depthShare && params.row.brokerType == 1
              ? h(
                  "Button",
                  {
                    on: {
                      click: () => {
                        this.viewBussInfo(params.row);
                      }
                    },
                    attrs: {
                      size: "small",
                      type: "success"
                    }
                  },
                  this.$lang("联系对方券商")
                )
              : h(
                  "a",
                  {
                    on: {
                      click: () => {
                        this.redirectUser(params.row.accountId);
                      }
                    }
                  },
                  params.row.nickName
                );
          }
        },
        {
          title: this.$lang("商家"),
          minWidth: 130,
          render: (h, params) => {
            return params.row.depthShare && params.row.brokerType == 2
              ? h(
                  "Button",
                  {
                    on: {
                      click: () => {
                        this.viewBussInfo(params.row);
                      }
                    },
                    attrs: {
                      size: "small",
                      type: "success"
                    }
                  },
                  this.$lang("联系对方券商")
                )
              : h(
                  "a",
                  {
                    on: {
                      click: () => {
                        this.redirectUser(params.row.targetAccountId);
                      }
                    }
                  },
                  params.row.targetNickName
                );
          }
        },
        {
          title: this.$lang("状态"),
          minWidth: 150,
          slot: "status"
        },
        {
          title: this.$lang("操作"),
          key: "status",
          minWidth: 80,
          fixed: "right",
          align: "center",
          render: (h, params) => {
            if (params.row.status == 30) {
              return h(
                "Button",
                {
                  on: {
                    click: () => {
                      this.appeal(params.row);
                    }
                  },
                  attrs:{
                    disabled:this.isRead,
                    size:"small"
                  }
                },
                this.$lang("修改")
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
    $route(to) {
      if (to.params.status) {
        this.searchForm.status = to.params.status;
        this.search();
      }
    }
  },
  methods: {
    prev() {
      if (this.searchForm.current > 1) {
        this.searchForm.current--;
        this.loadData();
      }
    },
    next() {
      if (this.listData.length == this.searchForm.pageSize) {
        this.searchForm.current++;
        this.loadData();
      }
    },
    appeal(row) {
      this.editUserForm.type = "";
      this.editUserForm.remark = "";
      this.editUserForm.orderId = row.id;
      if (row.depthShare) {
        this.editBussWin = true;
        Object.assign(this.editBussForm, {
          self: {
            brokerId: "",
            type: "", //40=取消，50=成交
            remark: ""
          },
          target: {
            brokerId: "", //brokerid
            type: "", //40=取消，50=成交
            remark: ""
          }
        });

        this.$axios
          .post(" /api/v1/otc/order/appeal/list", { id: row.id })
          .then(result => {
            if (result.code == 0 && result.data) {
              Object.assign(this.editBussForm, result.data);
              if (result.data.self) {
                Object.assign(this.editUserForm, result.data.self);
              }
            }
          });
      } else {
        this.editUserWin = true;
      }
    },
    viewBussInfo(row) {
      this.$axios
        .post("/api/v1/otc/config/broker/ext/get", { id: row.dealBrokerId })
        .then(result => {
          if (result.code == 0) {
            this.bussInfoWin = true;
            if (result.data) {
              Object.assign(this.bussInfo, result.data);
            } else {
              Object.assign(this.bussInfo, {
                phone: "", //电话
                brokerName: "" //券商名称
              });
            }
          }
        });
    },
    redirectUser(accountId) {
      this.$axios
        .post("/api/v1/brokeruser/get_broker_user", { accountId: accountId })
        .then(d => {
          if (d.code == 0) {
            window.open("/user/detail/" + d.data.userId);
          }
        });
    },
    search() {
      this.searchForm.lastId = 0;
      this.listData = [];
      this.loadData();
    },
    saveUserAppeal() {
      this.$axios
        .post("/api/v1/otc/order/handle", this.editUserForm)
        .then(() => this.loadData());
    },
    loadData() {
      if (this.tempDate.length && this.tempDate[0] && this.tempDate[1]) {
        this.searchForm.startTime = new Date(this.tempDate[0]).getTime();
        this.searchForm.endTime = new Date(this.tempDate[1]).getTime();
      } else {
        this.searchForm.startTime = "";
        this.searchForm.endTime = "";
      }
      this.loading = true;
      this.$axios
        .post(
          "/api/v1/otc/order/list",
          Object.assign(this.searchForm)
        )
        .then(result => {
          if (result.code == 0) {
            this.listData = result.data;
          }
          this.loading = false;
        });
    },
    loadMessages(row) {
      this.appealContent = row.appealContent
      this.appealWin = true;
      this.init = false;
      this.$axios
        .post("/api/v1/otc/order/appeal_messages", { orderId: row.id })
        .then(result => {
          this.init = true;
          if (result.code == 0) {
            this.messagesData.takerMessages = result.data.takerMessages;
            this.messagesData.makerMessages = result.data.makerMessages;
          }
        });
    },
    more() {
      this.searchForm.lastId = this.listData[this.listData.length - 1].orderId;
      this.loadData();
    }
  },
  created() {
    this.loadData();
    this.timer = setInterval(() => {
      (this.searchForm.status == 10 || this.searchForm.status == 20) &&
        this.listData.forEach(el => {
          if (el.remainSeconds && el.remainSeconds > 0) {
            el.remainSeconds--;
          }
        });
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  }
};
</script>