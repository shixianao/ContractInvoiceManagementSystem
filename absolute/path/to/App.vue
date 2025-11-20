<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: #1a1a1a;
  color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
}

#app {
  width: 100%;
  height: 100vh;
}
</style>