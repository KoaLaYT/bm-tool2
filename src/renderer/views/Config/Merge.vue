<template>
    <div>
        <!-- 项目名称 -->
        <bm-project-name ref="name"></bm-project-name>
        <!-- 文件路径 -->
        <el-container class="flex-between">
            <el-form
                ref="form"
                :model="formData"
                :rules="rules"
                inline
                hide-required-asterisk
                size="mini"
            >
                <el-form-item
                    label="文件路径："
                    prop="path"
                >
                    <el-input
                        v-model="formData.path"
                        @input="getFile"
                        style="width:50vw"
                    ></el-input>
                </el-form-item>
            </el-form>
            <el-container>
                <el-button
                    type="primary"
                    size="mini"
                    style="margin-left:auto"
                    @click="merge"
                >对表</el-button>
                <el-button
                    type="success"
                    size="mini"
                    @click="output"
                >导出</el-button>
            </el-container>
        </el-container>
        <!-- 文件列表 -->
        <el-checkbox-group
            v-model="selectedFiles"
            style="height: 300px;overflow-y: scroll;overflow-x:hidden"
        >
            <el-checkbox
                v-for="file in files"
                :label="file.name"
                :key="file.name"
                style="display:block;margin-bottom:0.5rem"
            >
                <el-tag
                    size="mini"
                    :type="tagType(file.tag)"
                    style="font-family: monospace"
                >{{ file.tag }}</el-tag>
                <span style="margin-left:10px">{{ file.name }}</span>
            </el-checkbox>
        </el-checkbox-group>
    </div>
</template>

<script>
import BmProjectName from "@/components/BmProjectName";
import { FileUtil } from "@/utils/file";
import { emitter, MergeUtil } from "@/utils/merge";

export default {
  name: "Merge",
  components: {
    BmProjectName
  },
  data() {
    const pathFormat = (rule, value, cb) => {
      if (value) {
        const isValid = /[/\\]$/.test(value);
        if (!isValid) {
          return cb(new Error("路径必须以 \\ 结尾"));
        }
      }
      cb();
    };
    return {
      formData: {
        path: ""
      },
      rules: {
        path: [
          { required: true, message: "请填写文件路径" },
          { validator: pathFormat, trigger: "blur" }
        ]
      },
      files: [],
      selectedFiles: [],

      loading: undefined
    };
  },
  created() {
    emitter.on("merged", () => {
      this.workFinish("对表完成，新母表已生成");
    });
    emitter.on("outputed", () => {
      this.workFinish("导出完成，新TIPS已生成");
    });
  },
  methods: {
    async getFile(path) {
      this.files = [];
      if (/[/\\]$/.test(path)) {
        this.files = await FileUtil.getFiles(path);
      }
    },
    /** 对表或导出完成后 */
    async workFinish(message) {
      // 更新文件列表
      await this.getFile(this.formData.path);
      this.loading && this.loading.close();
      this.loading = undefined;
      this.$message({
        message,
        type: "success",
        showClose: true,
        center: true
      });
    },
    /** 对表 */
    async merge() {
      const ok = await this.allowToWork(FileUtil.checkMergeValidation);
      if (!ok) return;

      const info = {
        ...this.formData,
        ...this.$refs.name.formData
      };

      this.loading = this.$loading({ fullscreen: true });
      setTimeout(() => {
        MergeUtil.mergeXlsxs([...this.selectedFiles], info.path, info.pvs);
      }, 500);
    },
    /** 导出 */
    async output() {
      const ok = await this.allowToWork(FileUtil.checkOutputValidation);
      if (!ok) return;

      const info = {
        ...this.formData,
        ...this.$refs.name.formData
      };

      this.loading = this.$loading({ fullscreen: true });
      setTimeout(() => {
        MergeUtil.outputTips([...this.selectedFiles], info.path);
      }, 500);
    },
    // ========HELPERS==========
    tagType(tag) {
      const dict = {
        TIPS: "primary",
        QPNI: "success",
        MQPL: "warning"
      };
      return dict[tag];
    },

    async allowToWork(validationFn) {
      if (
        !(await this.validateForms([
          this.$refs.form,
          this.$refs.name.$refs.form
        ]))
      ) {
        return false;
      }

      const err = validationFn([...this.selectedFiles]);
      if (err) {
        this.errorMsg(err);
        return false;
      }

      return true;
    },

    async validateForms(forms) {
      const valid = await Promise.all(forms.map(formValidation)).catch(e => e);
      return Array.isArray(valid);

      function formValidation(form) {
        return new Promise((resolve, reject) => {
          form.validate(async valid => {
            if (!valid) reject(new Error("inValid"));
            else resolve(true);
          });
        });
      }
    },

    errorMsg(message) {
      this.$message({
        message,
        type: "error",
        showClose: true,
        center: true
      });
    }
  }
};
</script>
