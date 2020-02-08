import Vue from "vue";
import VueRouter from "vue-router";
import Merge from "@/views/Merge";
import Draw from "@/views/Draw";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/merge"
  },
  {
    path: "/merge",
    name: "Merge",
    component: Merge
  },
  {
    path: "/draw",
    name: "Draw",
    component: Draw
  }
];

const router = new VueRouter({
  routes
});

export default router;
