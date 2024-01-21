<style lang="less" scoped>
.manage-button {
  display: flex;
  justify-content: space-between;
  padding-top: 6px;
}
.manage-text {
  font-size: 12px !important;
}
.tab {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #dcdee2;
  margin-bottom: 15px;
}
.draggable,
.button {
  width: 16.666%;
  float: left;
  padding: 10px;
  background: #f8f8f8;
  border: 5px solid #fff;
  height: 140px;
  overflow: hidden;
  position: relative;
  .tag {
    position: absolute;
    top: 0;
    left: 0;
    color: #000;
    font-size: 12px;
    z-index: 10;
    padding: 0 5px;
  }
}
.line {
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid #e8eaec;
}
</style>
<template lang="pug">
div
  Modal(
    v-model="manageMenuWin",
    :title="$lang('子菜单')",
    width="700",
    @on-ok="saveMenu"
  )
    Row(:gutter="10")
      Col(span="6") {{ $lang('标题') }}
      Col(span="9") {{ $lang('链接') }}
      Col(span="6") &nbsp;
      Col(span="3") {{ $lang('操作') }}
    Row.line(:gutter="10", v-for="(item, index) in children", :key="index")
      Col(span="6")
        Input(size="small", v-model="item.text")
      Col(span="9")
        Input(size="small", v-model="item.link")
      Col(span="6")
        Checkbox(v-model="item.blank") {{ $lang('新窗口') }}
      Col(span="3", style="text-align:right")
        Button(
          @click="removeItem(index)",
          size="small",
          type="primary",
          ghost,
          long
        ) {{ $lang('删除') }}
    Row.line(:gutter="10")
      Col(span="21")
        Alert {{ $lang('温馨提示：确定后点击右下角保存按钮后配置后生效。') }}
      Col(span="3")
        Button(@click="pushData", type="primary", ghost, long)
          Icon(type="md-add")
  .tab
    RadioGroup(v-model="type", type="button")
      Radio(label="head") {{ $lang('头部导航') }}
      Radio(label="foot") {{ $lang('页尾') }}
  div(v-show="type=='head'")
    Alert
      Checkbox(
        v-for="item in data.headConfigList",
        v-model="item.enable",
        :true-value="1",
        :false-value="0",
        :key="item.locale + 1"
      ) {{ lang[item.locale] }}
    Card(
      dis-hover,
      v-for="(item, index) in data.headConfigList",
      v-show="item.enable",
      :key="'card' + index",
      style="margin-top:15px"
    )
      p(slot="title") {{ lang[item.locale] }}
      draggable.move(
        v-model="item.list",
        draggable=".draggable",
        style="overflow:hidden"
      )
        .draggable(
          span="3",
          v-for="(_item, _index) in item.list",
          :key="item.locale + 3 + _index + index"
        )
          .tag(
            v-if="_item.tag && _item.color",
            :style="{ background: _item.color }"
          ) {{ _item.tag }}
          Row
            Col(span="3", style="text-align:right")
              Tag(v-if="_item.system", color="error") S
              Tag(v-else, color="success") U
            Col(span="18")
              Select(v-model="_item.link", v-if="_item.system", size="small")
                Option(
                  v-for="(item,index) in application",
                  :key = "index",
                  :value="item.link",
                  @click.native="_item.text = item.text"
                ) {{ item.url }} - {{ item.text }}
              Input(
                v-else,
                size="small",
                v-model="_item.link",
                :placeholder="$lang('链接')"
              )
            Col(span="3", style="text-align:right")
              Icon.hand(
                @click.native="removeMenu(item.list, index, _index)",
                type="md-trash",
                style="color:#ed4014",
                :title="$lang('删除')"
              )
          Input(
            size="small",
            v-model="_item.text",
            :placeholder="$lang('标题')",
            style="margin:5px 0"
          )

          Row(:gutter="10", key="c", style="margin-bottom:5px")
            Col(span="8")
              Input(
                size="small",
                :maxlength="3",
                v-model="_item.tag",
                :placeholder="$lang('角标文字')"
              )
            Col(span="16")
              Input(
                size="small",
                :maxlength="7",
                v-model="_item.color",
                :placeholder="$lang('角标颜色')"
              )
                Select(slot="append", v-model="_item.color", size="small")
                  Option(value="#3375E0")
                    Icon(type="md-cloud-upload", color="#3375E0")
                  Option(value="#4299FF")
                    Icon(type="md-cloud-upload", color="#4299FF")
                  Option(value="#FFC000")
                    Icon(type="md-cloud-upload", color="#FFC000")
                  Option(value="#fff04e")
                    Icon(type="md-cloud-upload", color="#fff04e")
                  Option(value="#d23434")
                    Icon(type="md-cloud-upload", color="#d23434")
                  Option(value="#ff695e")
                    Icon(type="md-cloud-upload", color="#ff695e")
          Row(:gutter="10", style="margin-bottom:5px")
            Col(span="12")
              Checkbox.manage-text(size="small", v-model="_item.blank") {{ $lang('新窗口') }}
            Col(span="12")
              Button(
                long,
                size="small",
                @click="manageMenu(index, _index)",
                :type="_item.children && _item.children.length ? 'primary' : 'default'"
              ) {{ $lang('子菜单') }}
                Icon(
                  type="ios-keypad",
                  v-if="_item.children && _item.children.length"
                )
        .button
          Button(
            type="primary",
            long,
            @click="createLink(data.headConfigList[index]['list'], true)",
            icon="md-add-circle",
            ghost
          ) {{ $lang('新建') }}({{ $lang('系统链接') }})
          Divider
          Button(
            type="primary",
            long,
            @click="createLink(data.headConfigList[index]['list'])",
            icon="md-add-circle",
            ghost
          ) {{ $lang('新建') }}({{ $lang('普通链接') }})

  div(v-show="type=='foot'")
    Alert
      Checkbox(
        v-for="item in data.footConfigList",
        v-model="item.enable",
        :true-value="1",
        :false-value="0",
        :key="item.locale + 2"
      ) {{ lang[item.locale] }}
    Card(
      dis-hover,
      v-for="(item, index) in data.footConfigList",
      v-show="item.enable",
      :key="'card2' + index",
      style="margin-top:15px"
    )
      p(slot="title") {{ lang[item.locale] }}
      Row(:gutter="20")
        Col(span="6", v-for="(_item, _index) in item.list", :key="_index")
          Input(
            :placeholder="$lang('列头')",
            style="margin-bottom:15px",
            v-model="_item.caption"
          )
          Card(dis-hover)
            draggable.move(
              v-model="_item.items",
              draggable=".draggable2",
              style="overflow:hidden"
            )
              Row.draggable2(
                :gutter="15",
                v-for="(__item, __index) in _item.items",
                :key="'a' + __index"
              )
                Col(span="16")
                  Input(
                    size="small",
                    v-model="__item.text",
                    :placeholder="$lang('标题')"
                  )
                  Input(
                    size="small",
                    v-model="__item.link",
                    :placeholder="$lang('链接')"
                  )
                    Upload(
                      slot="append",
                      action="/api/v1/storage/file/image",
                      name="uploadFile",
                      :beforeUpload="beforeUpload",
                      :on-success="uploadSuccess",
                      :show-upload-list="false",
                      :data="{ echoStr: 'foot' + '_' + index + '_' + _index + '_' + __index }"
                    )
                      Icon(type="md-cloud-upload")
                Col(span="8")
                  Button(
                    type="error",
                    ghost,
                    size="small",
                    long,
                    @click="remove(_item.items, index, _index, __index)"
                  ) {{ $lang('删除') }}
                  .manage-button
                    Checkbox.manage-text(v-model="__item.blank") {{ $lang('新窗口') }}
                Col(span="24")
                  Divider
            Button(
              icon="md-add-circle",
              long,
              @click="createLink(data.footConfigList[index]['list'][_index]['items'])"
            ) {{ $lang('新建') }}
  Spin(fix, v-show="spinShow")
  Fixed(v-if="!isRead")
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="pageLoading", loading, long) {{ $lang('加载中') }}
        Button(
          @click="submit",
          :loading="loading",
          type="primary",
          long,
          v-else
        ) {{ $lang('保存') }}
