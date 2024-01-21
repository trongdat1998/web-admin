<!--杠杆币种借贷设置-->
<template lang="pug">
    .page-exchange
        Row.search(:gutter="15")
            Col(span="12")
                Input(:placeholder="$lang('UID')", v-model="searchForm.userId", search enter-button="" @on-search="loadData()")
            Col(span="4")
                Button(type="primary" long @click="add" :disabled="isRead" icon="md-add-circle" ghost) {{$lang('新建')}}
        Table(:columns="columns", :data="listData", :loading="loadingTable")
            template(slot-scope="{ row, index }" slot="isOpen")
                iSwitch(:disabled="isRead" size="small" v-model="row.isOpen" @on-change="onStatusChange(row,index)" :true-value="1" :false-value="2")
            template(slot-scope="{ row, index }" slot="action")
                Button(size="small" type="primary" ghost @click="edit(row)" :disabled="isRead") {{$lang('修改')}}
                Button(size="small" style="margin-left:12px" type="primary" ghost @click="deleteOp(row)" :disabled="isRead") {{$lang('删除')}}
        Modal(v-model="switchWin" title="" width="300" @on-cancel="cancel")
            h3 {{$lang('您确定要执行此操作吗？')}}
            Button(slot="footer" long type="error" @click="submit" :loading="loading" :disabled="loading") {{$lang('确定')}}
        Modal(v-model="deleteConfirm" title="" width="300" @on-cancel="cancel")
            h3 {{$lang('您确定要执行此操作吗？')}}
            Button(slot="footer" long type="error" @click="confirmDelete" :loading="loading" :disabled="loading") {{$lang('确定')}}
        Modal(v-model="showModal", :title="showType === 'add' ? $lang('新增借币限额配置') : $lang('修改借币限额配置')" width="800")
            Form(:label-width='150')
                FormItem(:label="$lang('UID')")
                    Input(v-model='formData.userId', :placeholder="$lang('UID')" :disabled="showType === 'edit'")
                FormItem(:label="$lang('借贷限额')")
                    Input(v-model='formData.loanLimit', :placeholder="$lang('借贷限额')")
                FormItem(:label="$lang('是否开启')")
                    iSwitch(size="small" v-model="formData.isOpen" :true-value="1" :false-value="2")
            template(slot="footer")
                Button(@click="submit", :loading="loading"  type="primary" :disabled="loading") {{$lang('确定')}}

</template>
<script>
    import {mapState} from "vuex";
    import {thousandFormatNumber} from "@/libs/common";

    export default {
        computed: {
            ...mapState(["lang", "isRead"]),
        },
        data() {
            return {
                showType: "",
                showModal: false,
                formData: {
                    userId: "",
                    loanLimit: "",
                    isOpen: 1
                },
                searchForm: {
                    userId: "",
                },
                loading: false,
                loadingTable: false,
                columns: [
                    {
                        title: this.$lang("AccountId"),
                        minWidth: 120,
                        key: "accountId",
                    },
                    {
                        title: this.$lang("UID"),
                        minWidth: 120,
                        key: "userId",
                    },
                    {
                        title: this.$lang("限额"),
                        minWidth: 120,
                        key: "loanLimit",
                    },
                    {
                        title: this.$lang("状态"),
                        minWidth: 120,
                        slot: "isOpen",
                    },
                    {
                        title: this.$lang("创建时间"),
                        minWidth: 100,
                        key: "created",
                        render: (h, params) =>
                            h(
                                "span",
                                this.newDate(params.row.created).format("yyyy-MM-dd hh:mm:ss")
                            ),
                    },
                    {
                        title: this.$lang("更新时间"),
                        minWidth: 100,
                        key: "updated",
                        render: (h, params) =>
                            h(
                                "span",
                                this.newDate(params.row.updated).format("yyyy-MM-dd hh:mm:ss")
                            ),
                    },
                    {
                        title: this.$lang("操作"),
                        fixed: "right",
                        align: "center",
                        slot: "action",
                        width: 140,
                    },
                ],
                listData: [],
                switchWin: false,
                deleteConfirm: false,
                deleteUserId: "",
            };
        },
        methods: {
            submit() {
                this.loading = true;
                this.$axios
                    .post("/api/v1/margin/set/risk_config/special_loan_limit", {
                        ...this.formData,
                    })
                    .then((result) => {
                        this.loading = false;
                        if (result.code == 0) {
                            this.showModal = false;
                            this.switchWin = false;
                            this.loadData();
                        }
                    });
            },
            loadData() {
                this.loadingTable = true;
                this.$axios
                    .get("/api/v1/margin/query/risk_config/special_loan_limit", {
                        params: {
                            ...this.searchForm,
                        },
                    })
                    .then((result) => {
                        this.loadingTable = false;
                        if (result.code == 0) {
                            this.listData = result.data;
                        }
                    });
            },
            add() {
                this.formData = {};
                this.showModal = true;
                this.showType = "add";
            },
            cancel() {
                this.listData = [...this.listData];
                this.switchWin = false;
            },
            edit(row) {
                Object.assign(this.formData, row);
                this.showModal = true;
                this.showType = "edit";
            },
            onStatusChange(row, index) {
                this.formData = {
                    userId: row.userId,
                    loanLimit: row.loanLimit,
                    isOpen: row.isOpen,
                };
                this.switchWin = true;
            },
            deleteOp(row) {
                this.deleteConfirm = true;
                this.deleteUserId = row.userId;
            },
            confirmDelete(row) {
                this.loading = true;
                this.$axios
                    .post("/api/v1/margin/del/risk_config/special_loan_limit", {
                        userId:this.deleteUserId,
                    })
                    .then((result) => {
                        this.loading = false;
                        if (result.code == 0) {
                            this.deleteConfirm = false;
                            this.loadData();
                            this.deleteUserId= "";
                        }
                    });

            },

        },
        created() {
            this.loadData();
        },
    };
</script>
