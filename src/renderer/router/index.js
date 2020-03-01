import Vue from "vue";
import VueRouter from "vue-router";
import Merge from "@/views/Config/Merge";
import Draw from "@/views/Config/Draw";
import Canvas from "@/views/Canvas";
import Config from "@/views/Config";
import Line from "@/views/Line";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        redirect: "/config"
    },
    {
        path: "/config",
        component: Config,
        children: [
            {
                path: "/",
                component: Merge
            },
            {
                path: "/draw",
                component: Draw
            }
        ]
    },
    {
        path: "/canvas",
        component: Canvas
    },
    {
        path: "/line",
        component: Line
    }
];

const router = new VueRouter({
    routes
});

export default router;
