<template lang="pug">
Card(dis-hover :title="$lang('实名认证')" style="margin-top:40px")
  Row(:gutter="30")
    Col(span="24" style="padding:40px")
      Steps(:current="kycLevel-1")
        Step(:content="$lang('一级审核状态')" v-if="(kyc.verifyStatus==2 && kycLevel==1 ) || kycLevel>1" :title="$lang('审核通过')" status="finish")
        Step(:content="$lang('一级审核状态')" v-else-if="kyc.verifyStatus==1 && kycLevel==1" :title="$lang('未审核')" status="wait")
        Step(:content="$lang('一级审核状态')" v-else-if="kyc.verifyStatus==3 && kycLevel==1" :title="$lang('审核拒绝')" status="error")
        Step(:content="$lang('一级审核状态')" v-else :title="$lang('未认证')" status="process")


        Step(:content="$lang('二级审核状态')" v-if="(kyc.verifyStatus==2 && kycLevel==2 ) || kycLevel>2" :title="$lang('审核通过')" status="finish")
        Step(:content="$lang('二级审核状态')" v-else-if="kyc.verifyStatus==1 && kycLevel==2" :title="$lang('未审核')" status="wait")
        Step(:content="$lang('二级审核状态')" v-else-if="kyc.verifyStatus==3 && kycLevel==2" :title="$lang('审核拒绝')" status="error")
        Step(:content="$lang('二级审核状态')" v-else :title="$lang('未认证')" status="process")


        Step(:content="$lang('三级审核状态')" v-if="kyc.verifyStatus==2 && kycLevel==3" :title="$lang('审核通过')" status="finish")
        Step(:content="$lang('三级审核状态')" v-else-if="kyc.verifyStatus==1 && kycLevel==3" :title="$lang('未审核')" status="wait")
        Step(:content="$lang('三级审核状态')" v-else-if="kyc.verifyStatus==3 && kycLevel==3" :title="$lang('审核拒绝')" status="error")
        Step(:content="$lang('三级审核状态')" v-else :title="$lang('未认证')" status="process")
  Row(:gutter="30")
    Col(span="8")
      List(size="small")
        ListItem {{$lang("一级审核状态")}}：
          template(v-if="(kyc.verifyStatus==2 && kycLevel==1 ) || kycLevel>1") {{$lang("审核通过")}}
          template(v-else-if="kyc.verifyStatus==0 && kycLevel==1 ") {{$lang("未提交审核")}}
          template(v-else-if="kyc.verifyStatus==1 && kycLevel==1 ") {{$lang("未审核")}}
          template(v-else-if="kyc.verifyStatus==3 && kycLevel==1 ") {{$lang("审核拒绝")}}
          template(v-else) {{$lang("未认证")}}
        ListItem {{$lang("二级审核状态")}}：
          template(v-if="(kyc.verifyStatus==2 && kycLevel==2 ) || kycLevel==3") {{$lang("审核通过")}}
          template(v-else-if="kyc.verifyStatus==0 && kycLevel==2 ") {{$lang("未提交审核")}}
          template(v-else-if="kyc.verifyStatus==1 && kycLevel==2 ") {{$lang("未审核")}}
          template(v-else-if="kyc.verifyStatus==3 && kycLevel==2 ") {{$lang("审核拒绝")}}
          template(v-else) {{$lang("未认证")}}
        
        ListItem {{$lang("三级审核状态")}}：
          template(v-if="kyc.verifyStatus==1 && kycLevel==3 ") {{$lang("未审核")}}
          template(v-else-if="kyc.verifyStatus==2 && kycLevel==3") {{$lang("审核通过")}}
          template(v-else-if="kyc.verifyStatus==3 && kycLevel==3") {{$lang("审核拒绝")}}
          template(v-else) {{$lang("未认证")}}
    Col(span="8")
      List(size="small")  
        ListItem {{$lang("认证级别")}}：{{kycLevel + this.$lang("级")}}&nbsp;&nbsp;&nbsp;
          Button(:disabled="isRead" size="small" type="error" v-if="kyc.verifyStatus>0 || kycLevel>1" @click="unbindWin=true") {{$lang(kycLevel==1?"重置":"降级")}}
          | &nbsp;&nbsp;&nbsp;
          Button(size="small" type="primary" v-if="kycLevel==2 && kyc.verifyStatus==2" :disabled="isRead" @click="openKycLevel3") {{$lang('发起3级审核')}}
          Button(size="small" v-else-if="kycLevel==3 && kyc.verifyStatus==0" disabled) {{$lang('已发起3级审核')}}
          Button(size="small" type="primary" v-else-if="kycLevel==2" disabled) {{$lang('发起3级审核')}}
        ListItem {{$lang("姓氏")}}：{{kyc.firstName||$lang("暂未填写")}}
        ListItem {{$lang("名字")}}：{{kyc.secondName||$lang("暂未填写")}}
    Col(span="8")
      List(size="small")
        ListItem {{$lang("国籍")}}：{{kyc.nationality||$lang("暂未填写")}}
        ListItem {{$lang("证件类型")}}：{{kyc.cardType||$lang("暂未填写")}}
        ListItem {{kyc.cardType||'证件号码'}}：{{kyc.cardNo||$lang("暂未填写")}}
  Divider {{$lang('证件')}}
  Row(:gutter="30")
    Col(span="8")
      Card.picArea(dis-hover v-if="kyc.cardFrontUrl")
        img(:style="{ transform: `rotate(${90 * this.rotate}deg)` }", :src="`${kyc.cardFrontUrl}&width=400&height=400`")
        .text {{$lang("本人有效证件正面照片")}}
      Card.picArea(dis-hover v-else) {{$lang("暂未上传正面照片")}}
      ButtonGroup(size="small")
        Button(@click="open(kyc.cardFrontUrl)" target="_blank")
          Icon(type="md-expand" size="18")
          | {{$lang("原图")}}
        Button( @click="rotate++")
          Icon(size="18" type="md-refresh-circle")
          | {{$lang("旋转")}}
    Col(span="8")
      Card.picArea(dis-hover v-if="kyc.cardHandUrl")
        img(:style="{ transform: `rotate(${90 * this.rotate2}deg)` }", :src="`${kyc.cardHandUrl}&width=400&height=400`")
        .text {{$lang("本人有效证件正面照片和个人签字")}}
      Card.picArea(dis-hover v-else) {{$lang("暂未上传正面照片和个人签字")}}
      ButtonGroup(size="small")
        Button(@click="open(kyc.cardHandUrl)" target="_blank")
          Icon(type="md-expand" size="18")
          | {{$lang("原图")}}
        Button( @click="rotate2++")
          Icon(size="18" type="md-refresh-circle")
          | {{$lang("旋转")}}
    Col(span="8")
      Card.picArea(dis-hover v-if="kyc.cardBackUrl")
        img(:style="{ transform: `rotate(${90 * this.rotate3}deg)` }", :src="`${kyc.cardBackUrl}&width=400&height=400`")
        .text {{$lang("本人有效证件背面照片")}}
      Card.picArea(dis-hover v-else) {{$lang("暂未上传背面照片")}}
      ButtonGroup(size="small")
        Button(@click="open(kyc.cardBackUrl)" target="_blank")
          Icon(type="md-expand" size="18")
          | {{$lang("原图")}}
        Button( @click="rotate3++")
          Icon(size="18" type="md-refresh-circle")
          | {{$lang("旋转")}}
  Divider {{$lang('影像信息')}}
  Row(:gutter="30")
    Col(span="8" v-if="kyc.videoUrl")
      video(:src="kyc.videoUrl" controls="controls" width="100%")
  Modal(v-model="unbindWin" :title="$lang('降级')" width="300" footer-hide)
    p(style="margin-bottom:20px;font-size:14px") {{$lang('您确定执行此操作吗？')}}
    Button(long type="error" @click="decrKycLevel") {{$lang('确定')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  props: {
    searchForm: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  computed: {
    ...mapState(["isRead"]),
    kycLevel() {
      return Math.floor(this.kyc.kycLevel / 10);
    }
  },
  data() {
    return {
      unbindWin: false,
      rotate: 0,
      rotate2: 0,
      rotate3: 0,
      kyc: {
        nationality: "",
        firstName: "",
        secondName: "",
        gender: "",
        cardType: "",
        cardNo: "",
        cardFrontUrl: "",
        cardBackUrl: "",
        cardHandUrl: "",
        verifyStatus: "",
        passedTime: "",
        userVerifyId: "",
        kycLevel: "",
        facePhotoUrl: "",
        faceVideoUrl: "",
        videoUrl: ""
      }
    };
  },
  methods: {
    decrKycLevel() {
      this.$axios
        .post("/api/v1/user_verify/degrade_kyc_level", {
          userId: this.$route.params.userId
        })
        .then(result => {
          if (result.code == 0) {
            location.reload();
          }
        });
    },
    openKycLevel3() {
      this.$axios
        .post("/api/v1/user_verify/open_triple_kyc", {
          userId: this.$route.params.userId
        })
        .then(result => {
          if (result.code == 0) {
            location.reload();
          }
        });
    },
    open(url) {
      window.open(url);
    }
    // ,
    // reverify() {
    //   this.$axios
    //     .post("/api/v1/brokeruser/user_kyc_reverify", {
    //       userVerifyId: this.kyc.userVerifyId
    //     })
    //     .then(result => {
    //       if (result.code == 0) {
    //         location.reload();
    //       }
    //     });
    // }
  },
  created() {
    this.$axios
      .post("/api/v1/brokeruser/get_user_kyc", this.searchForm)
      .then(result => {
        if (result.code == 0) {
          Object.assign(this.kyc, result.data);
          //this.kyc = ;
        }
      });
  }
};
</script>