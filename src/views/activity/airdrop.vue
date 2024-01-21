<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="6")
      DatePicker(type="datetimerange" format="yyyy-MM-dd HH:mm" style="width:100%" v-model="tempDate", :placeholder="$lang('上架周期')")
    Col(span="10")
      Input(v-model="searchForm.title", :placeholder="$lang('标题')" search @on-search="loadData"  enter-button="")
    Col(span="4")
      Button(:disabled="isRead" long type="success" ghost @click="userSettings" icon="md-contacts") {{$lang("注册用户空投")}}
    Col(span="4")
      Button(:disabled="isRead" long type="primary" ghost @click="create" icon="md-add-circle") {{$lang("新建")}}
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
  Modal.page-exchange-win(v-model="configStatus", :title="$lang('注册用户空投')" width="600", :loading="loading")
    Form(:model='formData', :labelWidth="140")
      FormItem(:label="$lang('状态')")
        iSwitch(size="small" v-model="userConfig.status")
      FormItem(:label="$lang('账号')")
        Input(:value='$lang("运营账户")' readonly)
      FormItem(:label="$lang('空投用户')") {{$lang("注册用户")}}
      FormItem(:label="$lang('空投币种')")
        Select(v-model="userConfig.tokenId", :disabled="view" filterable)
          Option(:value="item.tokenId" v-for="item in tokens" :key="item.tokenId" filterable) {{item.tokenId}}
      FormItem(:label="$lang('空投数量')")
        Input(v-model='userConfig.airdropTokenNum', :placeholder="$lang('每个用户的数量')", :readonly="view")
    div(slot="footer")
      Button(@click="setUserConfig" :disabled="loading" :loading="loading" type="primary") {{$lang('确定')}}
  Modal.page-exchange-win(v-model="createStatus", :title="$lang(view?'详情':'新建')" width="800" :footer-hide="isRead")
    Form(:model='formData', :labelWidth="140")
      FormItem(:label="$lang('类型')" required)
        RadioGroup(v-model='formData.type')
          Radio(:label="1", :disabled="view") {{$lang("免费空投")}}
          Radio(:label="2", :disabled="view") {{$lang("持币空投")}}
      FormItem(:label="$lang('自动锁仓')")
        iSwitch(v-model="formData.lockModel" :true-value="1", :false-value="0" :disabled="view")
      FormItem(:label="$lang('标题')" required)
        Input( v-model='formData.title', :placeholder="$lang('标题')", :readonly="view")
      FormItem(:label="$lang('描述')")
        Input( v-model='formData.description', :placeholder="$lang('描述')", :readonly="view")
      FormItem(:label="$lang('空投时间')" required)
        DatePicker( type="datetime" v-model="formData.airdropTime" style="width:100%", :placeholder="$lang('空投时间')", :readonly="view")
      FormItem(:label="$lang('快照时间')" v-if="createStatus && formData.type==2" required)
        DatePicker( type="date" v-model="realtime" style="width:100%" :options="options", :placeholder="$lang('快照时间')", :readonly="view" @on-change="changeDate")
        Alert(type="error" style="margin-top:10px")
          p {{$lang("快照时间按照UTC +0时间生成，对应您本地时间为")}}:{{formData.snapshotTime?new Date(formData.snapshotTime).format("yyyy-MM-dd hh:mm:ss"):"----"}}
      FormItem(:label="$lang('账号')" required)
        Input(:value='$lang("运营账户")' readonly)
        Alert {{$lang("将从该账户转出资产，请确保该账户资金充足")}}
      FormItem(:label="$lang('模板空投')" v-if="formData.type==1&&!formData.id" key="tmpl")
        iSwitch(size="small" v-model="formData.tmplModel" :true-value="1", :false-value="0")
      template(v-if="formData.tmplModel&&formData.type==1")
        FormItem(:label="$lang('空投模板')" v-if="!formData.id" required)
          Input(v-model="formData.sequenceId" :placeholder="$lang('空投模板')" readonly)
            Upload(:disabled="uploading" slot="suffix" action="/api/v1/airdrop/file/text", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="upData", :show-upload-list="false" accept=".xlsx")
              Icon(type="md-cloud-upload" v-show="!uploading")
              Icon.spin-icon-load(type="ios-loading" v-show="uploading")
          Button(size="small" :to="`https://${staticUrl}/bhop/airdrop/mRCNTEyBZYfWwE8fKI1znkybZG0SXLkMZd5qygivVAw.xlsx`" target="_blank") {{$lang('下载模板')}}
          | &nbsp;&nbsp;
          Button(:to="errorUrl" target="_blank" v-if="errorUrl" size="small" type="error" ghost) {{$lang("错误数据下载")}}
        FormItem(:label="$lang('数据下载')" v-else)
          Button(size="small" :to="`/api/v1/airdrop/download_transfer_record?id=${formData.id}`" target="_blank") {{$lang('下载数据')}}
      template(v-else)
        FormItem(:label="$lang('空投用户')" required)
          RadioGroup(v-model='formData.userType', :disabled="view")
            Radio(:label="1", :disabled="view") {{$lang("全部")}}
            Radio(:label="2", :disabled="view") {{$lang("个人")}}
        FormItem(label="UID" v-if="formData.userType==2" required)
          Input(type="textarea" v-model='formData.userAccountIds', :placeholder="$lang('每行对应一个UID')", :rows="12", :readonly="view" )
          Alert {{$lang("空投人数")}}：{{userAccountIds.length}}
          Alert(type="error" v-if="errorUserIds.length" style="word-break:break-all;" show-icon)
            | {{$lang("UID不存在人数")}}：{{errorUserIds.length}}
            Icon(type="ios-bulb-outline" slot="icon")
            template(slot="desc") {{errorUserIds.join(',')}}
              p
                ButtonGroup
                  Button(size="small" @click="filter('item')") {{$lang("一键分组")}}
                  Button(size="small" @click="filter('flag')") {{$lang("一键标识")}}
                  Button(size="small" @click="filter('clear')") {{$lang("一键清除错误ID")}}
        FormItem(:label="$lang('空投条件')" v-if="formData.type==2" required)
          Row
            Col(span="11")
              Input( v-model='formData.haveTokenNum', :placeholder="$lang('持币数量')", :readonly="view")
                template(slot="prepend") {{$lang('每持有')}}
                Select(style="width:100px" v-model="formData.haveTokenId", :disabled="view" slot="append")
                  Option(:value="item.tokenId" v-for="item in tokens" :key="item.tokenId") {{item.tokenId}}
            Col(span="2") &nbsp;
            Col(span="11")
              Input( v-model='formData.airdropTokenNum', :placeholder="$lang('空投数量')", :readonly="view")
                template(slot="prepend") {{$lang("则空投")}}
                Select(style="width:100px" v-model="formData.airdropTokenId", :disabled="view" slot="append")
                  Option(:value="item.tokenId" v-for="item in tokens" :key="item.tokenId") {{item.tokenId}}
          Alert 注意：持币小于{{formData.haveTokenNum}}数量的用户也将等比例获得空投
        template(v-else)
          FormItem(:label="$lang('空投币种')" required)
            Select(v-model="formData.airdropTokenId", :disabled="view" filterable)
              Option(:value="item.tokenId" v-for="item in tokens" :key="item.tokenId") {{item.tokenId}}
          FormItem(:label="$lang('空投数量')" required)
            Input( v-model='formData.airdropTokenNum', :placeholder="$lang('空投数量')", :readonly="view")
      template(v-if="!isRead")
        FormItem(:label="$lang('谷歌验证码')" v-if="userInfo.bindGA" required)
          Input( v-model='formData.verifyCode', :placeholder="$lang('谷歌验证码')")
        FormItem(:label="$lang('手机验证码')" v-else required)
          Row
            Col(span="14")
              Input(v-model="formData.verifyCode" type="text" :placeholder="$lang('手机验证码')", :maxlength="6")
            Col(span="2" style="text-align: center") -
            Col(span="8")
              Button(v-if="time" disabled long) {{time}}s
              Button(v-else @click="getCode" long type="primary" ghost :disabled="view||isRead") {{$lang("获取验证码")}}
      //- FormItem(:label="$lang('消息通知')" v-if="formData.userType==2||formData.tmplModel")
      //-   Checkbox(v-model="formData.message" disabled) {{$lang("空投后发送短信、邮件通知")}}
    Alert(type="error") {{$lang('空投成功后，必须验证空投是否正常空投成功，如果出现异常请及时联系支持人员确认处理')}}
    Button(slot="footer" type="primary" :loading="loading" @click="doNext") {{$lang("确定")}}
  Modal(v-model="closeWin" width="360")
    p(slot="header" style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{$lang("关闭")}}
    p {{$lang("关闭")}} {{$lang(reItem.type==1?"免费空投":"持币空投")}} : {{reItem.title}}
    div(slot="footer")
      Button(type="error"  long @click="close") {{$lang('确定')}}
