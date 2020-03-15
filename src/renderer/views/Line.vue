<template>
    <div>
        <el-page-header @back="goBack">
            <template #title><span style="line-height:36px">返回</span></template>
        </el-page-header>
        <div v-loading="loading">
            <a
                :href="drawnUrl"
                download="123.png"
            >
                <img
                    :src="drawnUrl"
                    fit="contain"
                    style="width: 100%"
                />
            </a>

            <el-container
                direction="vertical"
                style="margin-top:10px"
            >
                <el-container>
                    <el-radio-group
                        v-model="amends.type"
                        @change="draw"
                    >
                        <el-radio label="zp5">ZP5</el-radio>
                        <el-radio label="zp7">ZP7</el-radio>
                    </el-radio-group>
                </el-container>
                <el-container>
                    <div style="width:150px">
                        <span>宽度：</span>
                        <span>{{guess.width}}</span>
                    </div>
                    <div style="margin-left:3rem">
                        <span>调整值：</span>
                        <el-input-number
                            v-model="amends.width"
                            :step="0.05"
                            :precision="2"
                            size="mini"
                            @change="draw"
                        ></el-input-number>
                    </div>
                    <div style="margin-left:3rem">
                        <span>实际值：</span>
                        <span>{{guess.width+amends.width}}</span>
                    </div>
                </el-container>
                <el-container>
                    <div style="width:150px">
                        <span>间距：</span>
                        <span>{{guess.gap}}</span>
                    </div>
                    <div style="margin-left:3rem">
                        <span>调整值：</span>
                        <el-input-number
                            v-model="amends.gap"
                            :step="0.05"
                            :precision="2"
                            size="mini"
                            @change="draw"
                        ></el-input-number>
                    </div>
                    <div style="margin-left:3rem">
                        <span>实际值：</span>
                        <span>{{guess.gap+amends.gap}}</span>
                    </div>
                </el-container>
                <el-container>
                    <div>
                        <span>长度：</span>
                        <el-input-number
                            v-model="amends.length"
                            :step="1"
                            :precision="0"
                            size="mini"
                            @change="draw"
                        ></el-input-number>
                    </div>
                </el-container>
                <el-container>
                    <div>
                        <span>箭头位置(%)：</span>
                        <el-input-number
                            v-model="amends.height"
                            :step="1"
                            :precision="0"
                            size="mini"
                            @change="draw"
                        ></el-input-number>
                        <span style="font-size:0.8rem">(最底部：0%，最顶部：100%)</span>
                    </div>
                </el-container>
                <el-container>
                    <div>
                        <span>底部要增加的高度(%)：</span>
                        <el-input-number
                            v-model="amends.heightRatio"
                            :step="1"
                            :precision="0"
                            size="mini"
                            @change="draw"
                        ></el-input-number>
                    </div>
                </el-container>

            </el-container>
        </div>
    </div>
</template>

<script>
import { drawLines, redraw } from "@/utils/draw-lines";
export default {
  computed: {
    info() {
      const info = this.$route.query.info;
      if (!info) return "";
      return JSON.parse(info);
    },
    path() {
      const path = this.$route.query.path;
      if (!path) return "";
      return JSON.parse(path);
    }
  },
  data() {
    return {
      drawnUrl: "",
      loading: false,
      guess: { width: 0, gap: 0 },
      amends: {
        width: 0.6,
        gap: 0.65,
        length: 650,
        type: "zp7",
        height: 0,
        heightRatio: 10
      }
    };
  },
  created() {
    this.draw();
  },
  methods: {
    goBack() {
      this.$electron.ipcRenderer.send("line:close");
    },
    async draw() {
      this.loading = true;
      const { url, guess } = await drawLines(
        this.path,
        this.info.info,
        this.amends
      ).finally(() => (this.loading = false));
      this.drawnUrl = url;
      this.guess = guess;
    }
  }
};
</script>