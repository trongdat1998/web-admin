<style lang="less" scoped>
  .border {
    border: 1px solid #ccc;
    display: inline-block;
    padding: 0 5px;
  }
</style>
<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="20")
      Alert {{$lang("用户标识用户可见，请知晓！显示入口：用户个人中心")}}
    Col(span="4")
      Button(type="primary" long @click="initFormItem" :disabled="isRead" icon="md-add-circle" ghost) {{$lang('新建')}}
  Table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{ row, index }" slot="tag")
      span.border(:style="objectStyle(row)") {{tag(row)}}
    template(slot-scope="{ row, index }" slot="action")
      template(v-if="isRead")
        a(@click.prevent="editTag(row)") {{$lang("查看")}}
      template(v-else)
        a(@click.prevent="editTag(row)") {{$lang("修改")}}
        | &nbsp;&nbsp;|&nbsp;&nbsp;
        a(@click.prevent="removeTag(row)") {{$lang("删除")}}
  Modal(v-model="creatWin", :title="$lang('标识')" width="800" :footer-hide="isRead")
    Form(:label-width='200')
      Divider(orientation="left") {{$lang("标签名称")}}
      Alert
        Checkbox(v-for="(item,index) in localeDetail", v-model="item.enable" :key="index") {{lang[item.language]}}
      template(v-for="item in localeDetail" v-if="item.enable")
        FormItem(:label="`${$lang('标签名称')}(${lang[item.language]})`")
          Input(v-model='item.labelValue', :placeholder="`${$lang('标签名称')}(${lang[item.language]})`")
            div(slot="append")
              span.border(:style="objectStyle(formData)" v-if="item.labelValue") {{item.labelValue}}
      Divider(orientation="left") {{$lang("扩展配置")}}
      FormItem(:label="$lang('标签颜色')")
        Input(:maxlength="7" v-model="formData.colorCode" placeholder="颜色")
          Select(slot="append" v-model="formData.colorCode" style="width:120px")
            Option(value="#3375E0")
              Icon(type="md-bookmark" color="#3375E0") 
              | #3375E0
            Option(value="#4299FF")
              Icon(type="md-bookmark" color="#4299FF") 
              | #4299FF
            Option(value="#FFC000")
              Icon(type="md-bookmark" color="#FFC000") 
              | #FFC000
            Option(value="#fff04e")
              Icon(type="md-bookmark" color="#fff04e") 
              | #fff04e
            Option(value="#d23434")
              Icon(type="md-bookmark" color="#d23434") 
              | #d23434
            Option(value="#ff695e")
              Icon(type="md-bookmark" color="#ff695e") 
              | #ff695e
      FormItem(label="UID")
        Input(v-model='formData.userIdsStr', :placeholder="$lang('每行对应一个UID')" :rows="8" type="textarea")
      Alert(type="error" v-if="errorUserIds.length" style="word-break:break-all;" show-icon)
        | {{$lang("UID不存在人数")}}：{{errorUserIds.length}}
        Icon(type="ios-bulb-outline" slot="icon")
        template(slot="desc") {{errorUserIds.join(',')}}
          p
            ButtonGroup
              Button(size="small" @click="filter('item')") {{$lang("一键分组")}}
              Button(size="small" @click="filter('flag')") {{$lang("一键标识")}}
              Button(size="small" @click="filter('clear')") {{$lang("一键清除错误ID")}}
    template(slot="footer")
      Button(@click="submit", :loading="loading"  type="primary" :disabled="loading") {{$lang('确定')}}
  Modal(v-model="removeWin" :title="$lang('您确定执行此操作吗？')" footer-hide width="300")
    Alert(v-if="removeData.labelId") {{$lang("删除")}} ：{{tag(removeData)}}
    Button(@click="remove"  :loading="loading" :disabled="loading" long type="error") {{$lang("确定")}}

