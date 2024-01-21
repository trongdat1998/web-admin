<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="20") &nbsp;
    Col(span="4")
      Button(
        long,
        type="primary",
        @click="handleBtnAdd",
        :disabled="isRead",
        icon="md-add-circle",
        ghost
      ) {{ $lang('上币申请') }}
  Table.user-table(:loading="loading", :columns="columns", :data="listData")
  Page(
    :total="total",
    :page-size="searchForm.pageSize",
    style="margin-top: 20px",
    @on-change="load",
    v-if="total > searchForm.pageSize"
  )
  Modal(
    v-model="addWin",
    :title="$lang('上币申请')",
    @on-ok="handleTabsAdd",
    width="800",
    footer-hide,
    :mask-closable="false"
  )
    Form(:model="formData", :labelWidth="120")
      FormItem(:label="$lang('代币类型')")
        Select(v-model="formData.tokenType", size="default", filterable)
          Option(v-for="(item, key) in tokenTypes", :key="key", :value="~~key") {{ $lang(item) }}
      Divider {{ $lang('基础配置') }}
      FormItem(:label="$lang('币种简称')")
        Tag(v-if="formData.id") {{ formData.tokenName }}
        Input(
          size="default",
          v-model="formData.tokenName",
          v-else,
          placeholder="tokenName"
        )
      FormItem(:label="$lang('币种全称')")
        Input(
          size="default",
          v-model="formData.tokenFullName",
          placeholder="tokenFullName"
        )
      FormItem(:label="$lang('公允价值')")
        Input(
          size="default",
          v-model="formData.fairValue",
          placeholder="fairValue"
        )
          span(slot="append") USDT
        div {{ $lang('token的市场价值') }}
      FormItem(:label="$lang('标识')")
        Input(
          size="default",
          v-model="formData.iconUrl",
          placeholder="iconUrl"
        )
          Upload(
            slot="suffix",
            action="/api/v1/storage/file/image",
            name="uploadFile",
            :on-success="uploadSuccess",
            :beforeUpload="beforeUpload",
            :show-upload-list="false"
          )
            Icon(type="md-cloud-upload", v-show="!uploading")
            Icon.spin-icon-load(type="ios-loading", v-show="uploading")
        div {{ $lang('建议使用44*44的png格式透明图') }}
      FormItem(:label="$lang('合约地址')", v-if="formData.tokenType != 1")
        Input(
          size="default",
          v-model="formData.contractAddress",
          placeholder="contractAddress"
        )
      FormItem(:label="$lang('白皮书地址')")
        Input(
          size="default",
          v-model="formData.whitePaperUrl",
          placeholder="whitePaperUrl"
        )
      FormItem(:label="$lang('当前流通量')")
        Input(
          size="default",
          v-model="formData.currentTurnover",
          placeholder="currentTurnover"
        )
      FormItem(:label="$lang('官网')")
        Input(
          size="default",
          v-model="formData.officialWebsiteUrl",
          placeholder="officialWebsiteUrl"
        )
      FormItem(:label="$lang('最大发行量')")
        Input(
          size="default",
          v-model="formData.maxQuantitySupplied",
          placeholder="maxQuantitySupplied"
        )
      FormItem(:label="$lang('发行时间')")
        DatePicker(
          type="date",
          :value="formData.publishTime",
          placeholder="publishTime",
          @on-change="changeTime",
          style="width: 100%"
        )
      Divider {{ $lang('token介绍') }}
      Alert
        Checkbox(
          v-for="(item, index) in introductions",
          v-model="item.enable",
          :key="index"
        ) {{ lang[item.language] }}
      FormItem(
        :label="lang[item.language]",
        v-for="(item, index) in introductions",
        :key="'a' + index",
        v-if="item.enable"
      )
        Input(v-model="item.content", type="textarea", :rows="5")

      Divider {{ $lang('充值/提现配置') }}
      FormItem(:label="$lang('最小充币数量')")
        Input(
          size="default",
          v-model="formData.minDepositingAmt",
          placeholder="minDepositingAmt"
        )
          span(slot="append") {{ formData.tokenId }}
        div {{ $lang('充币资产价值不能小于5$') }}
      FormItem(:label="$lang('最小提币数量')")
        Input(
          size="default",
          v-model="formData.minWithdrawingAmt",
          placeholder="minWithdrawingAmt"
        )
          span(slot="append") {{ formData.tokenId }}
        div {{ $lang('提币资产价值不能小于15$') }}
      Button(
        type="primary",
        size="default",
        long,
        @click="handleTabsAdd",
        :loading="loading"
      ) {{ $lang('申请') }}
