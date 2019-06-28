<template>
  <div>
    <input
      class="mx-auto w-64 focus:outline-0 focus:shadow-outline border-2 border-gray-600 rounded p-4 block appearance-none leading-normal"
      type="email"
      placeholder="メールアドレス"
      v-model="email"
    />
    <input
      class="mt-2 mx-auto w-64 focus:outline-0 focus:shadow-outline border-2 border-gray-600 rounded p-4 block appearance-none leading-normal"
      type="password"
      placeholder="パスワード"
      v-model="password"
    />
    <button 
      class="mt-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
      @click="login"
    >
      ログイン
    </button>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  data() {
    return {
      email: "",
      password: ""
    }
  },
  methods: {
    async login() {
      try {
        await firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        this.$router.push({ name: 'home' })
      } catch (e) {
        console.log('error', e) // eslint-disable-line
      }
    }
  }
}
</script>