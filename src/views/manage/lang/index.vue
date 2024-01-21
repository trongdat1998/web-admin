<style lang="less" scoped>
.item {
  padding-top: 5px;
  padding-bottom: 5px;
  border-top: 1px solid #f1f1f1;
  height: auto;
  zoom: 1;
  display: flex;
  overflow: hidden;
  align-items: center;
  &:nth-child(odd) {
    background: rgba(150, 150, 150, 0.1);
  }
  .col {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
<template lang="pug">
Main.page-exchange
  Tabs(:animated="false", v-model="tab", @on-click="tabPane")
    TabPane(
      :label="$lang(item.name)",
      v-for="item in types",
      :key="item.name",
      :name="item.tab"
    )
    Button(
      :to="clouldUrl",
      slot="extra",
      type="primary",
      v-if="isRoot",
      target="_blank"
    ) {{ $lang('云语言') }}
  .search
    Row(:gutter="10")
      Col(span="4")
        Select(v-model="packType", @on-change="changePackType")
          Option(border, value="user") {{ $lang('自定义') }}
          Option(border, value="bhpc") {{ $lang('云系统') }}
      Col(span="4")
        Button(
          ghost,
          @click="editKeyConfirmWin = true",
          type="error",
          :disabled="pageLoading || packType == 'bhpc'",
          long
        ) {{ $lang('标识管理') }}
      Col(span="4")
        Button(
          ghost,
          long,
          type="success",
          @click="showBatEdit",
          :disabled="pageLoading"
        ) {{ $lang('批量编辑') }}
      Col(span="10")
        AutoComplete(
          placement="bottom-end",
          transfer,
          :placeholder="`${$lang('使用标识')} / ${$lang('修改语言')} / ${$lang('参照语言')}`",
          v-model="searchKeyword",
          @on-select="search"
        )
          Option(
            v-for="item in AutoCompleteList",
            :value="item",
            :key="item",
            v-html="formatStr(item)"
          ) 
      Col(span="2")
        Button(type="primary", long, icon="ios-search", @click="search()")
    Divider(size="small", style="margin:10px 0")
    Row(:gutter="10")
      Col(span="6")
        Button(
          long,
          icon="md-checkbox",
          @click="changeKeyStatus",
          :type="isKey ? 'primary' : 'default'"
        ) {{ $lang('使用标识') }}
      Col(span="6")
        Button(
          long,
          icon="md-checkbox",
          @click="changeReferStatus",
          :type="isRefer ? 'primary' : 'default'"
        ) {{ $lang('使用参照') }}
      Col(span="6")
        Button(
          long,
          icon="md-checkbox",
          @click="changeReplaceStatus",
          :type="isReplace ? 'primary' : 'default'",
          :disabled="packType === 'user'"
        ) {{ $lang('修改过的翻译') }}
      Col(span="6")
        Button(
          long,
          icon="md-checkbox",
          @click="changeTransStatus",
          :type="unTrans ? 'primary' : 'default'",
          :disabled="isReplace && packType !== 'user'"
        ) {{ $lang('未翻译') }}（{{ $lang(packType === 'user' ? '自定义' : '云系统') }}）

  .item(style="padding-bottom:20px;border:none")
    .col.ivu-col-span-8(v-if="isKey")
      h3 {{ $lang('唯一标识') }}: {{ $lang('系统使用不可修改') }}
    .col.ivu-col-span-8(v-if="isRefer")
      Select(size="small", v-model="referLang", @on-change="getReferData")
        Option(
          v-for="item in supportLanguages",
          :value="item.language",
          :key="item.language"
        ) {{ $lang('参照语言') }} - {{ item.showName }}
    .col(:class="isRefer && isKey ? 'ivu-col-span-8' : 'ivu-col-span-16'")
      Select(size="small", v-model="editLang", @on-change="changeLang")
        Option(
          v-for="item in supportLanguages",
          :value="item.language",
          :key="item.language"
        ) {{ $lang('修改语言') }} - {{ item.showName }}
  .item(v-for="key in sliceData")
    .col.ivu-col-span-8(v-if="isKey") {{ key }}
    .col.ivu-col-span-8(
      v-if="isRefer",
      v-html="html(referValues[key]) || $lang('当前语言未配置')"
    )
    .col.ivu-col-span-1
      // 用户新增或修改了翻译
      Tag(
        v-if="userAllValues[key] && bhexValues[key] != userAllValues[key]",
        color="success"
      ) U
      // 系统未翻译。
      Tag(v-else-if="!bhexValues[key] && packType === 'bhpc'", color="error") N
      // 系统使用了非标准翻译。
      Tag(
        v-else-if="bhexKeys[key] === userAllValues[key] && editLang !== 'en-us'",
        color="primary"
      ) D
      // 系统标准翻译
      Tag(v-else, color="warning") S
    .col(:class="isRefer && isKey ? 'ivu-col-span-7' : 'ivu-col-span-15'")
      textarea.ivu-input.ivu-input-small(
        v-model="userAllValues[key]",
        :placeholder="referValues[key] || userAllKeys[key]",
        :rows="userAllValues[key] && userAllValues[key].length > 35 ? Math.floor(userAllValues[key].length / 35) : 1"
      )
  Divider(size="small", style="margin:10px 0")
  Page(
    :total="listData.length",
    :page-size="pageSize",
    @on-change="changePage",
    v-if="listData.length > pageSize",
    :current="currentPage"
  )
  Fixed
    Row(:gutter="20")
      Col(span="5")
        Tag(color="error") N {{ $lang('系统未翻译') }}
      Col(span="5")
        Tag(color="primary") D {{ $lang('系统使用了非标准翻译') }}
      Col(span="5")
        Tag(color="success") U {{ $lang(packType === 'user' ? '用户新增的翻译' : '用户修改的翻译') }}
      Col(span="5")
        Tag(color="warning") S {{ $lang('系统标准翻译') }}
      Col(span="4")
        Button(v-if="pageLoading", loading, long) {{ $lang('加载中') }}
        Button(
          :loading="loading",
          :disabled="loading || isRead",
          type="primary",
          long,
          @click="submit",
          v-else
        ) {{ $lang('保存') }}
  Modal(v-model="editKeyWin", :title="$lang('标识管理')", footer-hide, width="600")
    p(style="padding-bottom:15px") {{ $lang('标识建议使用英文简写方式，保持唯一性') }} ：
      em
        strong {{ $lang('业务') }}-{{ $lang('类型') }}-{{ $lang('子类') }}-{{ $lang('描述') }}<br>
      Alert(style="margin-top:10px")
        Row(:gutter="15")
          Col(span="12")
            strong 1、 activity.invitation.common.title<br>
          Col(span="12")
            strong 2、 activity_invitation_common_title<br>
          Col(span="12")
            strong 3、 activityInvitationCommonTitle<br>
          Col(span="12")
            strong 4、 activity-invitation-common-title<br>
    Input(
      :placeholder="$lang('每行对应一个唯一标识')",
      v-model="keyText",
      type="textarea",
      :rows="10"
    )
    Button(
      type="primary",
      style="margin-top:20px",
      long,
      @click="saveKey",
      :loading="loading",
      :disabled="loading || isRead"
    ) {{ $lang('确定') }}

  Modal(v-model="batEditWin", :title="$lang('批量修改')", footer-hide, width="600")
    Alert(type="error") {{ $lang('批量处理需要相关专业人员操作，请谨慎操作。') }}
    Input(
      :placeholder="$lang('批量处理需要相关专业人员操作，请谨慎操作。')",
      v-model="batText",
      type="textarea",
      :rows="10"
    )
    Divider(size="small")
    Checkbox(
      v-model="useRefer",
      border,
      :disabled="referLang === editLang",
      @on-change="showBatEdit"
    ) {{ $lang('空值补全为参照语言') }}
    Button(
      type="primary",
      style="margin-top:20px",
      long,
      @click="batEdit",
      :disabled="isRead"
    ) {{ $lang('确定') }}

  Modal(v-model="editKeyConfirmWin", width="360")
    p(slot="header", style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{ $lang('提示') }}
    p {{ $lang('标识管理会引起页面刷新，请先保存数据后，再进行操作。') }}
    div(slot="footer")
      Button(type="warning", long, @click="configEditKey") {{ $lang('我已保存，继续') }}
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      useRefer: false,
      packType: sessionStorage.packType == 'user' ? 'user' : 'bhpc',
      isKey: sessionStorage.isKey == 'false' ? false : true,
      isRefer: sessionStorage.isRefer == 'false' ? false : true,
      isReplace: sessionStorage.isReplace === 'true' ? true : false,
      unTrans: sessionStorage.unTrans === 'true' ? true : false,

      batEditWin: false,
      batText: '',
      editKeyWin: false,
      editKeyConfirmWin: false,
      keyText: '',
      types: [
        {
          tab: 'exchange',
          name: '币币模块',
        },
        {
          tab: 'otc',
          name: '法币模块',
        },
        {
          tab: 'mobile',
          name: 'M站',
        },
        {
          tab: 'adminBroker',
          name: '管理后台Broker',
        },
      ],
      tab: this.$route.query.tab || 'exchange',
      pageLoading: false,
      loading: false,
      userAllKeys: {},
      bhexKeys: {},

      referLang: 'en-us',
      referValues: {},
      referDefaultData: {},

      userValues: {},
      bhexValues: {},
      userAllValues: {},
      bakUserAllValues: {},

      userKeys: {},
      editLang: this.$route.query.modify || 'en-us',
      currentPage: 1,
      pageSize: 50,
      searchKeyword: '',
      listData: [],
    }
  },
  computed: {
    ...mapState(['lang', 'supportLanguages', 'menuMini', 'isRoot', 'isRead']),
    AutoCompleteList() {
      const list = []

      Object.keys(this.packType == 'bhpc' ? this.bhexKeys : this.userKeys)
        .sort()
        .forEach((el) => {
          if (this.searchKeyword) {
            const searchKeyword = this.searchKeyword.toLocaleLowerCase()
            const userValue = this.userAllValues[el] || ''
            const referValue = this.referValues[el] || ''

            if (this.computefilter(el)) {
              if (el.toLocaleLowerCase().indexOf(searchKeyword) > -1) {
                list.push(el)
              } else if (
                userValue.toLocaleLowerCase().indexOf(searchKeyword) > -1
              ) {
                list.push(userValue)
              } else if (
                referValue.toLocaleLowerCase().indexOf(searchKeyword) > -1
              ) {
                list.push(referValue)
              }
            }
          }
        })
      list.length = Math.min(list.length, 10)
      return list
    },
    clouldUrl() {
      return '/manage/cloud-lang' + location.search
    },
    sliceData() {
      return this.listData.slice(
        (this.currentPage - 1) * this.pageSize,
        this.currentPage * this.pageSize
      )
    },
  },
  methods: {
    search(val) {
      this.currentPage = 1
      const searchKeyword = val || this.searchKeyword
      this.listData = Object.keys(
        this.packType == 'bhpc' ? this.bhexKeys : this.userKeys
      )
        .sort()
        .filter((el) => {
          if (searchKeyword) {
            const keyword = searchKeyword.toLocaleLowerCase()
            const userValue = this.userAllValues[el] || ''
            const referValue = this.referValues[el] || ''
            return (
              this.computefilter(el) &&
              (el.toLocaleLowerCase().indexOf(keyword) > -1 ||
                userValue.toLocaleLowerCase().indexOf(keyword) > -1 ||
                referValue.toLocaleLowerCase().indexOf(keyword) > -1)
            )
          }
          return this.computefilter(el)
        })
    },
    formatStr(str = '') {
      return `${str.substring(0, Math.min(70, str.length))}${
        str.length > 70 ? ' ...' : ''
      }`.replace(
        new RegExp(this.searchKeyword.trim(), 'gi'),
        `<strong style=color:red>${this.searchKeyword}</strong>`
      )
    },
    changePage(n) {
      this.currentPage = n
    },
    html(str) {
      if (/^http(.*?)(\.jpg|\.png)$/.test(str)) {
        return ['<img src="', str, '" Width="100%">'].join('')
      } else {
        return str
      }
    },
    changePackType() {
      sessionStorage.packType = this.packType
    },

    changeTransStatus() {
      this.currentPage = 1
      this.unTrans = !this.unTrans
      sessionStorage.unTrans = this.unTrans
    },

    changeReplaceStatus() {
      this.currentPage = 1
      this.isReplace = !this.isReplace
      sessionStorage.isReplace = this.isReplace
    },

    changeReferStatus() {
      this.isRefer = !this.isRefer
      sessionStorage.isRefer = this.isRefer
    },

    changeKeyStatus() {
      this.isKey = !this.isKey
      sessionStorage.isKey = this.isKey
    },
    computefilter(key) {
      if (this.packType === 'user') {
        if (this.unTrans) {
          return !this.bakUserAllValues[key]
        } else {
          return typeof this.bhexKeys[key] === 'undefined'
        }
      } else {
        if (this.isReplace) {
          return this.bakUserAllValues[key] != this.bhexValues[key]
        } else if (this.unTrans) {
          if (this.editLang === 'en-us') {
            return !this.bhexValues[key]
          } else {
            return (
              !this.bhexValues[key] ||
              this.bhexValues[key] === this.bhexKeys[key]
            )
          }
        } else {
          return true
        }
      }
    },
    changeLang(lang) {
      location.href = `/manage/lang?modify=${lang}&tab=${this.tab}`
    },
    tabPane(tab) {
      location.href = `/manage/lang?modify=${this.editLang}&tab=${tab}`
    },
    showBatEdit() {
      this.batEditWin = true

      let json = {}

      this.listData.forEach((el) => {
        json[el] = this.useRefer
          ? this.userAllValues[el] || this.referValues[el]
          : this.userAllValues[el]
      })

      this.batText = JSON.stringify(json)
        .split('","')
        .join('",\n"')
    },
    batEdit() {
      this.batText = this.batText.trim()
      let json = {}
      try {
        json = JSON.parse(this.batText)
        this.listData.forEach((el) => {
          if (json[el]) {
            this.userAllValues[el] = json[el].trim()
          }
        })
        this.batEditWin = false
      } catch (e) {
        this.$Notice.error({
          title: 'SyntaxError',
          desc: e,
          duration: 0,
        })
      }
    },
    saveKey() {
      let json = {}
      this.loading = true
      this.keyText
        .trim()
        .split('\n')
        .forEach((el) => {
          let temp = el.trim()
          json[temp] = this.userAllKeys[temp] || ''
        })

      //防数据丢失：如果一输入框内容做为标准新建key，会丢失原来部分需要覆盖的英文，所以做一次数据补偿处理。
      Object.keys(this.userKeys).forEach((el) => {
        if (typeof this.bhexKeys[el] !== 'undefined' && this.userKeys[el]) {
          json[el] = this.userKeys[el]
        }
      })
      this.$axios
        .post('/api/v1/broker/language/config_language', {
          language: 'en-us',
          tab: this.tab,
          json: JSON.stringify(json),
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            location.reload()
          }
        })
    },
    submit() {
      this.loading = true
      let json = {}

      Object.keys(this.userAllKeys).forEach((el) => {
        if (this.userAllValues[el] !== this.bhexValues[el]) {
          json[el] = this.userAllValues[el] || this.userAllKeys[el]
        }
      })

      this.$axios
        .post('/api/v1/broker/language/config_language', {
          language: this.editLang,
          tab: this.tab,
          json: JSON.stringify(json),
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            location.reload()
          }
        })
    },

    configEditKey() {
      this.editKeyConfirmWin = false
      this.editKeyWin = true
      let json = {}
      Object.keys(this.userKeys)
        .sort()
        .forEach((el) => {
          if (typeof this.bhexKeys[el] === 'undefined') {
            json[el] = el
          }
        })
      this.keyText = Object.keys(json).join('\n')
    },

    getDefaultLang(language, type) {
      return this.$axios.post(
        '/api/v1/broker/language/get_default_language_config?type=' + type,
        { language: language, tab: this.tab }
      )
    },

    getUserLang(language, type) {
      return this.$axios.post(
        '/api/v1/broker/language/get_language_config?type=' + type,
        {
          language: language,
          tab: this.tab,
        }
      )
    },

    // 参照语言
    getReferData() {
      this.$axios
        .all([
          this.getDefaultLang(this.referLang, 'refer'),
          this.getUserLang(this.referLang, 'refer'),
        ])
        .then((result) => {
          if (result[0].code == 0 && result[1].code == 0) {
            // 清空参照语言
            Object.keys(this.referValues).forEach((el) => {
              this.referValues[el] = ''
            })

            //合并默认数据，用户数据到初始编辑数据
            Object.assign(
              this.referValues,
              JSON.parse(result[0].data),
              JSON.parse(result[1].data)
            )
          }
        })
    },
  },

  created() {
    this.pageLoading = true
    //基础Key语言
    this.$axios
      .all([
        this.getDefaultLang('en-us', 'default'),
        this.getUserLang('en-us', 'default'),

        //要修改的语言
        this.getDefaultLang(this.editLang, 'edit'),
        this.getUserLang(this.editLang, 'edit'),
      ])
      .then((result) => {
        this.pageLoading = false

        if (
          result[0].code == 0 &&
          result[1].code == 0 &&
          result[2].code == 0 &&
          result[3].code == 0
        ) {
          /*
           *  初始化唯一标识
           */

          // bhex基础Key包
          this.bhexKeys = JSON.parse(result[0].data)

          // 用户自定义Key包
          this.userKeys = JSON.parse(result[1].data)

          // bhpc value 包
          this.bhexValues = JSON.parse(result[2].data)

          // 用户value包， 自定义Key的value，包含覆盖了bhex原翻译的value。
          this.userValues = JSON.parse(result[3].data)

          // 用户全量的Key包，（bhex基础Key包 + 用户自定义Key包）
          this.userAllKeys = Object.assign({}, this.bhexKeys, this.userKeys)

          //初始化参照语言，防止切换语言不变
          this.referValues = Object.assign({}, this.userAllKeys)

          // 用户全量的value包，（bhpc value 包 + 用户value包）
          let userAllValues = {}

          Object.keys(this.userAllKeys).forEach((key) => {
            userAllValues[key] =
              this.userValues[key] || this.bhexValues[key] || ''
            this.referValues[key] = ''
          })

          this.userAllValues = userAllValues

          // 用户全量values备份，用与筛选未翻译的的数据
          this.bakUserAllValues = Object.assign({}, this.userAllValues)

          this.getReferData()

          this.search()
        }
      })
  },
}
</script>
