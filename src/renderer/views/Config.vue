<template>
    <div>
        <el-menu
            router
            default-active="/merge"
            mode="horizontal"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            style="margin-bottom:10px"
        >
            <el-menu-item index="/merge">对表</el-menu-item>
            <el-menu-item index="/draw">画图</el-menu-item>
        </el-menu>
        <router-view></router-view>
    </div>
</template>