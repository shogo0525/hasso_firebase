<template>
  <div>
    <v-flex xs12 sm6 md3 mr-auto ml-auto>
      <v-text-field
        v-model="email"
        label="メールアドレス"
      ></v-text-field>
    </v-flex>
    <v-flex xs12 sm6 md3 mr-auto ml-auto>
      <v-text-field
        v-model="password"
        label="パスワード"
      ></v-text-field>
    </v-flex>
    <v-btn @click="login">ログイン</v-btn>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'admin-login',
  data() {
    return {
      email: "",
      password: ""
    }
  },
  methods: {
    login() {
      try {
        firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        this.$router.push({ name: 'home' })
      } catch (e) {
        console.log('error', e) // eslint-disable-line
      }
    }
  }
}
</script>