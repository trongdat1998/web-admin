<style lang="less" scoped>
.wrap {
  border: 1px dashed #dcdee2;
  padding: 15px;
  margin: 10px 0;
}
.draggable-quoteToken {
  padding-top: 15px;
  padding-bottom: 15px;
  border-top: 1px solid #dcdee2;
}
</style>
<template lang="pug">
div
  Modal(v-model="visible" :title="$lang('交易区管理')" width="700" :mask-closable="false")
    
    .wrap
      Row(:gutter="20" v-show="!formData.contentlist.length")
        Col(span="24")
          Button(long ghost @click="createQuoteTokens" type="primary" icon="md-add-circle" ) {{$lang('新增交易区')}}
      template(v-if="formData.contentlist.length")
        Alert
          Checkbox(v-for="item in formData.contentlist", v-model="item.enable", :key="item.locale") {{lang[item.locale]}}
        Row(:gutter="20")
          Col(v-for="(item,index) in formData.contentlist" v-show="item.enable" :key="index" span="12")
            Divider(size="small") {{lang[item.locale]}}
            Input(v-model="item.tabName")
              span(slot="prepend") {{$lang('名称')}}
        Divider
        Row(:gutter="20")
          Col(span="12")
            Button(type="primary" @click="formData.contentlist=[]" ghost long) {{$lang('取消')}}
          Col(span="12")
            Button(type="primary" @click="pushData" long) {{$lang('确定')}}
    .wrap
      Row.draggable-quoteToken(:gutter="20")
        Col(:span="16")
          strong {{$lang('名称')}}
        Col(:span="8")
          strong {{$lang('操作')}}
      draggable(v-model="quoteTokens" draggable=".draggable-quoteToken" style="overflow:hidden")
        Row.draggable-quoteToken.move(:gutter="20" v-for="item,index in quoteTokens" :key="index")
          Col(:span="16") {{quoteTokensName(item.contentlist)}}
          Col(:span="4")
            Button(size="small" long ghost type="error" @click="removeQuoteTokens(index)") {{$lang('删除')}}
          Col(:span="4")
            Button(size="small" long ghost type="primary" @click="editQuoteTokens(item)") {{$lang('修改')}}
      Alert {{$lang('选中后拖动鼠标进行排序')}}
    template(slot="footer")
      Button(type="primary" @click="saveSymbolArea" :loading="loading" :disabled="loading") {{$lang('确定')}}
</template>
<script>
import draggable from "vuedraggable";
import { initData } from "@/libs/common.js";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["lang"])
  },
  components: {
    draggable
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    quoteTokensArea: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  watch: {
    value(val) {
      this.visible = val;
    },
    visible() {
      this.$emit("input", this.visible);
    },
    quoteTokensArea() {
      this.quoteTokens = [...this.quoteTokensArea];
    }
  },
  data() {
    return {
      loading: false,
      visible: this.value,
      quoteTokens: [...this.quoteTokensArea],
      formData: {
        id: "",
        contentlist: []
      }
    };
  },

  methods: {
    pushData() {
      if (this.formData.id) {
        this.quoteTokens.forEach(el => {
          if (el.id == this.formData.id) {
            Object.assign(el, JSON.parse(JSON.stringify(this.formData)));
          }
        });
      } else {
        this.quoteTokens.push(
          Object.assign({}, JSON.parse(JSON.stringify(this.formData)))
        );
      }
      this.formData.contentlist.length = 0;
    },
    createQuoteTokens() {
      this.formData.id = "";
      this.formData.contentlist = initData(
        this.lang,
        JSON.stringify({ tabName: "" }),'locale','enable'
      );
    },
    editQuoteTokens(item) {
      this.createQuoteTokens();
      this.formData.id = item.id;

      this.formData.contentlist.forEach(el => {
        item.contentlist.forEach(_el => {
          if (el.locale == _el.locale) {
            Object.assign(el, _el, { enable: !!_el.tabName });
          }
        });
      });
    },

    removeQuoteTokens(index) {
      this.quoteTokens = this.quoteTokens.filter(
        (el, _index) => index != _index
      );
    },
    quoteTokensName(list) {
      let name = list[0].tabName;
      list.forEach(el => {
        if (el.locale == this.$i18n.locale) {
          name = el.tabName;
        }
      });
      return name || list[0].locale;
    },
    saveSymbolArea() {
      this.loading = true;
      this.$axios
        .post("/api/v1/symbol/edit_cumstomer_quote_tokens", {
          items: this.quoteTokens
        })
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.visible = false;
            location.reload();
          }
        });
    }
  }
};
</script>