<style lang="less" scoped>
.text {
  font-size: 14px;
  line-height: 2;
  margin: 20px 0;
}
</style>
<template lang="pug">
  div.page-exchange
    Form
      Row.search(:gutter="15")
        Col(span="20") &nbsp;
        Col(span="4")
          Button(long  type="primary" to="/activity/ieo/create" icon="md-add-circle" ghost :disabled="isRead") {{$lang('新建')}}
    Alert(v-html="ieoDesc")
    Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
      template(slot-scope="{ row, index }" slot="time")
          Tag  {{newDate(row.startTime).format('yyyy/MM/dd hh:mm:ss')}} - {{newDate(row.endTime).format('yyyy/MM/dd hh:mm:ss')}}
      template(slot-scope="{ row, index }" slot="action")
        router-link(v-if="row.status == 1 || row.status == 2" :to="`/activity/ieo/edit/${row.id}`") {{isRead ? $lang("查看"): $lang("修改")}}
        template(v-else-if="row.status == 3")
          a(@click="fenpei(row)") {{$lang("分配")}}
          | &nbsp;&nbsp;|&nbsp;&nbsp;
          a(@click="freeFenpei(row)") {{$lang("自由分配")}}
        a(v-else :href="`/activity/ieo/edit/${row.id}`") {{$lang("查看结果")}}
      template(slot-scope="{ row, index }" slot="view")
        a(:href="`https://www${apiDomain}/xo/item/${row.projectCode}`" target="_blank") {{$lang("预览")}}
      template(slot-scope="{ row, index }" slot="show")
        iSwitch(v-model="row.isShow" :disabled="isRead" :false-value="0" :true-value="1" @on-change="online(row,index)" :loading="index===editIndex" size="small")
    Modal(v-model="whiteWin", :title="$lang('白名单')" :footer-hide="isRead")
      Input(v-model='whitelist.list', :placeholder="$lang('每行对应一个UID')"  type="textarea", :rows="10")
      template(slot="footer")
        Button(@click="setWhitelist" :loading="loading" type="primary") {{$lang("确定")}}
    Modal(v-model="viewWin" width="600" :title="$lang('分配结果管理')" :footer-hide="isRead")
      Alert.text
        strong 原始数据
        Row(:gutter="20")
          Col(span="12") 1份获得分配额度：{{viewData.realOffingsVolumeEachPurchaseUnit}} {{viewData.offeringsToken}}
          Col(span="12") 实际参与人数：{{viewData.buyerCount}}
          Col(span="12")
            strong(style="color:#19be6b") 实际募集金额：{{viewData.realSoldAmount}}  {{viewData.purchaseToken}}
          Col(span="12") 预期分配总量：{{viewData.totalPurchaseVolume}} {{viewData.offeringsToken}}
      Row.text(:gutter="20" v-if="editType === 'free'")
        Col(span="24" style="margin-bottom: 18px")
          Input(v-model="viewData.actualOfferingsVolume")
            span(slot="prepend") 对外公布募集金额
            span(slot="append")  {{viewData.purchaseToken}}
        Col(span="6")
          Button(type="primary" :loading="compute" long, @click="calculate" :disabled="compute || isRead") {{$lang(compute ?'计算中':'重新计算')}}
        Col(span="6")
          Button(type="primary" long, @click="exportData()" :disabled="isRead")
            Icon(type="ios-download-outline")
            | {{$lang("导出数据")}}
        Col(span="6")
          Upload(:disabled="uploading" action="/api/v1/activity/ieo/activity/upload", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="upData", :show-upload-list="false" accept=".xlsx")
            Button(:disabled="isRead" type="primary" long, :loading="uploading")
              Icon(type="md-cloud-upload")
              | {{$lang("上传数据")}}
        Col(span="6")
          Button(type="primary"  :disabled="loading || isRead" :loading="loading" @click="checkConfirm()") {{$lang('立即分配')}}
      Row.text(:gutter="20" v-else)
        Col(span="18")
          Input(v-model="viewData.actualOfferingsVolume")
            span(slot="prepend") 对外公布募集金额
            span(slot="append")  {{viewData.purchaseToken}}
        Col(span="6")
          Button(type="primary" :loading="compute" long @click="calculate" :disabled="viewData.actualOfferingsVolume==viewData.actualPurchaseVolume||compute") {{$lang(compute ?'计算中':'重新计算')}}
      Alert.text
        strong 修改后数据
        Row(:gutter="20")
          Col(span="12") 1份获得分配额度：{{viewData.offingsVolumeEachPurchaseUnit}} {{viewData.offeringsToken}}
          Col(span="12")
            strong(style="color:#19be6b") 最终发放人数：{{viewData.buyerCount}}
          Col(span="12") 对外公布募集金额：{{viewData.actualPurchaseVolume}}  {{viewData.purchaseToken}}
          Col(span="12")
            strong(style="color:#19be6b") 最终分配总量：{{viewData.realRaiseAmount}} {{viewData.offeringsToken}}
        Row(:gutter="20" v-if="editType === 'free'")
          Col(span="12") 募集金额总额：{{viewData.amount}} {{viewData.purchaseToken}}
          Col(span="12") 获得总额：{{viewData.useAmount}} {{viewData.purchaseToken}}
          Col(span="12") 分配总额：{{viewData.luckyAmount}} {{viewData.offeringsToken}}
          Col(span="12") 返还总额：{{viewData.backAmount}} {{viewData.purchaseToken}}
      Alert(type="error" show-icon) {{$lang("分配金额确认后不可撤回，请务必检查数据的准确性。")}}
      template(slot="footer")
        span(v-if="editType === 'free'") &nbsp;
        Button(v-else type="primary"  :disabled="loading" :loading="loading" @click="confirm(viewData.projectId)") {{$lang('立即分配')}}
    Modal(v-model="checkWin" :title="$lang('立即分配')" width="300" footer-hide)
      p(style="margin-bottom:20px;font-size:14px") {{$lang('分配金额确认后不可撤回，请务必检查数据的准确性，是否执行')}}
      Button(long type="error" @click="confirm(viewData.projectId)") {{$lang('确定')}}
