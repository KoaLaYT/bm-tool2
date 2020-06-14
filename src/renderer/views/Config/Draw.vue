<template>
    <div>
        <el-form
            ref="form"
            :model="formData"
            :rules="rules"
            inline
            hide-required-asterisk
            size="mini"
        >
            <el-container style="justify-content:space-between">
                <el-form-item label="项目名：" prop="name">
                    <el-autocomplete
                        v-model="formData.name"
                        clearable
                        :fetch-suggestions="suggestions"
                        @select="handleSelect"
                    >
                        <template slot-scope="{ item }">
                            <el-container
                                style="align-items:center;justify-content:space-between"
                            >
                                <span
                                    style="width:5rem;overflow-x:scroll;overflow-y:hidden;padding:0.5rem 0"
                                >
                                    {{ item.value }}
                                </span>
                                <el-button
                                    type="plain"
                                    icon="el-icon-close"
                                    circle
                                    @click.stop="deleteProject(item.value)"
                                ></el-button>
                            </el-container>
                        </template>
                    </el-autocomplete>
                </el-form-item>
                <el-form-item>
                    <el-checkbox v-model="formData.isNoVFF"
                        >这个项目分为PVS1和PVS2</el-checkbox
                    >
                </el-form-item>
            </el-container>
            <el-container style="flex-flow:row nowrap">
                <el-form-item label="起始周：" prop="startWeek">
                    <el-input v-model="formData.startWeek" clearable></el-input>
                </el-form-item>
                <el-form-item label="结束周：" prop="endWeek">
                    <el-input v-model="formData.endWeek" clearable></el-input>
                </el-form-item>
                <el-form-item label="当前周：" prop="curWeek">
                    <el-select
                        v-model="formData.curWeek"
                        clearable
                        :disabled="weekRange.length === 0"
                        :placeholder="
                            weekRange.length === 0 ? '请先填写起始/结束周' : ''
                        "
                    >
                        <el-option
                            v-for="week in weekRange"
                            :key="week"
                            :value="week"
                            >{{ week }}</el-option
                        >
                    </el-select>
                </el-form-item>
            </el-container>
        </el-form>
        <el-tabs
            tab-position="top"
            style="height: 250px;"
            v-model="selectedTab"
        >
            <el-tab-pane label="ZP5 Terminplan">
                <bm-project-termin
                    ref="zp5"
                    :isNoVFF="formData.isNoVFF"
                    :reset="resetForm"
                ></bm-project-termin>
            </el-tab-pane>
            <el-tab-pane label="ZP7 Terminplan">
                <bm-project-termin
                    ref="zp7"
                    :isNoVFF="formData.isNoVFF"
                    :reset="resetForm"
                ></bm-project-termin>
            </el-tab-pane>
        </el-tabs>
        <el-container style="align-items:flex-start">
            <el-button
                type="primary"
                size="mini"
                style="margin-left:10px"
                @click="save"
                >保存</el-button
            >
            <el-button type="danger" size="mini" @click="reset">重置</el-button>
            <el-upload
                ref="upload"
                action=""
                accept=".xlsx, image/*"
                :on-change="checkFile"
                :before-remove="() => (fullFilePath = '')"
                :auto-upload="false"
                class="filepicker"
            >
                <el-button size="mini" type="success" style="margin-left: 10px"
                    >母表/截图</el-button
                >
            </el-upload>
            <el-button
                type="success"
                size="mini"
                style="margin-left:auto;margin-right:10px"
                @click="draw"
                >画图</el-button
            >
        </el-container>
    </div>
</template>

<script>
import { LocalStorageUtil } from "@/utils/localstorage";
import { FormUtil } from "@/utils/form";
import BmProjectTermin from "@/components/BmProjectTermin";
import { DrawerUtil } from "@/utils/drawer";
import { totalFullWeeks } from "@/utils/week-range";

