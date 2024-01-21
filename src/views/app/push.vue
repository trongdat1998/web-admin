<style lang="less" scoped>
.top {
  margin-top: 12px;
}
.bottom {
  margin-bottom: 12px;
}
.switch {
  display: inline;
  margin-right: 24px;
}
.line-height {
  line-height: 32px;
}
.noBorder {
  outline: none;
  box-shadow: none;
  border: 0px;
}
</style>
<template lang="pug">
Main.page-exchange
  div(v-if="showList")
    Card.bottom(dis-hover)
      div
        span {{ switchStatus ? $lang("当前Push功能已启用") : $lang("当前Push功能未启用，请联系CSM服务人员配置相关信息后开通功能") }}
        Button.noBorder(size="small" type="primary", ghost, to="https://xxxxx.zendesk.com/hc/zh-cn/articles/360051990854" target="_blank") {{$lang('PUSH功能说明帮助文档')}} >>
      div.top
        Row(:gutter="15")
          Col(span="22")
            span.line-height {{ $lang("通知场景") }}：
            span {{customStatus ? $lang("自定义运营消息 已开启") : $lang("自定义运营消息 未开启") }}
        Row(:gutter="15")
          Col(span="22")
            div.switch(v-for="(item, key, index) in iSwitch" :key="index")
              span.line-height(style="margin-right:6px") {{ item }}
              iSwitch(:disabled="isRead || !switchStatus" size="small" v-model="groups[key]" true-value="true" false-value="false" @on-change="editConfig(key)" :loading="loading")
    Modal(v-model="confirmWin" :title="$lang('您确定要执行此操作吗？')" width="300" @on-cancel="confirmForm.key = ''")
      p {{$lang(confirmForm.value==="true"?"开启":"关闭")}} {{iSwitch[confirmForm.key]}} {{$lang("通知")}}
      Button(slot="footer" long type="error" @click="doSwitch" :loading="loading" :disabled="loading") {{$lang('确定')}}
    Row.search(:grtter="15")
      Col(span="20") &nbsp;
      Col(span="4")
        Button(type="primary" ghost, @click="create" icon="md-add-circle" long, :disabled="isRead || !customStatus") {{$lang("新建")}}
    Table(:columns="columns", :data="listData", :loading="loadingTable")
      template(slot-scope="{row, index}" slot="action")
        template()
          a(@click.prevent="searchDetail(row)" v-if="row.status != 0") {{$lang("查看")}}
          span(v-if="row.status != 0") &nbsp;&nbsp;
          a(@click.prevent="editDetail(row)" v-if="row.status == 0 || row.status == 2" :disabled="isRead") {{$lang("修改")}}
          span &nbsp;&nbsp;
          a(@click.prevent="cancelModel(row)", v-if="row.status == 0" :disabled="cancelLoading || isRead") {{$lang("取消")}}
    Row(:gutter="20" style="padding-top:30px")
      Col(span="10")
        ButtonGroup
          Button(icon="ios-skip-backward" @click="prev"  :disabled="searchForm.endTime == '0'")
          Button(icon="ios-arrow-forward" @click="next"  :disabled="listData.length<searchForm.limit")
    Modal(v-model="cancelWin" :title="$lang('您确定要执行此操作吗？')" width="300")
      p {{$lang("取消发送")}}
      Button(slot="footer" long type="error" @click="cancelTag" :loading="loading" :disabled="loading") {{$lang('确定')}}
  div(v-if="!showList")
    div
      Button.bottom(@click="goBack")  {{$lang('返回')}}
    Form(:label-width="120")
      Row
        Col.top(span="10")
          FormItem(:label="$lang('推送任务名称')")
            Input(v-model='formData.name', :placeholder="$lang('输入推送任务名称，40字以内')" )
          FormItem(:label="$lang('选择推送用户')")
            Select(v-model="formData.rangeType")
              Option(:value="1") {{$lang('全部')}}
              Option(:value="9") {{$lang('指定UID')}}
          FormItem(:label="$lang('UID')" v-if="formData.rangeType === 9")
            Input(v-model='formData.userIds', type="textarea" :rows="4" :placeholder="$lang('每行1个UID，回车换行，最多支持1000个')" )
        Col.top(span="10")
          FormItem(:label="$lang('推送时间')")
            DatePicker(format="yyyy/MM/dd HH:mm:ss" type="datetime" style="width:100%" v-model="times" :placeholder="$lang('可选15分钟至一周')" :options="options")
          FormItem(:label="$lang('默认语言')")
            Select(v-model="formData.defaultLocale")
              Option(value="empty") {{$lang('不设置')}}
              Option(v-for="(value, key, index) in lang" :value="key" :key="index") {{value}}
    Alert
      Checkbox(v-for="item in list", v-model="item.enabled", :key="item.language" :disabled="type === 'search'", @on-change="showTip") {{lang[item.language]}}
    Row(:gutter="15")
      Col(span="12" v-for="item,index in list" :key="'c'+item.language")
        Card.top(:title="lang[item.language]" dis-hover, v-if="item.enabled" style="margin-right:12px;")
          Form(:label-width="120")
            FormItem(:label="$lang('消息标题')")
              Input(v-model='item.pushContent.pushTitle', :placeholder="$lang('必填，默认为APP名称，40字以内')" )
            FormItem(:label="$lang('消息内容')")
              Input(v-model='item.pushContent.pushContent', type="textarea" :rows="4" :placeholder="$lang('消息内容，限制128字')" :maxlength="120")

            FormItem(:label="$lang('点击动作')")
              AutoComplete(v-model="item.pushContent.pushUrl")
                Option(v-for="(value, key, index) in pushUrlData" :value="key" :key="index") {{$lang(value)}}
              Tag(v-if="item.pushContent.pushUrl")
                template(v-if="/^Page=/.test(item.pushContent.pushUrl)") {{$lang('打开应用内页面')}} : {{pushUrlData[item.pushContent.pushUrl]?pushUrlData[item.pushContent.pushUrl]:pushUrlData['Page=']}}
                template(v-else) {{$lang('打开网页')}}
              Button.noBorder(v-if="index == tipIndex", size="small" type="primary", ghost, to="https://xxxxx.zendesk.com/hc/zh-cn/articles/360051990854" target="_blank" style="margin-top:6px ;float:right; font-size:12px") {{$lang('Push参数帮助')}}
            FormItem(:label="$lang('测试push通知')" v-if="type !== 'search'")
              Input(v-model='item.pushContent.userIds', type="textarea" :rows="4" :placeholder="$lang('每行1个UID，回车换行，支持多个uid测试push通知')" )
            div(style="text-align: center;" v-if="type !== 'search'")
              Row(:gutter="20")
                Col(span="18") &nbsp;
                Col(span="6")
                  Button.bottom(@click="testSend(item.language)" long type="primary" :loading="loading" :disabled="loading")  {{$lang('测试推送')}}
    Fixed(v-if="!isRead && type !== 'search'" style="border 1px solid #cdcdcd")
      Row(:gutter="20")
        Col(span="20") &nbsp;
        Col(span="4")
          Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
          Button(@click="saveData", :loading="loading" :disabled="loading" type="primary" long v-else) {{type === 'create' ? $lang('保存推送任务') : $lang('修改推送任务')}}
