<template>
  <div class="flex justify-center text-white">
    <label
      v-for="(type, index) in types"
      :key="type.key"
      :for="type.key"
      :class="[
        typeValue === type.key ? 'border border-gray-700 bg-gray-600' : 'bg-gray-400',
        index === 0 ? 'rounded-l' : '',
        index == types.length - 1 ? 'rounded-r' : '',
      ]"
      class="block p-1 shadow-md w-32 font-bold"
      @change="emit"
    >
      <input v-model="typeValue" type="radio" :id="type.key" :value="type.key" hidden>
      {{ type.value }}
    </label>
  </div>
</template>

<script>
export default {
  name: 'type-tab',
  props: {
    types: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      typeValue: this.type
    }
  },
  methods: {
    emit() {
      this.$emit('update-type', this.typeValue)
    }
  }
}
</script>