</template>
<script>
import { mapState } from "vuex";
export default {
  created() {
    this.load(1);
  },
  computed: {
    ...mapState(["lang", "isRead"]),
  },
  data() {
    return {
      tokenTypes: {
        1: "主网代币",
        2: "ETH代币",
        4: "EOS代币",
        10: "TRX代币",
        11: "NEO代币",
        12: "HECO代币",
        13: "BSC代币",
        14: "SPL代币",
        15: "CHZ链代币",
        16: "CCHAIN代币",
      },
      uploading: false,
      addWin: false,
      introductions: [],
      formData: {
        id: "",
        tokenType: 2,
        tokenId: "",
        tokenName: "",
        tokenFullName: "",
        fairValue: "",
        iconUrl: "",
        contractAddress: "",
        introduction: "",
        minDepositingAmt: "",
        minWithdrawingAmt: "",
        brokerWithdrawingFee: "",
        maxWithdrawingAmt: "",
        maxQuantitySupplied: "",
        currentTurnover: "",
        officialWebsiteUrl: "",
        whitePaperUrl: "",
        publishTime: "",
        introductions: [],
      },
      loading: false,
      current: 0,
      searchForm: {
        current: 1,
        pageSize: 100,
        tokenId: "",
        category: 1,
      },
      total: 0,
      listData: [],

      columns: [
        {
          minWidth: 160,
          title: this.$lang("币种ID"),
          key: "tokenId",
        },
        {
          minWidth: 160,
          title: this.$lang("币种简称"),
          key: "tokenName",
        },
        {
          minWidth: 160,
          title: this.$lang("币种全称"),
          key: "tokenFullName",
        },
        {
          minWidth: 160,
          title: this.$lang("标识"),
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.iconUrl,
                width: 40,
                style: "padding:5px;",
              },
            });
          },
        },
        {
          minWidth: 160,
          title: this.$lang("最小充值"),
          key: "minDepositingAmt",
        },
        {
          minWidth: 160,
          title: this.$lang("最小提币"),
          key: "minWithdrawingAmt",
        },
        {
          minWidth: 160,
          title: this.$lang("状态"),
          key: "state",
          render: (h, params) => {
            let color = "default";
            let text = "申请中";
            if (params.row.state === 1) {
              color = "primary";
              text = "已通过";
            } else if (params.row.state === 2) {
              color = "error";
              text = "已拒绝";
            }
            return h(
              "Tag",
              {
                attrs: {
                  color,
                },
              },
              this.$lang(text)
            );
          },
        },
        {
          minWidth: 100,
          title: this.$lang("操作"),
          align: "center",
          fixed: "right",
          render: (h, params) => {
            if (params.row.state === 0) {
              return h("span", "----");
            }
            return h(
              "a",
              {
                on: {
                  click: () => {
                    this.edit(params.row.tokenId);
                  },
                },
              },
              this.$lang("修改")
            );
          },
        },
      ],
    };
  },
  methods: {
    changeTime(date) {
      this.formData.publishTime = date;
    },
    edit(tokenId) {
      this.addWin = true;
      this.initFormData();
      this.$axios
        .get("/api/v1/token/apply_record?tokenId=" + tokenId)
        .then((result) => {
          if (result.code == 0) {
            Object.assign(this.formData, result.data);
            result.data.introductions.forEach((el) => {
              this.introductions.forEach((_el) => {
                if (el.language == _el.language) {
                  Object.assign(_el, el);
                }
              });
            });
          }
        });
    },
    initFormData() {
      Object.keys(this.formData).forEach((el) => {
        this.formData[el] = "";
      });
      this.formData.tokenType = 2;
      this.formData.maxQuantitySupplied = 0;
      this.formData.currentTurnover = 0;
      this.introductions = [];

      Object.keys(this.lang).forEach((el) => {
        this.introductions.push({
          content: "",
          language: el,
          enable: el === this.$i18n.locale,
        });
      });
    },
    uploadSuccess(result) {
      this.uploading = false;
      if (result.code != 0) {
        return;
      }
      this.$Notice.success({
        title: this.$lang("成功"),
      });
      this.formData.iconUrl = result.data.url;
    },
    beforeUpload() {
      this.uploading = true;
    },
    handleBtnAdd() {
      this.addWin = true;
      this.initFormData();
    },
    handleTabsAdd() {
      let json = Object.assign({}, this.formData);
      if (this.formData.tokenId) {
        json.tokenId = this.formData.tokenId.toLocaleUpperCase();
      }
      this.formData.introductions = this.introductions;
      !this.loading &&
        this.$axios
          .post("/api/v1/token/token_apply", this.formData)
          .then((result) => {
            this.loading = false;
            if (result.code === 0) {
              this.addWin = false;
              this.$Notice.success({
                title: this.$lang(this.formData.id ? "修改成功" : "申请成功"),
              });
              this.load(1);
            }
          });
      this.loading = true;
    },
    load(page) {
      this.loading = true;
      this.searchForm.current = page;
      this.$axios
        .get("/api/v1/token/apply_list", { params: this.searchForm })
        .then((result) => {
          this.loading = false;
          this.listData = result.data.list ? result.data.list : [];
          this.total = result.data.total;
        });
    },
  },
};
</script>
