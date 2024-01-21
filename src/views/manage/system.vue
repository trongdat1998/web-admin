<template lang="pug">
Main
  Card(dis-hover)
    p(slot="title") {{ $lang('应用管理') }}
    Row(:gutter="20")
      Col(
        v-for="item in application",
        :key="item.text",
        span="4",
        style="padding:10px"
      )
        Checkbox(v-model="item.state") {{ $lang(item.text) }}
  Card(dis-hover, style="margin-top:15px")
    p(slot="title") {{ $lang('语言管理') }}
    Row(:gutter="20")
      Col(span="5") {{ $lang('语言') }}
      //- Col(span="2") {{$lang('图标')}}
      //- Col(span="7") {{$lang('图标路径')}}
      Col(span="5") Cookie
      Col(span="5") {{ $lang('法币信息') }}
      Col(span="5") {{ $lang('状态') }}
      Col(span="4") {{ $lang('语言包') }}
    Divider
    draggable(v-model="cloneSupportLanguages", draggable=".draggable")
      .draggable.move(v-for="(item, index) in cloneSupportLanguages")
        Row(:gutter="20", :key="index")
          Col(span="5")
            Input(v-model="item.showName", :disabled="!item.state")
          //- Col.img(span="2")
          //-   img(:src="item.icon" width="30")
          //- Col.img(span="7")
          //-   Input( v-model="item.icon" :disabled="!item.state")
          //-     Upload(slot="suffix" action="/api/v1/storage/file/image", name="uploadFile", :on-success="uploadSuccess", :beforeUpload="beforeUpload", :data="{echoStr:index}", :show-upload-list="false")
          //-       Icon(type="md-cloud-upload" v-show="!spinShow")
          //-       Icon.spin-icon-load(type="ios-loading" v-show="spinShow")
          Col(span="5") {{ item.language }}
          Col(span="5")
            Select(v-model="item.currency", :disabled="!item.state")
              Option(
                v-for="_item in currency",
                :key="_item + index",
                :value="_item"
              ) {{ _item }}
              Option(value="NT$.TWD") {{$lang("NT$.TWD")}}
          Col(span="5")
            iSwitch(size="small", v-model="item.state")
          Col(span="4")
            a(:href="`/manage/lang?modify=${item.language}`") {{ $lang('管理') }}
        Divider
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(@click="save", :loading="loading", type="primary", long) {{ $lang('保存') }}
</template>
<script>
import { mapState, mapActions } from 'vuex'
import draggable from 'vuedraggable'
import { systemLanguages, systemFunctions } from '@/libs/common'

export default {
  components: {
    draggable,
  },
  data() {
    return {
      systemLanguages,
      loading: false,
      spinShow: false,
      cloneSupportLanguages: [],
      application: [],
    }
  },
  computed: {
    ...mapState(['lang', 'supportLanguages', 'isRoot', 'functions', 'isRead']),
    currency() {
      return new Set(this.systemLanguages.map((el) => el.currency))
    },
  },
  methods: {
    ...mapActions(['setIcon']),
    uploadSuccess(result) {
      this.spinShow = false
      if (result.code != 0) {
        return
      }
      this.$Notice.success({
        title: this.$lang('成功'),
      })

      this.setIcon({
        index: Number(result.data.echoStr),
        icon: result.data.url,
      })
    },
    beforeUpload() {
      this.spinShow = true
    },
    save() {
      if (!this.loading) {
        let json = {}
        let supportLanguages = []

        this.application.forEach((el) => {
          json[el.link] = !!el.state
        })

        this.cloneSupportLanguages.forEach((el) => {
          if (el.state) {
            supportLanguages.push(el)
          }
        })

        if (supportLanguages.length) {
          this.$axios
            .post('/api/v1/broker/modify/broker/info', {
              functions: json,
              supportLanguages,
            })
            .then((result) => {
              if (result.code == 0) {
                location.reload()
              }
            })
          this.loading = true
        } else {
          this.$Message.error(this.$lang('至少选择一种语言'))
          this.loading = false
        }
      }
    },
  },
  created() {
    this.cloneSupportLanguages = [...this.supportLanguages]
    systemFunctions.forEach((el) => {
      if (
        (typeof this.functions.margin === 'undefined' &&
          el.link === 'margin') ||
        (typeof this.functions.bonus === 'undefined' && el.link === 'bonus')
      ) {
        return
      } else if (
        typeof this.functions.showSubAcco === 'undefined' &&
        el.link === 'showSubAcco'
      ) {
        // 原功能增加开关，默认开启
        el.state = true
        this.application.push(el)
      } else {
        if (typeof this.functions[el.link] !== 'undefined') {
          el.state = this.functions[el.link]
        }
        this.application.push(el)
      }
    })
  },
}
</script>