</template>
<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['lang', 'apiDomain', 'isRead']),
    upData() {
      return {
        id: this.currentRow.id,
      }
    },
    ieoDesc() {
      return this.$lang('ieo.desc')
        .replace(
          '{h5}',
          `<a target="_blank" href="https://www${this.apiDomain}/activity/xo/"> https://www${this.apiDomain}/activity/xo/</a>`
        )
        .replace(
          '{web}',
          `<a target="_blank" href="https://www${this.apiDomain}/xo"> https://www${this.apiDomain}/xo</a>`
        )
        .replace(
          '{help}',
          `<a target="_blank" href="https://xxxxx.zendesk.com/hc/zh-cn/articles/360037029593"> https://xxxxx.zendesk.com/hc/zh-cn/articles/360037029593</a>`
        )
    },
  },
  data() {
    return {
      checkWin: false,
      currentRow: null,
      uploading: false,
      editType: '',
      compute: false,
      editIndex: '',
      whitelist: {
        projectId: '',
        list: '',
      },
      whiteWin: false,
      viewData: {
        projectId: '',
        projectName: '',
        totalPurchaseVolume: '', //申购目标总量
        actualPurchaseVolume: '', //实际申购量
        offingsVolumeEachPurchaseUnit: '', //每份申购可兑换发行币种数量
        buyerCount: '',
        purchaseToken: '', //申购token
        offeringsToken: '', //发售token
        actualOfferingsVolume: '',
        amount: '',
        useAmount: '',
        luckyAmount: '',
        backAmount: '',
      }, //申购人数},
      viewWin: false,
      loadingTable: false,
      loading: false,
      listData: [],
      type: {
        1: '自由模式',
        2: '阳光普照',
        3: '抢购模式',
      },
      status: {
        1: '未开始',
        2: '进行中',
        3: '计算中',
        4: '完成',
        5: '完成',
      },
      color: {
        1: 'primary',
        2: 'success',
        3: 'error',
      },
      columns: [
        {
          title: this.$lang('项目名称'),
          minWidth: 160,
          key: 'name',
        },
        {
          title: this.$lang('申购币种'),
          minWidth: 160,
          key: 'purchaseToken',
        },
        {
          title: this.$lang('发行币种'),
          minWidth: 160,
          key: 'offeringsToken',
        },
        {
          title: this.$lang('发行价格'),
          minWidth: 120,
          key: 'offeringsPrice',
        },
        {
          title: this.$lang('分配总量'),
          minWidth: 150,
          render: (h, p) => h('div', p.row.totalVolume + p.row.offeringsToken),
        },
        {
          title: this.$lang('活动时间'),
          minWidth: 280,
          key: 'startTime',
          slot: 'time',
        },
        {
          title: this.$lang('模式'),
          minWidth: 140,
          render: (h, p) =>
            h('span', this.$lang(this.type[p.row.activityType])),
        },
        {
          title: this.$lang('状态'),
          minWidth: 120,
          render: (h, p) =>
            h(
              'Tag',
              {
                props: {
                  color: this.color[p.row.status],
                },
              },
              this.$lang(this.status[p.row.status])
            ),
        },
        {
          title: this.$lang('预览'),
          minWidth: 100,
          slot: 'view',
        },
        {
          title: this.$lang('订单'),
          minWidth: 80,
          render: (h, p) => {
            return h(
              'router-link',
              {
                attrs: {
                  to: `/activity/ieo/order/${p.row.id}/${p.row.activityType}`,
                },
              },
              this.$lang('订单')
            )
          },
        },
        {
          title: this.$lang('白名单'),
          fixed: 'right',
          align: 'center',
          minWidth: 100,
          render: (h, p) => {
            return h(
              'a',
              {
                on: {
                  click: () => {
                    this.$axios
                      .post('/api/v1/activity/ieo/query/whitelist', {
                        projectId: p.row.id,
                      })
                      .then((result) => {
                        if (result.code == 0) {
                          this.whitelist.projectId = p.row.id
                          this.whitelist.list = result.data.userList.join('\n')
                        }
                      })
                    this.whiteWin = true
                  },
                },
              },
              this.$lang('白名单')
            )
          },
        },
        {
          title: this.$lang('可见'),
          width: 120,
          fixed: 'right',
          align: 'center',
          slot: 'show',
        },
        {
          title: this.$lang('操作'),
          fixed: 'right',
          align: 'center',
          slot: 'action',
          minWidth: 140,
        },
      ],
    }
  },
  methods: {
    setWhitelist() {
      let json = {
        projectId: this.whitelist.projectId,
        userList: this.whitelist.list.split('\n'),
      }
      this.loading = true
      this.$axios
        .post('/api/v1/activity/ieo/save/whitelist', json)
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.whiteWin = false
          }
        })
    },
    online(row, index) {
      this.editIndex = index
      this.$axios
        .post('/api/v1/activity/ieo/project/online', {
          projectId: row.id,
          isShow: row.isShow,
        })
        .then((result) => {
          this.editIndex = ''
          if (result.code != 0) {
            row.isShow = !row.isShow ? 1 : 0
          }
        })
    },
    freeFenpei(row) {
      this.editType = 'free'
      this.currentRow = row
      this.openFenpei(row)
      this.freePreview()
    },
    fenpei(row) {
      this.editType = 'fenpei'
      this.openFenpei(row)
    },
    openFenpei(row) {
      this.$axios
        .post('/api/v1/activity/ieo/project/result/get', {
          id: row.id,
        })
        .then((result) => {
          if (result.code == 0) {
            Object.assign(this.viewData, row, result.data)
            this.viewData.projectId = row.id
            this.viewData.actualOfferingsVolume =
              result.data.actualPurchaseVolume
          }
        })

      this.viewWin = true
    },
    confirm(id) {
      this.loading = true
      this.$axios
        .post('/api/v1/activity/ieo/project/result/confirm', {
          id,
        })
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            location.reload()
          }
        })
    },
    checkConfirm() {
      this.checkWin = true
    },
    calculate() {
      this.compute = true
      this.$axios
        .post('/api/v1/activity/ieo/project/result/calculate', this.viewData)
        .then((result) => {
          this.compute = false
          if (result.code == 0) {
            Object.assign(this.viewData, result.data)
          }
        })
    },
    freePreview() {
      this.compute = true
      if (!this.viewData.id) {
        this.viewData.id = this.currentRow.id
      }
      this.$axios
        .post('/api/v1/activity/ieo/query/activity/info', {
          projectId: this.viewData.id,
        })
        .then((result) => {
          this.compute = false
          if (result.code == 0) {
            Object.assign(this.viewData, result.data)
          }
        })
    },
    loadData() {
      this.loadingTable = true
      this.$axios
        .post('/api/v1/activity/ieo/project/list', {
          pageNo: 1,
          size: 100,
        })
        .then((result) => {
          this.loadingTable = false
          if (result.code == 0) {
            this.listData = result.data.list
          }
        })
    },
    uploadSuccess(result) {
      this.uploading = false
      if (result.code != 0) {
        return this.$Message.error(result.msg)
      } else {
        this.freePreview()
      }
    },
    beforeUpload() {
      this.uploading = true
    },
    exportData() {
      window.open(
        `/api/v1/activity/ieo/download/order?projectId=${this.currentRow.id}&type=${this.currentRow.activityType}`
      )
    },
  },
  created() {
    this.loadData()
  },
}
</script>
