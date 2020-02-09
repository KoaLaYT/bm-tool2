<template>
    <el-form
        ref="form"
        label-width="100px"
        :model="formData"
        :rules="rules"
        inline
        size="mini"
        hide-required-asterisk
    >
        <el-form-item
            v-for="termin in termins"
            :label="termin.label"
            :prop="termin.field"
            :key="isNoVFF+termin.label"
        >
            <el-input
                v-model="formData[termin.field]"
                clearable
            ></el-input>
        </el-form-item>
    </el-form>
</template>

<script>
export default {
  name: "BmProjectTermin",
  props: {
    isNoVFF: {
      type: Boolean,
      required: true
    },
    reset: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    reset() {
      this.$refs.form.resetFields();
    }
  },
  data() {
    const fields = [
      "VFF TBT",
      "VFF",
      "PVS TBT",
      "PVS",
      "OS TBT",
      "OS",
      "SOP TBT",
      "SOP"
    ];
    const weekFormat = (rule, value, cb) => {
      if (value) {
        const isValid = /^\d{4}-KW\d{2}$/.test(value);
        if (!isValid) {
          return cb(new Error("日期格式必须为yyyy-KWww"));
        }
      }
      cb();
    };
    const formData = fields.reduce(
      (res, field) => ({ ...res, [field]: "" }),
      {}
    );
    const rules = fields.reduce(
      (res, field) => ({
        ...res,
        [field]: [
          { required: true, message: `必须填写该时间` },
          { validator: weekFormat, trigger: "blur" }
        ]
      }),
      {}
    );
    return {
      fields,
      formData,
      rules
    };
  },
  computed: {
    termins() {
      return this.fields.map((field, index) => {
        let label = field;
        const noVFFLabels = ["PVS1 TBT", "PVS1", "PVS2 TBT", "PVS2"];
        if (index < 4 && this.isNoVFF) {
          label = noVFFLabels[index];
        }
        return {
          label,
          field
        };
      });
    }
  }
};
</script>