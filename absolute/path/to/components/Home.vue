<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <el-button type="primary" @click="toggleSidebar" icon="el-icon-menu" plain>
          {{ isCollapse ? '展开' : '收起' }}
        </el-button>
        <span class="system-title">合同发票管理系统</span>
      </div>
      <div class="header-right">
        <el-dropdown trigger="click">
          <span class="user-info">
            <el-icon name="user" />
            {{ userInfo.username }}
            <el-icon name="arrow-down" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click="logout">
              <el-icon name="switch-button" />退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </header>

    <!-- 主体内容区 -->
    <div class="main-content">
      <!-- 左侧菜单 -->
      <aside class="sidebar" :class="{ 'sidebar-collapse': isCollapse }">
        <el-menu
          :default-active="$route.path"
          class="el-menu-vertical-demo"
          background-color="#262626"
          text-color="#fff"
          active-text-color="#409EFF"
          :collapse="isCollapse"
          router
        >
          <el-menu-item index="/contracts">
            <el-icon name="document" />
            <span slot="title">合同管理</span>
          </el-menu-item>
          <el-menu-item index="/invoices">
            <el-icon name="money" />
            <span slot="title">发票管理</span>
          </el-menu-item>
        </el-menu>
      </aside>

      <!-- 右侧内容 -->
      <section class="content">
        <!-- 面包屑导航 -->
        <el-breadcrumb class="breadcrumb" separator="/">
          <el-breadcrumb-item :to="{ path: '/contracts' }" v-if="$route.path.includes('/contracts')">合同管理</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/invoices' }" v-if="$route.path.includes('/invoices')">发票管理</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 内容区域 -->
        <div class="content-body">
          <router-view />
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      isCollapse: false,
      userInfo: JSON.parse(window.localStorage.getItem('userInfo')) || {}
    }
  },
  methods: {
    toggleSidebar() {
      this.isCollapse = !this.isCollapse
    },
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        window.localStorage.clear()
        this.$router.push('/login')
        this.$message.success('退出成功')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #1a1a1a;
}

.header {
  height: 60px;
  background-color: #262626;
  border-bottom: 1px solid #404040;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.system-title {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #404040;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background-color: #262626;
  border-right: 1px solid #404040;
  transition: width 0.3s;
}

.sidebar-collapse {
  width: 64px;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}

.breadcrumb {
  margin-bottom: 20px;
  background-color: #262626;
  padding: 10px 15px;
  border-radius: 4px;
}

.content-body {
  flex: 1;
  background-color: #262626;
  border-radius: 4px;
  padding: 20px;
  overflow-y: auto;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
}

::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>