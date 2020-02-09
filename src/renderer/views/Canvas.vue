<template>
  <div>
    <el-page-header @back="goBack">
      <template #title><span style="line-height:36px">返回</span></template>
      <template #content>
        <el-radio-group
          v-model="selectedType"
          @change="handleChange"
          size="mini"
          style="display:block;margin:5px auto 0 0"
        >
          <el-radio-button
            v-for="type in types"
            :label="type"
          ></el-radio-button>
        </el-radio-group>
      </template>
    </el-page-header>

    <el-image
      :src="url"
      style="display:block;margin:20px auto;width:900px"
    ></el-image>

    <!-- 预测 -->
    <el-tabs
      v-model="selectedTab"
      tab-position="left"
      style="height: 200px;"
      @tab-click="tabClick"
    >
      <el-tab-pane v-for="(type, index) in types" :label="type">
        <BmDrawPrognose
          :ref="'prog' + index"
          :type="type"
          @progChange="progChange"
        ></BmDrawPrognose>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { DrawerUtil } from "@/utils/drawer";
import BmDrawPrognose from "@/components/BmDrawPrognose";

export default {
  components: {
    BmDrawPrognose
  },
  computed: {
    path() {
      const path = this.$route.query.path;
      if (!path) return "";
      return JSON.parse(path);
    },
    info() {
      const info = this.$route.query.info;
      if (!info) return "";
      return JSON.parse(info);
    }
  },
  data() {
    return {
      MQPL: [],
      url: "",
      types: ["ZP7", "ZP5 Gesamt", "ZP5 HT", "ZP5 KT", "ZP5 ZSB"],
      selectedType: "ZP7",
      selectedTab: "0"
    };
  },
  created() {
    this.MQPL = DrawerUtil.getMQPL(this.path);
    this.url = DrawerUtil.renderBMC(
      this.selectedType,
      this.MQPL,
      this.info.info
    );
  },
  methods: {
    handleChange(val) {
      this.url = DrawerUtil.renderBMC(
        this.selectedType,
        this.MQPL,
        this.info.info
      );
      this.selectedTab = String(this.types.indexOf(val));
    },

    tabClick() {
      this.selectedType = this.types[Number(this.selectedTab)];
      this.url = DrawerUtil.renderBMC(
        this.selectedType,
        this.MQPL,
        this.info.info
      );
    },

    goBack() {
      this.$electron.ipcRenderer.send("draw:close");
    },

    progChange() {
      const progComponent = this.$refs["prog" + this.selectedTab][0];
      progComponent.$refs.form.validate(async valid => {
        if (!valid) return;

        this.url = DrawerUtil.renderBMC(this.selectedType, this.MQPL, {
          ...this.info.info,
          prognose: {
            [this.selectedType]: {
              ...progComponent.formData
            }
          }
        });
      });
    }
  }
};
</script>
