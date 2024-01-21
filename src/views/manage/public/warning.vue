<style lang="less" scoped>
.view {
  padding: 24px;
  width: 480px;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0px 7px 8px rgba(0, 0, 0, 0.2), 0px 5px 22px rgba(0, 0, 0, 0.12),
    0px 12px 17px rgba(0, 0, 0, 0.14);
  border-radius: 4px;
}
.desc {
  font-weight: 400;
  color: #50555b;
  line-height: 20px;
  padding-bottom: 20px;
  text-align: justify;
}
</style>
<template lang="pug">
div
  Alert {{ $lang('首页风险提示弹窗') }}。
    iSwitch(
      size="small",
      v-model="formData2.value",
      :loading="pageLoading",
      true-value="true",
      false-value="false"
    )
    | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    a(
      href="https://xxxxx.zendesk.com/hc/zh-cn/articles/360039623953",
      target="_blank"
    ) {{ $lang('操作说明') }}

  Card(:title="$lang('选择IP禁止访问的国家或地区')", dis-hover, style="margin-top: 15px")
    template(slot="extra")
      Button(size="small", @click="onekey", type="success") {{ $lang('一键选取系统推荐列表') }}
      | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      Checkbox(
        :indeterminate="indeterminate",
        :value="checkAll",
        @click.prevent.native="handleCheckAll"
      ) {{ $lang('全选') }}
    CheckboxGroup(
      v-model="countries.value",
      @on-change="checkAllGroupChange",
      v-show="more"
    )
      Checkbox(
        :label="item.id",
        v-for="item in areaList",
        :key="item.id",
        border,
        style="margin-bottom: 10px"
      ) {{ item.countryName }}
      Button(@click="more = false", icon="ios-arrow-up") {{ $lang('收起') }}
    CheckboxGroup(
      v-model="countries.value",
      @on-change="checkAllGroupChange",
      v-show="!more"
    )
      Checkbox(
        :label="item.id",
        v-for="(item, index) in areaList",
        :key="item.id",
        border,
        style="margin-bottom: 10px",
        v-if="index < 30"
      ) {{ item.countryName }}
      Button(@click="more = true", icon="ios-more") {{ $lang('更多') }}

  Alert(style="margin-top: 15px")
    Checkbox(
      v-for="item in formData.value",
      v-model="item.enabled",
      :key="item.language"
    ) {{ lang[item.language] }}

  Card(
    :title="lang[item.language]",
    v-for="(item, index) in formData.value",
    :key="'c' + item.language",
    dis-hover,
    style="margin-top: 15px",
    v-if="item.enabled"
  )
    Row(:gutter="20")
      Col(span="12")
        Input(
          v-model="item.description",
          type="textarea",
          :rows="12",
          :placeholder="$lang('补充说明文案')"
        )
        Alert 
          | 1.
          strong #country# 
          | {{$lang("国家所在地区名称")}}
      Col(span="12")
        .view(v-if="item.description")
          .desc(v-html="formatText(item.description)")
        List(:header="$lang('建议文案')", v-else)
          ListItem
            Alert(type="warning")
              | 尊敬的用户<br><br>
              | {{ brokerName }}平台严格遵守各个国家地区的法律法规。依据#country#对加密资产的法规，{{ brokerName }}平台当前无法对#country#用户提供服务。请确认本人不是#country#公民或者纳税居民，并愿意自己承担相应法律责任。
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading", loading, long) {{ $lang('加载中') }}
        Button(
          @click="submit",
          :loading="loading",
          :disabled="loading",
          type="primary",
          long,
          v-else
        ) {{ $lang('保存') }}
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      pageLoading: false,

      indeterminate: true,
      checkAll: false,
      loading: false,
      more: false,
      areaList: [],

      formData: {
        group: 'custom.config.group',
        key: 'cust.indexWarning',
        value: [],
      },
      formData2: {
        group: 'custom.config.group',
        key: 'cust.indexWarningStatus',
        value: 'false',
      },

      countries: {
        group: 'custom.config.group',
        key: 'indexWarning.countries',
        value: [],
      },
    }
  },
  computed: {
    ...mapState(['lang', 'brokerName', 'isRead']),
  },
  methods: {
    onekey() {
      this.countries.value = [
        '1',
        '2',
        '62',
        '106',
        '112',
        '117',
        '17',
        '19',
        '120',
        '72',
        '45',
        '36',
        '180',
        '191',
      ]
    },
    handleCheckAll() {
      if (this.indeterminate) {
        this.checkAll = false
      } else {
        this.checkAll = !this.checkAll
      }
      this.indeterminate = false

      if (this.checkAll) {
        this.countries.value = this.areaList.map((el) => el.id)
      } else {
        this.countries.value = []
      }
    },
    checkAllGroupChange(data) {
      if (data.length === this.areaList.length) {
        this.indeterminate = false
        this.checkAll = true
      } else if (data.length > 0) {
        this.indeterminate = true
        this.checkAll = false
      } else {
        this.indeterminate = false
        this.checkAll = false
      }
    },

    formatText(text) {
      return text
        .replace(/\n/g, '<br>')
        .replace(/#country#/g, '<strong><a>新加坡</a></strong>')
    },

    loadIndexWarning() {
      return this.$axios.post(
        '/api/v1/broker/config/common_config/get_aggerate_config',
        this.formData
      )
    },

    loadIndexWarningStatus() {
      return this.$axios.post(
        '/api/v1/broker/config/common_config/get_config',
        this.formData2
      )
    },

    loadCountries() {
      return this.$axios.post(
        '/api/v1/broker/config/common_config/get_config',
        this.countries
      )
    },

    saveCountries() {
      const json = { ...this.countries, value: this.countries.value.join(',') }

      return this.$axios.post(
        '/api/v1/broker/config/common_config/edit_config',
        json
      )
    },

    saveIndexWarning() {
      return this.$axios.post(
        '/api/v1/broker/config/common_config/edit_aggerate_config',
        this.formData
      )
    },

    saveIndexWarningStatus() {
      return this.$axios.post(
        '/api/v1/broker/config/common_config/edit_config',
        this.formData2
      )
    },

    load() {
      this.pageLoading = true
      this.$axios
        .all([
          this.loadIndexWarning(),
          this.loadIndexWarningStatus(),
          this.loadCountries(),
        ])
        .then((result) => {
          this.pageLoading = false
          let [warning, status, countries] = result
          if (warning.code == 0) {
            Object.keys(this.lang).forEach((lang, index) => {
              let arr = warning.data.value.filter((el) => el.language === lang)
              let json = {
                enabled: index === 0,
                language: lang,
                description: '',
              }
              if (arr.length) {
                Object.assign(json, arr[0])
              }
              this.formData.value.push(json)
            })
          }

          if (status.code == 0 && status.data) {
            this.formData2.value = status.data.value
          }

          if (countries.code == 0 && countries.data) {
            this.countries.value = countries.data.value.split(',')
          }
        })
    },
    submit() {
      this.loading = true

      this.$axios
        .all([
          this.saveIndexWarning(),
          this.saveIndexWarningStatus(),
          this.saveCountries(),
        ])
        .then((result) => {
          this.loading = false
          let [warning, status] = result
          if (warning.code == 0 && status.code == 0) {
            this.$Notice.success({
              title: this.$lang('成功'),
            })
          }
        })
    },
  },
  created() {
    this.$axios.get('/api/v1/country_v2/list').then((result) => {
      this.areaList = result.data
    })
    this.load()
  },
}
</script>