</template>
<script>
import { mapState } from 'vuex'
import draggable from 'vuedraggable'
import { systemFunctions } from '@/libs/common'
export default {
  components: {
    draggable,
  },
  data() {
    return {
      linkMap: {
        otc: '/otc',
        exchange: '/exchange',
        futures: '/contract/quote',
        margin: '/cross-margin',
      },
      pageLoading: false,
      loading: false,
      spinShow: false,
      type: 'head',
      manageMenuWin: false,
      editIndex: '',
      subIndex: '',
      children: [],
      application: [
        {
          link: '/content/news',
          url: '/content/news',
          text: this.$lang('新闻资讯'),
        },
        {
          link: '/convert',
          url: '/convert',
          text: this.$lang('闪电兑换'),
        },
        {
          link: '{otcDomain}/otc/third-party',
          url: '{otcDomain}/otc/third-party',
          text: this.$lang('信用卡买币'),
        },
        {
          link: '/xo/',
          url: '/xo/',
          text: this.$lang('抢购活动'),
        },
        {
          link: '/staking/',
          url: '/staking/',
          text: this.$lang('财富产品'),
        },
        {
          link: '/coininfo/',
          url: '/coininfo/',
          text: this.$lang('币种资料'),
        },
      ],
      data: {
        headConfigList: [],
        footConfigList: [],
      },
    }
  },
  computed: {
    ...mapState(['lang', 'isRoot', 'isRead', 'functions']),
  },
  methods: {
    removeMenu(arr, index, _index) {
      this.data.headConfigList[index]['list'] = arr.filter(
        (el, i) => _index != i
      )
    },
    remove(arr, index, _index, __index) {
      this.data.footConfigList[index]['list'][_index]['items'] = arr.filter(
        (el, i) => __index != i
      )
    },
    createLink(list, system) {
      const json = {
        text: '',
        link: '',
        nofollow: true,
        blank: true,
        children: [],
      }
      if (system) {
        json['system'] = true
      }
      list.push(json)
    },
    uploadSuccess(result) {
      this.spinShow = false
      if (result.code != 0) {
        return
      }
      this.$Notice.success({
        title: this.$lang('成功'),
      })

      let arr = result.data.echoStr.split('_')

      if (arr[0] == 'foot') {
        this.data.footConfigList[arr[1]]['list'][arr[2]]['items'][arr[3]].link =
          result.data.url
      } else {
        this.data.headConfigList[arr[1]]['list'][arr[2]].link = result.data.url
      }
    },
    beforeUpload() {
      this.spinShow = true
    },
    manageMenu(editIndex, subIndex) {
      this.manageMenuWin = true
      this.editIndex = editIndex
      this.subIndex = subIndex
      this.children = [
        ...this.data.headConfigList[editIndex].list[subIndex].children,
      ]
    },
    pushData() {
      this.children.push({
        blank: false,
        link: '',
        text: '',
        nofollow: false,
      })
    },
    removeItem(index) {
      this.children = this.children.filter((el, _index) => _index != index)
    },
    saveMenu() {
      this.data.headConfigList[this.editIndex].list[this.subIndex].children = [
        ...this.children,
      ]
    },
    load() {
      this.pageLoading = true
      this.data.headConfigList = []
      this.data.footConfigList = []

      Object.keys(this.lang).forEach((locale, index) => {
        this.data.footConfigList.push({
          enable: index === 0 ? 1 : 0,
          locale,
          list: [
            {
              caption: '',
              items: [],
            },
            {
              caption: '',
              items: [],
            },
            {
              caption: '',
              items: [],
            },
            {
              caption: '',
              items: [],
            },
          ],
        })

        this.data.headConfigList.push({
          enable: index === 0 ? 1 : 0,
          locale,
          list: [],
        })
      })

      this.$axios.get('/api/v1/broker/config').then((result) => {
        this.pageLoading = false
        if (result.code == 0) {
          Object.keys(result.data).forEach((el) => {
            if (el == 'footConfigList') {
              if (result.data[el] && result.data[el].length) {
                result.data[el].forEach((_el) => {
                  this.data[el].forEach((_locale) => {
                    if (_el.locale === _locale.locale) {
                      let len = 4 - _el.list.length
                      Object.assign(_locale, _el)
                      while (len > 0) {
                        len--
                        _el.list.push({
                          caption: '',
                          items: [],
                        })
                      }
                    }
                  })
                })
              }
            } else if (el == 'headConfigList') {
              let headConfigList = result.data[el]
              if (headConfigList && headConfigList.length) {
                headConfigList.forEach((_el) => {
                  this.data[el].forEach((__el) => {
                    if (_el.locale === __el.locale) {
                      Object.assign(__el, _el)
                    }
                  })
                })
              }
            } else {
              this.data[el] = result.data[el]
            }
          })
        }
      })
    },

    submit() {
      this.loading = true

      this.data.headConfigList.forEach((el, index) => {
        this.data.headConfigList[index]['list'] = el.list.filter(
          (__el) => __el.text && __el.link
        )
      })

      this.data.footConfigList.forEach((el, index) => {
        el.list.forEach((_el, _index) => {
          this.data.footConfigList[index]['list'][_index][
            'items'
          ] = _el.items.filter((__el) => __el.text && __el.link)
        })
        el.list = el.list.filter((_el) => _el.caption || _el.items.length)
      })

      this.$axios.post('/api/v1/broker/config/submit', this.data).then(() => {
        this.loading = false
        this.$Notice.success({
          title: this.$lang('成功'),
        })
        this.load()
      })
    },
  },
  created() {
    systemFunctions.forEach((el) => {
      if (this.functions[el.link] && this.linkMap[el.link]) {
        this.application.push({
          ...el,
          text: this.$lang(el.text),
          url: this.linkMap[el.link],
        })
      }
    })
    this.load()
  },
}
</script>