</template>
<script>
import { mapState } from 'vuex'
import CONSTS from '@/libs/consts'

const { staticUrl } = CONSTS

let systemTime = 0
export default {
  data() {
    return {
      staticUrl: staticUrl,
      time: 0,
      errorUserIds: [],
      errorUrl: '',
      uploading: false,
      reItem: {},
      tempDate: [], //日历临时存放值
      loadingTable: true,
      createStatus: false,

      //retryWin: false,
      configStatus: false,
      loading: false,
      closeWin: false,
      view: false,
      realtime: '',
      options: {
        disabledDate(date) {
          return new Date(date).getTime() >= systemTime
        },
      },
      userConfig: {
        id: '',
        brokerId: '',
        tokenId: '',
        status: false,
        airdropTokenNum: '',
      },
      listData: [],
      formData: {
        lockModel: 0,
        sequenceId: '',
        tmplModel: 0,
        type: 1,
        title: '',
        description: '',
        userType: '',
        userAccountIds: '',
        airdropTokenId: '',
        airdropTokenNum: '',
        haveTokenId: '',
        snapshotTime: '',
        airdropTime: '',
        haveTokenNum: '1',
        message: true,
        authType: 1,
        verifyCode: '',
      },
      searchForm: {
        title: '',
        beginTime: '0',
        endTime: '0',
      },
      columns: [
        {
          title: this.$lang('时间'),
          minWidth: 190,
          render: (h, p) => h('span', this.newDate(p.row.airdropTime).format()),
        },
        {
          title: this.$lang('类型'),
          minWidth: 140,
          key: 'type',
          render: (h, p) => {
            let tmp = [
              h('span', this.$lang(p.row.type == 1 ? '免费空投' : '持币空投')),
            ]
            if (p.row.tmplModel) {
              tmp.push(h('Icon', { attrs: { type: 'ios-paper-outline' } }))
            }
            return h('div', tmp)
          },
        },
        {
          title: this.$lang('标题'),
          minWidth: 140,
          key: 'title',
        },
        {
          title: this.$lang('人数'),
          minWidth: 100,
          key: 'userType',
          render: (h, p) => {
            let tmp = this.$lang('全部')
            if (p.row.userType != 1) {
              if (p.row.status == 0 || p.row.status == 2 || p.row.status == 3) {
                tmp = '---'
              } else {
                tmp = p.row.userCount
              }
            }
            return h('span', tmp)
          },
        },
        {
          title: this.$lang('操作人'),
          minWidth: 240,
          key: 'adminId',
        },
        {
          title: this.$lang('状态'),
          minWidth: 140,
          key: 'status',
          render: (h, p) => {
            if (p.row.status == 1) {
              return h('span', this.$lang('成功'))
            } else if (p.row.status == 2) {
              return h('span', this.$lang('空投中'))
            } else if (p.row.status == 3) {
              return h('span', this.$lang('失败'))
            } else if (p.row.status == 4) {
              return h('span', this.$lang('部分成功'))
            } else if (p.row.status == 5) {
              return h('span', this.$lang('已关闭'))
            } else if (p.row.status == 10) {
              return h('span', this.$lang('审核中'))
            } else if (p.row.status == 14) {
              return h('span', this.$lang('待执行'))
            } else if (p.row.status == 15) {
              return h('span', this.$lang('审核已拒绝'))
            } else if (p.row.status == 31) {
              return h(
                'Tag',
                {
                  attrs: {
                    color: 'error',
                  },
                },
                this.$lang('余额不足')
              )
            }
          },
        },
        {
          title: this.$lang('操作'),
          width: 150,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            let arr = [
              h(
                'a',
                {
                  on: {
                    click: () => {
                      this.view = true
                      this.createStatus = true
                      Object.assign(this.formData, params.row)

                      if (params.row.airdropTime) {
                        this.formData.airdropTime = new Date(
                          Number(params.row.airdropTime)
                        )
                      }

                      if (params.row.snapshotTime) {
                        this.formData.snapshotTime = new Date(
                          Number(params.row.snapshotTime)
                        )
                      }
                      this.$axios
                        .post('/api/v1/airdrop/detail', { id: params.row.id })
                        .then((result) => {
                          if (result.code === 0) {
                            if (result.data.userAccountIds) {
                              result.data.userAccountIds = result.data.userAccountIds
                                .split(',')
                                .join('\n')
                            }

                            Object.assign(this.formData, result.data)
                            if (result.data.airdropTime) {
                              this.formData.airdropTime = new Date(
                                Number(result.data.airdropTime)
                              )
                            }

                            if (result.data.snapshotTime) {
                              this.formData.snapshotTime = new Date(
                                Number(result.data.snapshotTime)
                              )
                            }
                          }
                        })
                    },
                  },
                },
                this.$lang('详情')
              ),
            ]

            if (params.row.status == 14) {
              arr.push(h('span', ' | '))
              arr.push(
                h(
                  'Button',
                  {
                    attrs: {
                      type: 'error',
                      size: 'small',
                      disabled: this.isRead,
                    },
                    on: {
                      click: () => {
                        this.closeWin = true
                        this.reItem = params.row
                      },
                    },
                  },
                  this.$lang('关闭')
                )
              )
            }

            return arr
          },
        },
      ],
    }
  },
  computed: {
    ...mapState(['userInfo', 'tokens', 'isRead']),
    upData() {
      return {
        type: this.formData.type,
      }
    },
    userAccountIds() {
      if (this.formData.userAccountIds) {
        return this.formData.userAccountIds.replace(/ /g, '').split('\n')
      } else {
        return []
      }
    },
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--
        }, 1000)
      }
    },
  },
  methods: {
    getCode() {
      !this.time &&
        this.$axios
          .post('/api/v1/user/send_a_sms_verify_code', {})
          .then((result) => {
            if (result.code == 0) {
              this.time = 60
            }
          })
    },
    setUserConfig() {
      this.loading = true
      this.$axios
        .post('/api/v1/airdrop/auto_airdrop', this.userConfig)
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.configStatus = false
          }
        })
    },

    filter(type) {
      let before = []
      let after = []
      let check = {}

      this.errorUserIds.forEach((el) => (check[el] = true))

      this.userAccountIds.forEach((el) => {
        if (check[el] || type == 'flag') {
          before.push(check[el] && type == 'flag' ? +el + ' <-----' : el)
        } else {
          after.push(el)
        }
      })
      if (type == 'flag') {
        this.formData.userAccountIds = before.join('\n')
      } else if (type == 'clear') {
        this.formData.userAccountIds = after.join('\n')
      } else {
        this.formData.userAccountIds = [
          before.join('\n'),
          after.join('\n'),
        ].join(`\n↓↓↓↓↓↓↓↓↓↓↓↓↓${this.$lang('正常数据')}↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓\n`)
      }
      this.errorUserIds = []
    },
    uploadSuccess(result) {
      this.errorUrl = ''
      this.uploading = false
      if (result.code != 0) {
        return
      }
      if (result.data.sequenceId) {
        this.$Notice.success({
          title: this.$lang('成功'),
        })
        this.formData.sequenceId = result.data.sequenceId
      } else {
        if (result.data.tmplOk) {
          this.$Notice.error({
            title: this.$lang('数据错误，请检查数据'),
          })
          this.errorUrl = result.data.errorUrl
        } else {
          this.$Notice.error({
            title: this.$lang('模板错误，请重新下载'),
          })
        }
      }
    },
    beforeUpload() {
      this.uploading = true
    },
    changeDate() {
      if (this.realtime) {
        this.formData.snapshotTime = new Date(
          new Date(this.realtime.format('yyyy-MM-dd')).toGMTString()
        ).getTime()
      }
    },
    userSettings() {
      this.configStatus = true
      this.$axios.post('/api/v1/airdrop/show_auto_airdrop').then((result) => {
        if (result.code === 0) {
          this.userConfig = result.data
        }
      })
    },
    create() {
      this.view = false
      this.createStatus = true
      this.errorUrl = ''
      this.realtime = ''

      Object.keys(this.formData).forEach((el) => {
        this.formData[el] = ''
      })

      Object.assign(this.formData, {
        lockModel: 0,
        tmplModel: 0,
        type: 1,
        haveTokenNum: '1',
        message: true,
      })
    },
    loadData() {
      this.loadingTable = true
      if (this.tempDate.length) {
        this.searchForm.beginTime = new Date(this.tempDate[0]).getTime() || '0'
        this.searchForm.endTime = new Date(this.tempDate[1]).getTime() || '0'
      }
      this.$axios
        .post('/api/v1/airdrop/query', this.searchForm)
        .then((result) => {
          this.loadingTable = false
          if (result.code === 0) {
            this.listData = result.data
          }
        })
    },

    close() {
      this.$axios
        .post('/api/v1/airdrop/close', {
          airdropId: this.reItem.id,
        })
        .then(() => {
          this.loadData()
          this.closeWin = false
        })
    },
    doNext() {
      if (
        this.formData.type == 1 &&
        this.formData.tmplModel == 1 &&
        !this.formData.sequenceId
      ) {
        this.$Notice.error({
          title: this.$lang('请上传空投模板'),
        })
        return
      }
      if (this.view) {
        this.createStatus = false
        return
      }
      let data = Object.assign({}, this.formData)
      if (data.airdropTime) {
        data.airdropTime = new Date(data.airdropTime).getTime()
      }
      data.userAccountIds = this.userAccountIds.join(',')

      data.authType = this.userInfo.bindGA ? 1 : 2

      this.loading = true
      this.$axios.post('/api/v1/airdrop', data).then((result) => {
        this.loading = false
        if (result.code == 0) {
          this.loadData()
          this.createStatus = false
        } else if (result.code == 30001) {
          this.errorUserIds = result.data.errorUserIds
        }
      })
    },
  },
  created() {
    this.loadData()
    this.$axios.post('/api/v1/airdrop/init_info').then((result) => {
      systemTime =
        Math.floor((result.data.systemTime - 86400000) / 86400) * 86400
    })
  },
}
</script>
