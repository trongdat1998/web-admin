<style lang="less" scoped>
.background {
  width: 100%;
  padding: 10px 0;
  font-size: 40px;
  text-align: center;
  color: #fff;
  position: relative;
  background-size: 100% auto;
  background-position: center;
  &:after {
    background: rgba(0, 0, 0, 0.5);
    content: " ";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .text {
    position: relative;
    z-index: 2;
  }
}
.time {
  font-size: 14px;
  font-weight: bold;
}
.content {
  padding: 0 20px 20px;
  ul {
    list-style-type: circle;
    padding-top: 10px;
    padding-left: 20px;
  }
  li {
    padding-bottom: 10px;
    font-size: 14px;
  }
  a {
    padding-left: 10px;
  }
  span {
    font-size: 12px;
    background: #f7f7f7;
    display: inline-block;
    padding: 0 5px;
    margin-right: 5px;
    border-radius: 2px;
    border: 1px solid #e8eaec;
    &.fe {
      color: #f5222d;
      background: #fff1f0;
      border-color: #ffa39e;
    }
  }
}
.title {
  font-size: 20px;
  padding: 20px;
}
.fixed {
  position: fixed;
  right: 100px;
  bottom: 100px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
  z-index: 10;
  i {
    display: block;
  }
  padding: 5px 10px;
  border-radius: 2px;
}
</style>

<template lang="pug">
Main
  .wrapper
    .background(:style="{ backgroundImage: `url(${background})` }")
      .text {{ $lang('交易系统营运管理中心') }}
    .title {{ $lang('更新日志') }}
    a.fixed(:href="`${supportDomain}/hc/`", target="_blank")
      Icon(type="md-clipboard", size="24")
      | {{ $lang('工单') }}
    .content
      Timeline
        TimelineItem
          p.time
            a(:href="`${supportDomain}/hc/`", target="_blank") {{ $lang('使用帮助、提交工单及意见反馈') }}
        TimelineItem(v-for="(item, key) in list", :key="key")
          p.time {{ key }}
          ul
            li(v-for="_item in format(item)")
              | {{ _item.text }}
              a(:href="_item.href", v-if="_item.href") {{ $lang('查看') }}
                Icon(type="md-open")
        TimelineItem
</template>
<script>
import { mapActions, mapState } from "vuex";
import cn from "../../libs/cn.log";
import en from "../../libs/en.log";
export default {
  computed: {
    ...mapState(["background"]),
  },
  methods: {
    ...mapActions(["setVersion"]),

    format(item) {
      let arr = item.split("\n");
      return arr.map((el) => {
        let _arr = el.trim().split("link->");
        return {
          text: _arr[0],
          href: _arr[1],
        };
      });
    },
  },
  data() {
    return {
      list: this.$i18n.locale == "zh-cn" ? cn : en,
    };
  },
  created(){
    this.setVersion()
  }
};
</script>