</template>
<script>
import { mapState } from 'vuex'
import { initData } from '@/libs/common.js'
export default {
  computed: {
    ...mapState(['isRead', 'lang']),
  },
  data() {
    return {
      options: {
        disabledDate(date) {
          let ret = date.valueOf()
          return ret < Date.now() - 86400000 || ret > Date.now() + 86400000 * 6
        },
      },
      tipIndex: '',
      switchStatus: false,
      customStatus: false,
      showList: true,
      confirmWin: false,
      loading: false,
      loadingTable: false,
      pageLoading: false,
      cancelLoading: false,
      cancelWin: false,
      currentRow: null,
      type: '',
      times: new Date(),
      list: [],
      formData: {
        rangeType: '',
        name: '',
        userIds: '',
        defaultLocale: '',
      },
      confirmForm: {
        value: '',
        key: '',
      },
      searchForm: {
        endTime: 0,
        limit: 20,
      },
      iSwitch: {
        assetChange: this.$lang('充提币&空投'),
        liquidation: this.$lang('永续合约预警信息'),
        kyc: this.$lang('KYC提醒信息'),
        otc: this.$lang('OTC交易提醒信息'),
        margin: this.$lang('杠杆交易相关提醒'),
      },
      groups: {
        assetChange: 'false',
        liquidation: 'false',
        kyc: 'false',
        otc: 'false',
        margin: 'false',
      },
      pushUrlData: {
        'Page=TABHOME': this.$lang('APP首页'),
        'Page=TABQUOTE': this.$lang('行情TAB页面'),
        'Page=TABTRADE': this.$lang('币币交易TAB页面'),
        'Page=TABFUTURES': this.$lang('合约交易TAB页面'),
        'Page=TABASSETS': this.$lang('资产TAB页面'),
        'Page=': this.$lang('自定义参数跳转'),
        'https://': this.$lang('网页'),
      },
      columns: [
        {
          title: this.$lang('任务ID'),
          key: 'taskId',
          minWidth: 100,
        },
        {
          title: this.$lang('推送时间'),
          minWidth: 180,
          key: 'actionTime',
          render: (h, params) =>
            h('span', this.newDate(params.row.actionTime).format()),
        },
        {
          title: this.$lang('更新时间'),
          minWidth: 180,
          key: 'updated',
          render: (h, params) =>
            h('span', this.newDate(params.row.updated).format()),
        },
        {
          title: this.$lang('任务名称'),
          key: 'name',
          minWidth: 100,
        },
        {
          title: this.$lang('拟发数'),
          key: 'sendCount',
          minWidth: 100,
        },
        /*{
          title: this.$lang("实发数"),
          key: "deliveryCount",
          minWidth: 100,
        },*/
        {
          title: this.$lang('点击数'),
          key: 'clickCount',
          minWidth: 100,
        },
        {
          title: this.$lang('状态'),
          minWidth: 100,
          render: (h, params) => {
            let msg = ''
            if (params.row.status == 0) {
              msg = '未开始'
            } else if (params.row.status == 1) {
              msg = '进行中'
            } else if (params.row.status == 2) {
              msg = '周期任务当前执行结束'
            } else if (params.row.status == 3) {
              msg = '已结束'
            } else if (params.row.status == 4) {
              msg = '取消'
            }
            let colors = {
              0: 'primary',
              1: 'warning',
              2: 'green',
              3: 'success',
              4: 'default',
            }
            return h(
              'Tag',
              {
                props: {
                  color: colors[params.row.status],
                },
              },
              this.$lang(msg)
            )
          },
        },
        {
          title: this.$lang('创建时间'),
          minWidth: 180,
          key: 'created',
          render: (h, params) =>
            h('span', this.newDate(params.row.created).format()),
        },
        {
          title: this.$lang('备注'),
          minWidth: 160,
          key: 'remark',
        },
        {
          title: this.$lang('操作'),
          minWidth: 100,
          slot: 'action',
          fixed: 'right',
        },
      ],
      listData: [],
    }
  },
  methods: {
    loadData() {
      this.loadingTable = true
      this.$axios
        .get('/api/v1/push/query/task_list', {
          params: this.searchForm,
        })
        .then((resp) => {
          this.loadingTable = false
          if (resp.code === 0) {
            this.listData = resp.data
          }
        })
    },
    prev() {
      this.searchForm.endTime = 0
      this.loadData()
    },
    next() {
      this.searchForm.endTime = this.listData.slice(-1)[0].updated
      this.loadData()
    },
    goBack() {
      this.showList = true
      this.loadData()
    },
    searchDetail(row) {
      this.type = 'search'
      this.getDetail(row)
    },
    editDetail(row) {
      this.type = 'edit'
      this.currentRow = row
      this.getDetail(row)
    },
    getDetail(row) {
      this.showList = false
      this.loading = true
      this.pageLoading = true
      this.$axios
        .get('/api/v1/push/query/task', {
          params: {
            taskId: row.taskId,
          },
        })
        .then((resp) => {
          this.loading = false
          this.pageLoading = false
          if (resp.code === 0) {
            this.times = new Date(Number(resp.data.firstActionTime))
            this.formData = {
              rangeType: resp.data.rangeType,
              name: resp.data.name,
              defaultLocale: resp.data.defaultLocale,
              userIds: resp.data.userIds.join('\n'),
            }
            if (
              resp.data &&
              resp.data.pushTaskLocaleDetails &&
              resp.data.pushTaskLocaleDetails.length
            ) {
              let language = []
              resp.data.pushTaskLocaleDetails.forEach((el) => {
                this.list.forEach((_el) => {
                  if (el.locale == _el.language) {
                    language.push(_el.language)
                    Object.assign(_el.pushContent, el)
                  }
                })
              })
              this.list.forEach((item) => {
                if (language.includes(item.language)) {
                  item.enabled = true
                } else {
                  item.enabled = false
                }
              })
            }
          }
        })
    },
    editConfig(key) {
      if (this.switchStatus == 'false') {
        this.$Notice.warning({
          title: this.$lang('开启不成功，请联系CSM服务人员配置相关信息'),
        })
      } else {
        this.confirmWin = true
        this.confirmForm.key = key
        this.confirmForm.value = this.groups[key]
      }
      setTimeout(() => {
        this.groups[key] = this.groups[key] === 'false' ? 'true' : 'false'
      }, 10)
    },
    create() {
      this.list = initData(
        this.lang,
        JSON.stringify({
          pushContent: {
            pushUrl: 'Page=',
          },
        })
      )
      this.formData = {
        rangeType: '',
        name: '',
        userIds: '',
      }
      this.times = new Date()
      this.showList = false
      this.type = 'create'
    },
    cancelModel(row) {
      this.cancelWin = true
      this.currentRow = row
    },
    cancelTag() {
      this.cancelLoading = true
      this.$axios
        .post('/api/v1/push/cancel/task', {
          taskId: this.currentRow.taskId,
        })
        .then(() => {
          this.cancelLoading = false
          this.cancelWin = false
          this.loadData()
        })
    },
    doSwitch() {
      let groups = this.groups
      let keys = []
      for (let key in groups) {
        if (groups[key] === 'true' && this.confirmForm.key !== key) {
          keys.push(key)
        } else if (
          this.confirmForm.value === 'true' &&
          this.confirmForm.key === key
        ) {
          keys.push(this.confirmForm.key)
        }
      }
      this.loading = true
      this.$axios
        .post('/api/v1/broker/config/common_config/edit_config', {
          group: 'app.push.config',
          key: 'orgBizGroup',
          value: keys.join(','),
        })
        .then(() => {
          this.loading = false
          this.confirmWin = false
          this.loadSwitchStatus()
        })
    },
    loadSwitchStatus() {
      this.loading = true
      this.$axios
        .post('/api/v1/broker/config/common_config/get_config', {
          group: 'app.push.config',
          key: 'orgBizGroup',
        })
        .then((resp) => {
          this.loading = false
          if (resp.code === 0 && resp.data && resp.data.value) {
            let open = resp.data.value.split(',')
            for (let key in this.groups) {
              if (open.includes(key)) {
                this.groups[key] = 'true'
              } else {
                this.groups[key] = 'false'
              }
            }
          }
        })
    },
    loadCustomSwitchStatus() {
      this.loading = true
      this.$axios
        .post('/api/v1/broker/config/common_config/get_config', {
          group: 'app.push.config',
          key: 'CUSTOM',
        })
        .then((resp) => {
          this.loading = false
          if (resp.code === 0 && resp.data && resp.data.value == 'true') {
            this.customStatus = true
          } else {
            this.customStatus = false
          }
        })
    },
    initSwitchStatus() {
      this.loading = true
      this.$axios
        .post('/api/v1/broker/config/common_config/get_config', {
          group: 'app.push.config',
          key: 'ALL_SITE',
        })
        .then((resp) => {
          this.loading = false
          if (resp.code === 0 && resp.data) {
            let value = resp.data.value
            if (value == 'true') {
              this.switchStatus = true
              this.loadSwitchStatus()
              this.loadCustomSwitchStatus()
            } else {
              this.switchStatus = false
            }
          }
        })
    },
    saveData() {
      let userIds = []
      if (this.formData.rangeType === 9) {
        let ids = this.formData.userIds.split('\n')
        if (ids.length) {
          userIds = ids.filter((item) => {
            if (item.trim().length) {
              return item
            }
          })
        }
      }
      let idsStr = userIds.join(',')
      // 多语言数据
      let allData = this.list
      let data = allData.filter((item) => {
        return item.enabled
      })
      let pushTaskLocaleDetails = []
      data.forEach((ret) => {
        let params = {}
        let urlType = ''
        ret.pushContent.pushUrl.indexOf('Page=') === 0
          ? (urlType = 2)
          : (urlType = 1)
        Object.assign(
          params,
          ret.pushContent,
          { locale: ret.language, pushSummary: '' },
          { urlType: urlType }
        )
        pushTaskLocaleDetails.push(params)
      })
      let finalParams = {
        pushTaskLocaleDetails: pushTaskLocaleDetails,
        firstActionTime: this.times.getTime(),
        cycleType: 1, // todo 后台有下一版本保留字段，且校验了必填
        cycleDayOfWeek: 1,
        filterConditions: [],
        pushCategory: 1,
      }
      Object.assign(finalParams, this.formData, { userIds: idsStr })
      this.loading = true
      if (this.type === 'create') {
        this.$axios.post('/api/v1/push/add/task', finalParams).then((resp) => {
          this.loading = false
          if (resp.code === 0) {
            this.showList = true
            this.loadData()
          }
        })
      } else if (this.type === 'edit') {
        Object.assign(finalParams, { taskId: this.currentRow.taskId })
        this.$axios
          .post('/api/v1/push/update/task', finalParams)
          .then((resp) => {
            this.loading = false
            if (resp.code === 0) {
              this.showList = true
              this.loadData()
            }
          })
      }
    },
    testSend(language) {
      let allData = this.list
      let data = allData.filter((item) => {
        return item.language === language
      })
      let userIds = []
      if (data[0].pushContent.userIds) {
        let ids = data[0].pushContent.userIds.split('\n')
        if (ids.length) {
          userIds = ids.filter((item) => {
            if (item.trim().length) {
              return item
            }
          })
        }
      }
      let idsStr = userIds.join(',')
      let urlType = ''
      data[0].pushContent.pushUrl.indexOf('Page=') === 0
        ? (urlType = 2)
        : (urlType = 1)
      let params = {}
      Object.assign(
        params,
        data[0].pushContent,
        { userIds: idsStr },
        { urlType: urlType }
      )
      this.loading = true
      this.$axios.post('/api/v1/push/send/test_task', params).then((resp) => {
        this.loading = false
        if (resp.code === 0) {
          this.$Notice.success({
            title: this.$lang('已推送'),
          })
        }
      })
    },
    showTip() {
      let flag = false
      this.list.forEach((item, index) => {
        if (item.enabled && !flag) {
          this.tipIndex = index
          flag = true
        }
      })
    },
  },
  created() {
    this.list = initData(this.lang, JSON.stringify({ pushContent: {} }))
    this.loadData()
    // this.initSwitchStatus()
    this.switchStatus = true
    this.loadSwitchStatus()
    this.loadCustomSwitchStatus()
  },
}
</script>