export default {
    name: "Draw",
    components: {
        BmProjectTermin,
    },
    data() {
        const weekFormat = (rule, value, cb) => {
            if (value) {
                const isValid = /^\d{4}-KW\d{2}$/.test(value);
                if (!isValid) {
                    return cb(new Error("日期格式必须为yyyy-KWww"));
                }
            }
            cb();
        };
        return {
            formData: {
                name: "",
                isNoVFF: false,
                startWeek: "",
                endWeek: "",
                curWeek: "",
            },
            rules: {
                name: [{ required: true, message: "请填写项目名" }],
                startWeek: [
                    { required: true, message: "请填写项目的起始周" },
                    { validator: weekFormat, trigger: "blur" },
                ],
                endWeek: [
                    { required: true, message: "请填写项目的结束周" },
                    { validator: weekFormat, trigger: "blur" },
                ],
                curWeek: [{ required: true, message: "请选择当前周" }],
            },
            allProjects: [],
            selectedTab: "0",
            resetForm: false,
            fullFilePath: "",

            imageFile: undefined,

            loading: undefined,
        };
    },
    computed: {
        weekRange() {
            let result = [];
            const weekTest = /^\d{4}-KW\d{2}$/;
            if (
                weekTest.test(this.formData.startWeek) &&
                weekTest.test(this.formData.endWeek)
            ) {
                result = totalFullWeeks(
                    this.formData.startWeek,
                    this.formData.endWeek
                );
            }
            // 当前周在范围之外的话，清空它！
            if (!result.includes(this.formData.curWeek)) {
                this.formData.curWeek = "";
            }

            return result;
        },
    },
    created() {
        this.allProjects = LocalStorageUtil.getProjects();
    },
    methods: {
        suggestions(queryString, cb) {
            cb(this.allProjects.filter((p) => p.value.includes(queryString)));
        },

        handleSelect(item) {
            const termDefault = {
                "VFF TBT": "",
                VFF: "",
                "PVS TBT": "",
                PVS: "",
                "OS TBT": "",
                OS: "",
                "SOP TBT": "",
                SOP: "",
            };
            const fields = [
                { name: "startWeek", default: "" },
                { name: "endWeek", default: "" },
                { name: "curWeek", default: "" },
                { name: "isNoVFF", default: false },
                { name: "zp5Term", child: "zp5", default: { ...termDefault } },
                { name: "zp7Term", child: "zp7", default: { ...termDefault } },
            ];
            const info = LocalStorageUtil.getProjectInfo(
                item.value,
                fields.map((f) => f.name)
            );
            fields.forEach((f) => {
                if (!f.child) {
                    this.formData[f.name] = info[f.name] || f.default;
                } else {
                    const termin = info[f.name] || f.default;
                    this.$refs[f.child].formData = { ...termin };
                }
            });
        },

        deleteProject(name) {
            LocalStorageUtil.deleteProject(name);
            this.$refs.form.resetFields();
            this.resetForm = !this.resetForm;
            this.allProjects = LocalStorageUtil.getProjects();
        },

        async save() {
            const res = await FormUtil.validateForms([
                this.$refs.form,
                this.$refs.zp5.$refs.form,
                this.$refs.zp7.$refs.form,
            ]);

            if (res > 0) {
                this.selectedTab = String(res - 1);
                return;
            }

            if (res === -1) {
                LocalStorageUtil.setProjectInfo({
                    ...this.composeProjectInfo(),
                });
                this.$message({
                    message: "保存成功",
                    type: "success",
                    showClose: true,
                    center: true,
                });
            }
        },

        reset() {
            this.$refs.form.resetFields();
            this.resetForm = !this.resetForm;
        },

        checkFile(file) {
            if (/^image/i.test(file.raw.type)) {
                this.fullFilePath = "";
                this.imageFile = file;
            } else if (!/mqpl/i.test(file.name)) {
                this.fullFilePath = "";
                this.imageFile = undefined;
                this.$refs.upload.clearFiles();
                this.$message({
                    message: "请选择MQPL母表",
                    type: "error",
                    showClose: true,
                    center: true,
                });
            } else {
                this.fullFilePath = file.raw.path;
                this.imageFile = undefined;
            }
        },

        async draw() {
            // 表格完整性验证
            const res = await FormUtil.validateForms([
                this.$refs.form,
                this.$refs.zp5.$refs.form,
                this.$refs.zp7.$refs.form,
            ]);
            if (res > 0) {
                this.selectedTab = String(res - 1);
            }
            if (res !== -1) return;
            // 是否选择了母表
            if (!this.fullFilePath && !this.imageFile) {
                return this.$message({
                    message: "请选择MQPL母表或曲线截图",
                    type: "error",
                    showClose: true,
                    center: true,
                });
            }

            this.loading = this.$loading({ fullscreen: true });
            if (this.fullFilePath) {
                this.$electron.ipcRenderer.send("draw:open", {
                    info: JSON.stringify({ ...this.composeProjectInfo() }),
                    path: JSON.stringify(this.fullFilePath),
                });
            } else if (this.imageFile) {
                this.$electron.ipcRenderer.send("line:open", {
                    info: JSON.stringify({ ...this.composeProjectInfo() }),
                    path: JSON.stringify(
                        window.URL.createObjectURL(this.imageFile.raw)
                    ),
                });
            }
            setTimeout(() => {
                this.loading && this.loading.close();
            }, 3000);
        },

        composeProjectInfo() {
            return {
                name: this.formData.name,
                info: {
                    startWeek: this.formData.startWeek,
                    endWeek: this.formData.endWeek,
                    curWeek: this.formData.curWeek,
                    isNoVFF: this.formData.isNoVFF,
                    zp5Term: {
                        ...this.$refs.zp5.formData,
                    },
                    zp7Term: {
                        ...this.$refs.zp7.formData,
                    },
                },
            };
        },
    },
};
</script>

<style>
.el-upload-list__item {
    margin-top: 0 !important;
    margin-left: 10px;
    width: 300px !important;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.filepicker {
    display: flex;
    align-items: flex-start;
}
</style>
