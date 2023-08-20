<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="greetings">
    <h1 class="primary">{{ title }}</h1>
    <h3>
      A 3D rendering pipeline running entirely in software.
      Written in Typescript by <a href="">@skoda</a>,
      modified from my own graphics coursework at
      <a href="https://www.digipen.edu">DigiPen</a>.
      Demo app in
      <a href="https://vuejs.org/">Vue 3</a>
      via
      <a href="https://github.com/vuejs/create-vue">create-vue</a>. 
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
