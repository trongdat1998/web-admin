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
Main
  Alert {{$lang('IP禁止访问')}} 
    iSwitch(v-model="formData.status" :loading="pageLoading" size="large")
      span(slot="open") {{$lang("开")}}
      span(slot="close") {{$lang("关")}}
    | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    a(href="https://xxxxx.zendesk.com/hc/zh-cn/articles/360039624013" target="_blank") {{$lang('操作说明')}}
          
  Card(:title="$lang('选择IP禁止访问的国家或地区')" dis-hover style="margin-top:15px")
    template(slot="extra")
      Button(size="small" @click="onekey" type="success") {{$lang('一键选取系统推荐列表')}}
      | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      Checkbox(:indeterminate="indeterminate" :value="checkAll" @click.prevent.native="handleCheckAll" ) {{$lang('全选')}}
    CheckboxGroup(v-model="formData.nationalCode" @on-change="checkAllGroupChange" v-show="more")
      Checkbox(:label="item.id" v-for="item in areaList" :key="item.id" border style="margin-bottom:10px") {{item.countryName}}
      Button(@click="more=false" icon="ios-arrow-up") {{$lang('收起')}}
    CheckboxGroup(v-model="formData.nationalCode" @on-change="checkAllGroupChange" v-show="!more")
      Checkbox(:label="item.id" v-for="item,index in areaList" :key="item.id" border style="margin-bottom:10px" v-if="index<30") {{item.countryName}}
      Button(@click="more=true" icon="ios-more") {{$lang('更多')}}

  Card(:title="$lang('禁止页面提示文案')" dis-hover style="margin-top:15px")
    Row
      Col(span="16")
        quill-editor(:options="editorOption" v-model="formData.description")
      Col.quill-code(span="8")
        .title Code
        code.html(v-html="contentCode(formData.description)")

  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading" loading long)  {{$lang('加载中')}}
        Button(@click="submit", :loading="loading" :disabled="loading" type="primary" long v-else) {{$lang('保存')}}
</template>
<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillRedefine } from 'vue-quill-editor-upload'
import { quillEditor } from 'vue-quill-editor'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { mapState } from 'vuex'
export default {
  computed: { ...mapState(['isRead']) },
  components: {
    quillEditor,
    quillRedefine,
  },
  data() {
    return {
      indeterminate: true,
      checkAll: false,
      editorOption: {},
      pageLoading: false,
      loading: false,
      more: false,
      areaList: [],
      formData: {
        status: false,
        nationalCode: [],
        description: '',
      },
      items: {
        group: 'custom.config.group',
        key: 'cust.riskIpDisabled',
      },
    }
  },

  methods: {
    onekey() {
      this.formData.nationalCode = [
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
        this.formData.nationalCode = this.areaList.map((el) => el.id)
      } else {
        this.formData.nationalCode = []
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
    contentCode(code) {
      return hljs.highlightAuto(code).value
    },
    load() {
      this.pageLoading = true
      this.$axios
        .post('/api/v1/broker/config/common_config/get_config', this.items)
        .then((result) => {
          this.pageLoading = false
          if (result.code == 0 && result.data) {
            Object.assign(this.formData, JSON.parse(result.data.value))
          }
        })
    },
    submit() {
      this.loading = true

      this.$axios
        .post(
          '/api/v1/broker/config/common_config/edit_config',
          Object.assign(this.items, { value: JSON.stringify(this.formData) })
        )
        .then((result) => {
          this.loading = false
          if (result.code === 0) {
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

    this.editorOption = quillRedefine({
      // 图片上传的设置
      uploadConfig: {
        action: '/api/v1/storage/file/image', // 必填参数 图片上传地址
        res: (respnse) => {
          return respnse.data.url
        },
        name: 'uploadFile', // 图片上传参数名
      },
      toolOptions: [
        ['bold', 'italic', 'underline', 'strike'],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['link', 'image'],
        [{ color: [] }, { background: [] }],
      ],
    })
  },
}
</script>
