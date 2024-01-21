<style lang="less" scoped>
  .img {
    height: 290px;
    background: #e1e1e1;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
</style>
<style lang="less">
  .quill-editor {
    height: 345px;
    .ql-container {
      height: 300px;
      border-color: #e8eaec !important;
    }
    .ql-toolbar {
      border-color: #e8eaec;
    }
  }
  .quill-code {
    .title {
      border: 1px solid #e8eaec;
      border-left: none;
      height: 3em;
      line-height: 3em;
      text-indent: 1rem;
      font-weight: bold;
    }
    code {
      display: block;
      width: 100%;
      margin: 0;
      padding: 1rem;
      border: 1px solid #e8eaec;
      border-left: none;
      border-top: 0;
      border-radius: 0;
      height: 300px;
      overflow-y: auto;
      resize: vertical;
    }
  }
</style>
<template lang="pug">
Main.page-exchange
  Form(:label-width="140")
    Divider(orientation="left") {{ $lang('基本信息') }}
    Row(:gutter="20")
      Col(span="16")
        FormItem(key="a1", :label="$lang('IEO类型')")
          RadioGroup(v-model="formData.purchaseMode")
            //- Radio(:label="1")
            //-   Tooltip(placement="top" :content="$lang('自由设计抽奖模式')")
            //-     | {{$lang("自由模式")}}
            //-     Icon(type="md-help-circle")
            Radio(:label="2", :disabled="!!formData.id")
              Tooltip(placement="top", :content="$lang('根据申购额度按额度分配')")
                | {{ $lang('阳光普照') }}
                Icon(type="md-help-circle")
            Radio(:label="3", :disabled="!!formData.id")
              Tooltip(placement="top", :content="$lang('申购期限内，用户限额内先到先得')")
                | {{ $lang('抢购模式') }}
                Icon(type="md-help-circle")
        FormItem(key="a2", :label="$lang('认购时间')")
          DatePicker(
            format="yyyy/MM/dd HH:mm:ss",
            @on-change="changePurchaseTime",
            type="datetimerange",
            style="width:100%",
            :value="purchaseTime",
            :placeholder="$lang('开始认购-结束认购时间')",
            :options="options",
            :disabled="formData.status > 1"
          )
        FormItem(key="a3", :label="$lang('上币时间')")
          DatePicker(
            format="yyyy/MM/dd HH:mm:ss",
            @on-change="changeOnlineTime",
            style="width:100%",
            type="datetime",
            :value="onlineTime",
            :placeholder="$lang('上币时间')",
            :options="options"
          )
        FormItem(key="a5", :label="$lang('支付币种')")
          Row
            Col(span="11")
              Select(
                v-model="formData.purchaseToken",
                :disabled="formData.status > 1",
                filterable
              )
                Option(
                  v-for="item in tokens",
                  :value="item.tokenId",
                  :key="item.tokenId"
                ) {{ item.tokenName }}
            Col(span="2") &nbsp;
            Col(span="11") 
              Tag(color="success") 简称 {{ tokenInfo(formData.purchaseToken).tokenName }}
              Tag(color="error") 全称 {{ tokenInfo(formData.purchaseToken).tokenFullName }}
        FormItem(key="a6", :label="$lang('发售币种')")
          Row
            Col(span="11")
              Select(
                v-model="formData.offeringsToken",
                :disabled="formData.status > 1",
                filterable
              )
                Option(
                  v-for="item in tokens",
                  :value="item.tokenId",
                  :key="item.tokenId"
                ) {{ item.tokenName }}
            Col(span="2") &nbsp;
            Col(span="11") 
              Tag(color="success") 简称 {{ tokenInfo(formData.offeringsToken).tokenName }}
              Tag(color="error") 全称 {{ tokenInfo(formData.offeringsToken).tokenFullName }}
        FormItem(key="a7", :label="$lang('发售价格')")
          Row
            Col(span="11")
              Input(
                v-model="formData.valuationTokenVolume",
                :disabled="formData.priceType == 2"
              )
                span(slot="prepend") 1 {{ tokenInfo(formData.offeringsToken).tokenName }} =
                span(slot="append") {{ tokenInfo(formData.purchaseToken).tokenName }}
            Col(span="2") &nbsp;
            Col(span="11")
              iSwitch(
                size="small",
                :true-value="2",
                :false-value="1",
                v-model="formData.priceType",
                @on-change="formData.valuationTokenVolume = ''"
              )
              |
              | {{ $lang('价格待定（预热阶段展示）') }}
        FormItem(key="a8", :label="$lang('购买配置')")
          Row
            Col(span="11")
              Input(
                v-model="formData.purchaseUnitVolume",
                :disabled="formData.status > 1"
              )
                span(slot="prepend") {{ $lang('每份数量') }}
                span(slot="append") {{ tokenInfo(formData.purchaseToken).tokenName }}
            Col(span="2") &nbsp;
            Col(span="11")
              Input(v-model="formData.maxPurchaseUnit")
                span(slot="prepend") {{ $lang('最大购买份额') }}
                span(slot="append") {{ $lang('份') }}
        FormItem(
          key="a4",
          :label="$lang('公布结果时间')",
          v-if="formData.purchaseMode != 3"
        )
          DatePicker(
            format="yyyy/MM/dd HH:mm:ss",
            @on-change="changeReleaseResultTime",
            type="datetime",
            style="width:100%",
            :value="releaseResultTime",
            :placeholder="$lang('公布结果时间')",
            :options="options2"
          )
          Alert 分配结果需要认购结束后手动配置才可以分配生效，请务必在此时间之前分配好结果。
        FormItem(
          key="a9",
          :label="$lang('分配总量')",
          v-if="formData.purchaseMode == 3"
        )
          Row
            Col(span="11")
              Input(v-model="formData.actualSaleableVolume")
                span(slot="prepend") {{ $lang('实际分配总量') }}
                template(slot="append")
                  | {{ tokenInfo(formData.offeringsToken).tokenName }}
                  template(
                    v-if="formData.actualSaleableVolume && formData.purchaseUnitVolume && formData.valuationTokenVolume"
                  )
                    |
                    | (
                    strong {{ ((formData.actualSaleableVolume * formData.valuationTokenVolume) / formData.purchaseUnitVolume).cutFixed(2) * 1 }}
                    | {{ $lang('份') }})
        FormItem(key="a10", :label="$lang('页面展示总量')")
          Row
            Col(span="11")
              Input(
                v-model="formData.namingVolume",
                :disabled="formData.volumeType == 1"
              )
                span(slot="append") {{ tokenInfo(formData.offeringsToken).tokenName }}
            Col(span="2") &nbsp;
            Col(span="11")
              iSwitch(
                size="small",
                :true-value="1",
                :false-value="2",
                v-model="formData.volumeType",
                @on-change="clearData"
              )
              | {{ $lang('自定义（预热阶段不确认发售总量）') }}
        FormItem(
          key="a12",
          :label="$lang('募集总额')",
          v-if="formData.actualSaleableVolume && formData.valuationTokenVolume && formData.purchaseMode == 3"
        )
          Alert(style="font-size:30px;padding:20px") {{ (formData.valuationTokenVolume * formData.actualSaleableVolume).cutFixed(2) }} {{ tokenInfo(formData.purchaseToken).tokenName }}
        FormItem(key="a16", :label="$lang('新版本模式')")
          Checkbox(
            v-model="formData.version",
            :true-value="1",
            :false-value="0"
          ) {{ $lang('web定制客户请不要勾选当前选项') }}
        template(v-if="formData.version")
          FormItem(key="a13", :label="$lang('项目官网')")
            Input(v-model="formData.domain")
          FormItem(key="a14", :label="$lang('项目白皮书')")
            Input(v-model="formData.whitePaper")
          FormItem(key="a15", :label="$lang('区块链浏览器')")
            Input(v-model="formData.browser")
      Col(span="8")
        Card(dis-hover)
          p(slot="title") {{ $lang('认购条件') }}
          FormItem(:label="$lang('实名认证')")
            iSwitch(size="small", v-model="formData.qualifier.verifyKyc")
          FormItem(:label="$lang('绑定手机号')")
            iSwitch(size="small", v-model="formData.qualifier.verifyMobile")
          FormItem(:label="$lang('代币持仓')")
            iSwitch(size="small", v-model="formData.qualifier.verifyPosition")
          FormItem(
            :label="$lang('持仓数量')",
            v-if="formData.qualifier.verifyPosition"
          )
            Input(v-model="formData.qualifier.quantity")
              Select(v-model="formData.qualifier.positionToken", slot="append")
                Option(
                  v-for="item in tokens",
                  :value="item.tokenId",
                  :key="item.tokenId"
                ) {{ item.tokenName }}
          FormItem(:label="$lang('平均持仓量')")
            iSwitch(
              size="small",
              v-model="formData.qualifier.verifyAvgBalance"
            )
          template(v-if="formData.qualifier.verifyAvgBalance")
            FormItem(:label="$lang('平均数量')")
              Input(v-model="formData.qualifier.verifyAvgBalanceVolume")
                Select(
                  v-model="formData.qualifier.verifyAvgBalanceToken",
                  slot="append",
                  style="width:80px"
                )
                  Option(
                    v-for="item in tokens",
                    :value="item.tokenId",
                    :key="item.tokenId"
                  ) {{ item.tokenName }}
            FormItem(:label="$lang('持仓时间')")
              DatePicker(
                format="yyyy/MM/dd HH:mm:ss",
                @on-change="changeVerifyAvgBalanceTime",
                type="daterange",
                style="width:100%",
                :value="verifyAvgBalanceTime",
                :placeholder="$lang('开始时间-结束时间')"
              )
              Alert(type="error", style="margin-top:10px")
                p {{ $lang('快照时间按照UTC +0时间生成，对应您本地时间为') }}:{{ formData.qualifier.verifyAvgBalanceStartTime > 0 ? new Date(formData.qualifier.verifyAvgBalanceStartTime * 1).format('yyyy-MM-dd hh:mm:ss') : '----' }} - {{ formData.qualifier.verifyAvgBalanceEndTime > 0 ? new Date(formData.qualifier.verifyAvgBalanceEndTime * 1).format('yyyy-MM-dd hh:mm:ss') : '----' }}

          FormItem(:label="$lang('用户等级')")
            Select(v-model="levelLimit", multiple)
              Option(
                v-for="item in levels",
                :value="item.levelConfigId",
                :key="item.levelConfigId"
              ) {{ formatLevelTitle(item.localeDetail) }}
    Alert
      Checkbox(
        v-for="(item, index) in multiLangInfo",
        v-model="item.enable",
        :key="index"
      ) {{ lang[item.lang] }}
    Card(
      dis-hover,
      v-for="(item, index) in multiLangInfo",
      v-if="item.enable",
      :key="index + '项目介绍'",
      style="marginTop:15px"
    )
      p(slot="title") {{ lang[item.lang] }}
      Row(:gutter="20")
        Col(span="16")
          FormItem(:label="$lang('项目名称')")
            Input(v-model="item.projectName")
          FormItem(:label="$lang('分配总量')")
            Input(
              v-model="item.showVolume",
              :disabled="formData.volumeType != 1"
            )
          FormItem(:label="$lang('图片')")
            Input(v-model="item.url", :placeholder="$lang('图片尺寸') + '750*480'")
              Upload(
                :disabled="uploading",
                slot="suffix",
                action="/api/v1/storage/file/image",
                name="uploadFile",
                :on-success="uploadSuccess",
                :beforeUpload="beforeUpload",
                :data="{ echoStr: 'multiLangInfo.' + index + '.url' }",
                :show-upload-list="false",
                :max-size="500",
                accept="image/png, image/jpg",
                :on-format-error="formatError",
                :on-exceeded-size="exceededSize"
              )
                Icon(type="md-cloud-upload", v-show="!uploading")
                Icon.spin-icon-load(type="ios-loading", v-show="uploading")
          FormItem(:label="$lang('项目描述')")
            Input(type="textarea", :rows="4", v-model="item.introduction")
        Col(span="8")
          .img
            img(:src="item.url")
      Divider(orientation="left") {{ $lang('项目介绍') }}
      Row(:gutter="20", v-if="formData.version")
        Col(span="8")
          Divider(orientation="left") {{ $lang('项目简介') }}({{ lang[item.lang] }})
          Input(v-model="item.description", type="textarea", :rows="15")
        Col(span="8")
          Divider(orientation="left") {{ $lang('活动规则') }}({{ lang[item.lang] }})
          Input(v-model="item.rule", type="textarea", :rows="15")
        Col(span="8")
          Divider(orientation="left") {{ $lang('关于') }}({{ lang[item.lang] }})
          Input(v-model="item.about", type="textarea", :rows="15")
      Row(v-else)
        Col(span="16")
          quill-editor(:options="editorOption", v-model="item.description")
        Col.quill-code(span="8")
          .title Code
          code.html(v-html="contentCode(item.description)")
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading", loading, long) {{ $lang('加载中') }}
        Button(@click="submit", type="primary", long, v-else) {{ $lang('保存') }}
</template>
<script>
  import { mapState } from 'vuex';
  import 'quill/dist/quill.core.css';
  import 'quill/dist/quill.snow.css';
  import 'quill/dist/quill.bubble.css';
  import { quillRedefine } from 'vue-quill-editor-upload';
  import { quillEditor } from 'vue-quill-editor';
  import hljs from 'highlight.js';
  import 'highlight.js/styles/github.css';
  export default {
    components: {
      quillEditor,
      quillRedefine,
    },
    computed: {
      ...mapState(['lang', 'tokens', 'isRead']),
    },
    data() {
      return {
        levelLimit: [],
        levels: [],
        options: {
          disabledDate: (date) => {
            return date && date.valueOf() < Date.now() - 86400000;
          },
        },
        options2: {
          disabledDate: (date) => {
            if (this.formData.timeConfig.purchaseEndTime) {
              return (
                date &&
                date.valueOf() < this.formData.timeConfig.purchaseEndTime
              );
            } else {
              return date && date.valueOf() < Date.now() - 86400000;
            }
          },
        },
        editorOption: {},
        pageLoading: false,
        uploading: false,
        purchaseTime: [],
        verifyAvgBalanceTime: [],
        onlineTime: '',
        releaseResultTime: '',
        multiLangInfo: [],
        formData: {
          whitePaper: '',
          domain: '',
          browser: '',
          version: 1,
          status: 1,
          baseProcessPercent: 0,
          purchaseMode: 3, //申购模式，1=锁仓,2=分配，3=抢购
          purchaseToken: '', //申购token
          offeringsToken: '', //发售token
          priceType: 1, //发售价格类型,1=确定,2=待定
          offeringsTokenVolume: 1,
          valuationTokenVolume: '', //发售价格,申购币种数量
          volumeType: 2, //页面分配总量类型,1=自定义,2=非自定义
          namingVolume: '', //页面分配总量,名义可销售发售币总额
          actualSaleableVolume: '', //实际分配总量
          purchaseUnitVolume: '', //最少购买额度
          maxPurchaseUnit: 0,
          timeConfig: {
            purchaseStartTime: '', //开始时间
            purchaseEndTime: '', //结束时间
            onlineTime: '', //上线时间
            releaseResultTime: '', //结果公布时间
          },
          qualifier: {
            //认购资格
            levelLimit: '',
            positionToken: '',
            verifyPosition: false,
            verifyKyc: false, //kyc验证
            verifyMobile: false, //绑定手机号
            quantity: '', //数量
            verifyAvgBalance: false, //持仓tokenId
            verifyAvgBalanceStartTime: '', //持仓tokenId
            verifyAvgBalanceEndTime: '', //持仓tokenId
            verifyAvgBalanceVolume: '', //持仓tokenId
            verifyAvgBalanceToken: '', //持仓tokenId
          },
          multiLangInfo: [],
        },
      };
    },
    methods: {
      formatLevelTitle(list) {
        let title = '';
        if (list.length) {
          title = list[0].levelName;
          list.forEach((el) => {
            if (el.language == this.$i18n.locale) {
              title = el.levelName;
            }
          });
        }
        return title;
      },
      contentCode(code) {
        return hljs.highlightAuto(code).value;
      },
      clearData() {
        this.formData.namingVolume = '';
        this.multiLangInfo.forEach((el) => {
          el.showVolume = '';
        });
      },
      //日期选择
      changePurchaseTime(val) {
        this.formData.timeConfig.purchaseStartTime = new Date(val[0]).getTime();
        this.formData.timeConfig.purchaseEndTime = new Date(val[1]).getTime();
      },

      //持仓时间
      changeVerifyAvgBalanceTime(val) {
        this.formData.qualifier.verifyAvgBalanceStartTime = new Date(
          val[0]
        ).getTime();
        this.formData.qualifier.verifyAvgBalanceEndTime = new Date(
          val[1]
        ).getTime();
      },

      changeOnlineTime(val) {
        this.formData.timeConfig.onlineTime = new Date(val).getTime();
      },
      changeReleaseResultTime(val) {
        this.formData.timeConfig.releaseResultTime = new Date(val).getTime();
      },
      tokenInfo(tokenId) {
        return this.tokens.filter((el) => el.tokenId == tokenId)[0] || {};
      },

      //图片上传
      exceededSize() {
        this.uploading = false;
        this.$Notice.error({
          title: this.$lang('图片过大，请压缩后重新上传'),
        });
      },
      formatError() {
        this.uploading = false;
        this.$Notice.error({
          title: this.$lang('图片格式不正确，仅支持.png、.jpg格式的图片'),
        });
      },
      uploadSuccess(result) {
        this.uploading = false;
        if (result.code != 0) {
          return;
        }
        let tmp = result.data.echoStr.split('.');
        // if (tmp.length == 2) {
        //   this[tmp[0]][tmp[1]] = result.data.url;
        // }
        if (tmp.length == 3) {
          this[tmp[0]][tmp[1]][tmp[2]] = result.data.url;
        }
        this.$Notice.success({
          title: this.$lang('成功'),
        });
      },
      beforeUpload() {
        this.uploading = true;
      },

      addOne(item, type) {
        item.push({
          title: '',
          content: '',
          type,
        });
      },

      init(multiLangInfo) {
        Object.keys(this.lang).forEach((lang, index) => {
          let tmp = (multiLangInfo || []).filter((el) => lang == el.lang);
          if (tmp.length) {
            this.multiLangInfo.push(Object.assign({ enable: true }, tmp[0]));
          } else {
            this.multiLangInfo.push({
              projectName: '', //项目名称
              showVolume: '', //页面分配总量
              introduction: '', //描述
              url: '', //banner 图url
              description: '', //项目介绍
              about: '',
              rule: '',
              lang: lang,
              enable: index == 0,
            });
          }
        });
      },
      loadData(id) {
        if (id) {
          this.pageLoading = true;
          this.$axios
            .post('/api/v1/activity/ieo/project/get', { id })
            .then((result) => {
              this.pageLoading = false;
              if (result.code == 0) {
                Object.assign(this.formData, result.data);
                this.purchaseTime = [
                  this.newDate(result.data.timeConfig.purchaseStartTime),
                  this.newDate(result.data.timeConfig.purchaseEndTime),
                ];

                if (result.data.qualifier.verifyAvgBalanceStartTime > 0) {
                  this.verifyAvgBalanceTime = [
                    this.newDate(
                      result.data.qualifier.verifyAvgBalanceStartTime
                    ),
                    this.newDate(result.data.qualifier.verifyAvgBalanceEndTime),
                  ];
                }
                this.onlineTime = this.newDate(
                  result.data.timeConfig.onlineTime
                );
                this.releaseResultTime = this.newDate(
                  result.data.timeConfig.releaseResultTime
                );

                this.levelLimit = this.formData.qualifier.levelLimit.split(',');

                this.init(result.data.multiLangInfo);
              }
            });
        } else {
          this.init([]);
        }
      },
      submit() {
        this.formData.multiLangInfo = this.multiLangInfo.filter((el) => {
          if (el.enable) {
            return el;
          }
        });

        this.formData.qualifier.levelLimit = this.levelLimit.join(',');

        this.$axios
          .post('/api/v1/activity/ieo/project/create', this.formData)
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              if (!this.formData.id) {
                location.href = '/activity/ieo/';
              } else {
                this.$Notice.success({
                  title: this.$lang('成功'),
                });
              }
            }
          });
      },
    },
    created() {
      this.loadData(this.$route.params.id);

      this.$axios
        .post('/api/v1/activity/ieo/user_level/user_level_info', {})
        .then((result) => {
          if (result.code == 0) {
            this.levels = result.data;
          }
        });

      this.editorOption = quillRedefine({
        // 图片上传的设置
        uploadConfig: {
          action: '/api/v1/storage/file/image', // 必填参数 图片上传地址
          res: (respnse) => {
            return respnse.data.url;
          },
          name: 'uploadFile', // 图片上传参数名
        },
        toolOptions: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['link', 'image'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
        ],
      });
    },
  };
</script>
