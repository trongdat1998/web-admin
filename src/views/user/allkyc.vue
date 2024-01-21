<style lang="less">
.page-verify-kyc {
  .ivu-col {
    font-size: 14px;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .ivu-modal-body {
    padding: 30px 30px 10px;
    .ivu-btn {
      border-radius: 2px;
    }
  }
  .img {
    width: 300px;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    background: #ccc;
    img {
      max-width: 300px;
      max-height: 300px;
    }
  }

  .ivu-radio-wrapper{
    //white-space: normal;
    overflow: hidden;
    margin-bottom: 10px;
    width: 49%;
  }
}
</style>
<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(v-model="searchForm.verifyStatus" @on-change="loadData")
        Option(value="0") {{$lang('全部')}}
        Option(value="1") {{$lang('待审核')}}
        Option(value="2") {{$lang('通过')}}
        Option(value="3") {{$lang('拒绝')}}
    Col(span="4")
      Select(v-model="searchForm.cardType" @on-change="loadData")
        Option(value="0") {{$lang('全部')}}
        Option(value="1") {{$lang('身份证')}}
        Option(value="2") {{$lang('驾驶证')}}
        Option(value="3") {{$lang('护照')}}
        Option(value="5") {{$lang('其他')}}
    Col(span="4")
      DatePicker(format="yyyy/MM/dd HH:mm:ss" @on-change="changeTimes"  type="datetimerange" style="width:100%" :value="times" :placeholder="$lang('请选择')")
    Col(span="4")
      Input(:placeholder="$lang('身份证号')" v-model="searchForm.cardNo")
    Col(span="8")
      Input(:placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')}`" v-model="inputInfo"  search enter-button="" @on-search="loadData")
  Table(:columns="columns", :data="listData", :loading="loading")
  Page(:total="total" show-total v-if="total>searchForm.pageSize" style="margin-top:20px" @on-change="changePage" :pageSize="searchForm.pageSize")
  Modal.page-verify-kyc(v-model="verifyWin" width="900", :mask-closable="false")
    Row(:gutter="15")
      Col(span="9") {{$lang('提交时间')}}：{{newDate(userInfo.updated).format()}}
      Col(span="9") {{$lang('用户ID')}}：{{userInfo.userId}}
      Col(span="6") {{$lang('国籍')}}：{{userInfo.countryName}}
    Row(:gutter="15")
      Col(span="9") {{$lang('姓氏')}}：{{userInfo.firstName}}
      Col(span="9") {{$lang('名字')}}：{{userInfo.secondName}}
      Col(span="6") 自动下一条：
        Tag(color="green" v-if="batchModel") {{$lang('开')}}
        Tag(v-else) {{$lang('关')}}
    Row.ivurow(:gutter="15")
      Col(span="9") {{$lang('证件')}}：{{userInfo.cardTypeStr}}
      Col(span="9") {{$lang('证件号码')}}：{{userInfo.cardNo}}
      Col(span="6") {{$lang('状态')}}：
        iSwitch(v-model="fromData.verifyPassed" size="large")
          span() {{$lang("通过")}}
          span(slot="close") {{$lang("拒绝")}}
    Row(:gutter="15")
      Col(span="18" v-if="userInfo.videoUrl")
        video(:src="userInfo.videoUrl" controls="controls" width="100%")
      template(v-else)
        Col(span="9")
          .img
            img(:style="{ transform: `rotate(${90 * this.rotate}deg)` }" ,:src="`${userInfo.cardFrontUrl}&width=300&height=300`")
          ButtonGroup(size="small")
            Button(size="small" @click="open(userInfo.cardFrontUrl)" target="_blank")
              Icon(type="md-expand" size="18")
              | {{$lang("原图")}}
            Button(size="small"  @click="rotate++")
              Icon(size="18" type="md-refresh-circle")
              | {{$lang("旋转")}}
        Col(span="9")
          .img
            img(:style="{ transform: `rotate(${90 * this.rotate2}deg)` }", :src="`${userInfo.cardHandUrl}&width=400&height=400`")
          ButtonGroup(size="small")
            Button(size="small" @click="open(userInfo.cardHandUrl)" target="_blank")
              Icon(type="md-expand" size="18")
              | {{$lang("原图")}}
            Button(size="small"  @click="rotate2++")
              Icon(size="18" type="md-refresh-circle")
              | {{$lang("旋转")}}
    Row(:gutter="15" v-show="!fromData.verifyPassed")
      Col(span="24")
        Divider {{$lang("补充信息")}}
      Col(span="24" style="overflow:hidden")
        RadioGroup(v-model="fromData.reasonId")
          Radio(border v-for="item in reasonList" :key="item.id" :label="item.id" :title="item.reason") {{item.reason}}
    template(slot="footer")
      Button(:type="fromData.verifyPassed?'success':'error'" @click="doNext" long :loading="loadingDatail||verifyLoading" :disabled="loadingDatail||verifyLoading||isRead") {{$lang(fromData.verifyPassed?'审核通过':'拒绝通过')}}
</template>
<script>
import { formatParams } from "@/libs/common.js";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["isRead"]),
  },
  data() {
    return {
      times: [],
      total: 0,
      loading: true,
      loadingDatail: false,
      verifyLoading: false,
      batchModel: false,
      rotate: 0,
      rotate2:0,
      verifyWin: false,
      reasonList: [],
      userInfo: {},
      fromData: {
        userVerifyId: "",
        reasonId: "",
        remark: "",
        verifyPassed: true
      },
      verifyStatus: {
        0: "未提交审核",
        1: "未审核",
        2: "审核通过",
        3: "审核拒绝"
      },
      inputInfo: "",
      searchForm: {
        verifyStatus: "0",
        cardType: "0",
        pageSize: 100,
        startTime: "",
        endTime: "",
        userId: "",
        nationalCode: "",
        phone: "",
        email: "",
        cardNo: "",
        current: 1
      },
      columns: [
        {
          title: this.$lang("提交时间"),
          minWidth: 190,
          render: (h, p) => h("span", this.newDate(p.row.updated).format())
        },
        {
          title: this.$lang("用户ID"),
          minWidth: 190,
          key: "userId",
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId
              }
            })
        },
        {
          title: "KYC",
          minWidth: 100,
          key: "kycLevel",
          render: (h, p) =>
            h("strong", Math.floor(p.row.kycLevel / 10) + this.$lang("级"))
        },
        {
          title: this.$lang("姓"),
          minWidth: 110,
          key: "firstName"
        },
        {
          title: this.$lang("名"),
          minWidth: 120,
          key: "secondName"
        },
        {
          title: this.$lang("国籍"),
          minWidth: 160,
          key: "nationality"
        },
        {
          title: this.$lang("证件类型"),
          minWidth: 160,
          key: "cardTypeStr"
        },
        {
          title: this.$lang("证件号码"),
          minWidth: 160,
          key: "cardNo"
        },
        // {
        //   title: this.$lang("审核人员"),
        //   minWidth: 160,
        //   key: "cardNo"
        // },
        {
          title: this.$lang("状态"),
          minWidth: 160,
          render: (h, params) => {
            return h(
              "Tag",
              {
                props: {
                  color:
                    params.row.verifyStatus == 2
                      ? "success"
                      : params.row.verifyStatus == 0
                      ? "default"
                      : "error"
                }
              },
              this.$lang(this.verifyStatus[params.row.verifyStatus])
            );
          }
        },
        {
          title: this.$lang("操作"),
          fixed: "right",
          align: "center",
          width: 100,
          render: (h, params) => {
            if (params.row.verifyStatus === 1 && !this.isRead) {
              return h(
                "a",
                {
                  on: {
                    click: () => {
                      this.fromData.userVerifyId = params.row.id;
                      this.userInfo.cardFrontUrl = "";
                      this.userInfo.cardHandUrl = "";
                      this.verifyWin = true;
                      this.batchModel = false;
                      this.loadDetail();
                    }
                  }
                },
                this.$lang("审核")
              );
            } else {
              return h("User", {
                props: {
                  uid: params.row.userId
                }
              },this.$lang('详情'));
            }
          }
        }
      ],
      listData: []
    };
  },
  methods: {
    changeTimes(val) {
      this.searchForm.startTime = new Date(val[0]).getTime();
      this.searchForm.endTime = new Date(val[1]).getTime();
    },
    changePage(n) {
      this.searchForm.current = n;
      this.loadData();
    },
    batchVerify() {
      if (this.listData.length) {
        this.verifyWin = true;
        this.batchModel = true;

        this.fromData.userVerifyId = this.listData[0].id;

        this.userInfo.cardFrontUrl = "";
        this.userInfo.cardHandUrl = "";

        this.loadDetail();
      } else {
        this.verifyWin = false;
        this.batchModel = false;
        alert("没有数据了");
      }
    },
    loadData() {
      this.loading = true;
      this.$axios
        .post(
          "/api/v1/all_user_verify/query",
          Object.assign(this.searchForm, formatParams(this.inputInfo))
        )
        .then(result => {
          this.loading = false;
          if (result.code === 0) {
            this.listData = result.data.list;
            this.total = result.data.total;
          }
        });
    },
    loadDetail() {
      this.loadingDatail = true;
      this.$axios
        .post("/api/v1/user_verify/show", {
          userVerifyId: this.fromData.userVerifyId
        })
        .then(result => {
          this.loadingDatail = false;
          if (result.code == 0) {
            this.fromData.reasonId = this.reasonList[0].id;
            this.fromData.verifyPassed = true;
            if (this.batchModel) {
              if (result.data.verifyStatus == 1) {
                this.userInfo = result.data;
              } else {
                this.listData = this.listData.filter(
                  el => el.id != this.fromData.userVerifyId
                );
                this.batchVerify();
              }
            } else {
              this.userInfo = result.data;
            }
          }
        });
    },
    open(url) {
      window.open(url);
    },
    doNext() {
      this.verifyLoading = true;
      this.fromData.userVerifyId = this.userInfo.id;
      this.$axios
        .post("/api/v1/user_verify/verification", this.fromData)
        .then(result => {
          this.verifyLoading = false;
          if (result.code == 0) {
            if (this.batchModel) {
              this.listData = this.listData.filter(
                el => el.id != this.fromData.userVerifyId
              );
              this.verifyWin = false;
              this.batchModel = false;
              this.batchVerify();
            } else {
              this.loadData();
              this.verifyWin = false;
            }
          }
        });
    }
  },
  created() {
    this.loadData();
    this.$axios
      .get("/api/v1/user_verify/verify_reason")
      .then(result => (this.reasonList = result.data));
  }
};
</script>
