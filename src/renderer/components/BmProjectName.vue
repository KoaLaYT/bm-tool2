<template>
  <el-container class="flex-between">
    <el-form
      ref="form"
      :model="formData"
      :rules="rules"
      inline
      hide-required-asterisk
      size="mini"
    >
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
              <span style="width:5rem;overflow:scroll;padding:0.5rem 0">{{
                item.value
              }}</span>

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
      <el-form-item label="PVS：" prop="pvs">
        <el-input v-model="formData.pvs" clearable></el-input>
      </el-form-item>
    </el-form>
    <el-button type="primary" size="mini" @click="saveProject">保存</el-button>
  </el-container>
</template>

<script>
import { LocalStorageUtil } from "@/utils/localstorage";

export default {
  name: "BmProjectName",
  created() {
    this.allProjects = LocalStorageUtil.getProjects();
  },
  data() {
    const pvsFormat = (rule, value, cb) => {
      if (value) {
        const isValid = /^\d{4}-KW\d{2}$/.test(value);
        if (!isValid) {
          return cb(new Error("pvs格式必须为yyyy-KWww"));
        }
      }
      cb();
    };
    return {
      allProjects: [],
      formData: {
        name: "",
        pvs: ""
      },
      rules: {
        name: [{ required: true, message: "请填写项目名" }],
        pvs: [
          { required: true, message: "请填写pvs时间" },
          { validator: pvsFormat, trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    suggestions(queryString, cb) {
      cb(this.allProjects.filter(p => p.value.includes(queryString)));
    },

    handleSelect(item) {
      this.formData.pvs = LocalStorageUtil.getProjectPvs(item.value);
    },

    saveProject() {
      this.$refs.form.validate(async valid => {
        if (!valid) return false;

        LocalStorageUtil.setProjectPvs({ ...this.formData });
        this.allProjects = LocalStorageUtil.getProjects();
        this.$message({
          message: "保存成功",
          type: "success",
          showClose: true,
          center: true
        });
      });
    },

    deleteProject(name) {
      LocalStorageUtil.deleteProject(name);
      this.$refs.form.resetFields();
      this.allProjects = LocalStorageUtil.getProjects();
    }
  }
};
</script>

<style scoped>
@import "../assets/commen.css";
</style>
