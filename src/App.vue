<template>
  <div id="app" class="container text-center text-gray-800">
    <!-- <div class="fixed top-0 right-0 m-8 p-3 text-xs font-mono text-white h-6 w-6 rounded-full flex items-center justify-center bg-gray-700 sm:bg-pink-500 md:bg-orange-500 lg:bg-green-500 xl:bg-blue-500">
      <div class="block  sm:hidden md:hidden lg:hidden xl:hidden">all</div>
      <div class="hidden sm:block  md:hidden lg:hidden xl:hidden">sm</div>
      <div class="hidden sm:hidden md:block  lg:hidden xl:hidden">md</div>
      <div class="hidden sm:hidden md:hidden lg:block  xl:hidden">lg</div>
      <div class="hidden sm:hidden md:hidden lg:hidden xl:block">xl</div>
    </div> -->
    <div id="nav" class="p-5">
      <router-link to="/" class="underline font-bold">Home</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
</style>
