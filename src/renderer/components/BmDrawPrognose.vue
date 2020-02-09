<template>
    <el-form
        ref="form"
        :model="formData"
        :rules="rules"
        inline
        size="mini"
        label-width="100px"
    >
        <el-form-item
            label="预测周数："
            prop="progWeek"
        >
            <el-input
                v-model="formData.progWeek"
                clearable
            ></el-input>
        </el-form-item>
        <el-form-item
            v-for="prog in progs"
            :label="prog"
            :key="prog"
        >
            <el-input
                v-model="formData[prog]"
                clearable
                @change="$emit('progChange')"
            ></el-input>
        </el-form-item>
    </el-form>
</template>

<script>
export default {
  name: "BmDrawPrognose",
  props: {
    type: {
      type: String,
      required: true
    }
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
        progWeek: ""
      },
      rules: {
        progWeek: [
          { required: true, message: "请填写预测周数" },
          { validator: weekFormat, triger: "blur" }
        ]
      }
    };
  },
  computed: {
    progs() {
      return this.type.toUpperCase() === "ZP7"
        ? [
            "EM Offen",
            "Spaete.EMT",
            "Abgel.EMT",
            "Note6",
            "M/L i.A",
            "Q3",
            "EBV i.A",
            "FE54 i.A",
            "Note3",
            "Note1"
          ]
        : [
            "EM Offen",
            "Spaete.EMT",
            "Abgel.EMT",
            "Note6",
            "M/L i.A",
            "Q3",
            "Note3",
            "Note1"
          ];
    }
  }
};
</script>