</template>
<script>
  import { mapState } from 'vuex';
  export default {
    computed: {
      ...mapState(['lang', 'isRead']),
      userIdsStr() {
        if (this.formData.userIdsStr) {
          return this.formData.userIdsStr.replace(/ /g, '').split('\n');
        } else {
          return [];
        }
      },
    },
    data() {
      return {
        creatWin: false,
        removeWin: false,
        removeData: {
          labelId: '',
          localeDetail: [],
        },
        formData: {
          labelId: '',
          colorCode: '',
          userIdsStr: '',
          localeDetail: [],
        },
        searchForm: {
          endId: 0,
          fromId: 0,
          limit: 100,
        },
        errorUserIds: [],
        locale: this.$i18n.locale,
        localeDetail: [],
        loading: false,

        loadingTable: false,

        columns: [
          {
            type: 'index',
            minWidth: 60,
          },
          {
            title: this.$lang('时间'),
            minWidth: 190,
            sortable: true,
            sortType: 'desc',
            key: 'createdAt',
            render: (h, params) =>
              h('span', this.newDate(params.row.createdAt).format()),
          },
          {
            title: this.$lang('标签名称'),
            minWidth: 160,
            slot: 'tag',
          },
          {
            title: this.$lang('人数'),
            minWidth: 160,
            key: 'userCount',
          },
          {
            title: this.$lang('操作'),
            fixed: 'right',
            align: 'center',
            slot: 'action',
            width: 140,
          },
        ],
        listData: [],
      };
    },
    methods: {
      filter(type) {
        let before = [];
        let after = [];
        let check = {};

        this.errorUserIds.forEach((el) => (check[el] = true));

        this.userIdsStr.forEach((el) => {
          if (check[el] || type == 'flag') {
            before.push(check[el] && type == 'flag' ? +el + ' <-----' : el);
          } else {
            after.push(el);
          }
        });
        if (type == 'flag') {
          this.formData.userIdsStr = before.join('\n');
        } else if (type == 'clear') {
          this.formData.userIdsStr = after.join('\n');
        } else {
          this.formData.userIdsStr = [before.join('\n'), after.join('\n')].join(
            `\n↓↓↓↓↓↓↓↓↓↓↓↓↓${this.$lang('正常数据')}↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓\n`
          );
        }
        this.errorUserIds = [];
      },
      removeTag(row) {
        this.removeWin = true;
        Object.assign(this.removeData, row);
      },
      remove() {
        this.loading = true;
        this.$axios
          .post('/api/v1/custom_label/del', this.removeData)
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              this.removeWin = false;
              this.loadData();
            }
          });
      },
      submit() {
        this.loading = true;
        this.formData.localeDetail = this.localeDetail.filter((el) => {
          if (el.enable && el.labelValue) {
            return el;
          }
        });

        let data = Object.assign({}, this.formData);

        data.userIdsStr = this.userIdsStr.join(',');

        this.$axios.post('/api/v1/custom_label/save', data).then((result) => {
          this.loading = false;
          if (result.code == 0) {
            this.creatWin = false;
            this.loadData();
          } else {
            this.errorUserIds = result.data.errorUserIds || [];
          }
        });
      },
      loadData() {
        this.loadingTable = true;
        this.$axios
          .post('/api/v1/custom_label/query', this.searchForm)
          .then((result) => {
            this.loadingTable = false;
            if (result.code == 0) {
              this.listData = result.data;
            }
          });
      },
      initFormItem() {
        this.creatWin = true;
        Object.assign(this.formData, {
          labelId: '',
          colorCode: '',
          userIdsStr: '',
          localeDetail: [],
        });
        this.localeDetail = [];
        Object.keys(this.lang).forEach((lang, index) => {
          this.localeDetail.push({
            labelValue: '',
            language: lang,
            enable: index == 0,
          });
        });
      },
      editTag(row) {
        //初始化表单数据
        this.initFormItem();
        Object.assign(this.formData, row);

        this.localeDetail.forEach((el, index) => {
          row.localeDetail.forEach((_el) => {
            _el.enable = false;
            if (_el.language == el.language) {
              _el.enable = true;
              Object.assign(this.localeDetail[index], _el);
            }
          });
        });

        this.formData.userIdsStr = row.userIdsStr.split(',').join('\n');
      },
      tag(row) {
        let text = row.localeDetail[0].labelValue;
        row.localeDetail.forEach((el) => {
          if (el.language == this.locale) {
            text = el.labelValue;
          }
        });
        return text;
      },
      objectStyle(row) {
        return {
          color: row.colorCode,
          borderColor: row.colorCode,
        };
      },
    },
    created() {
      this.loadData();
    },
  };
</script>
