<template>
  <div class="home">
    <img class="logo" alt="hasso logo" src="../assets/logo.png">
    <h2>発想を、爆発させよう</h2>
    <br>
    <h4>ポストイットでブレストする、をオンラインにしました。</h4>
    <div class="create_board">
      <v-text-field
        v-model="board_name"
        label="ボードの名前"
        outline
      ></v-text-field>
      <v-btn depressed small @click="createNewBoard">ボードをつくる</v-btn>
    </div>

    <div class="mt-3" v-if="admin">
      <h4>アドミンスペース: {{ admin.email }}</h4>
      <table class="mt-3 mr-auto ml-auto">
        <tr v-for="board in boards" :key="board.id">
          <td>{{ board.id }}</td>
          <td><router-link :to="{ name: 'board.show', params: { id: board.id }}">{{ board.name }}</router-link></td>
          <!-- <td><button @click='deleteBoard(board.id)'>削除</button></td> -->
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'
import { db } from '@/firebase/firestore'
const boardsRef = db.collection('boards')

export default {
  name: 'home',
  data() {
    return {
      admin: null,
      board_name: "",
      boards: ""
    }
  },
  created() {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        this.admin = user
        const snapshot = await boardsRef.get()
        this.boards = snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() }
        })
      }
    })
  },
  methods: {
    createNewBoard() {
      if (this.board_name.length == 0) {
        alert("ボードの名前を入力してください")
        return
      }
      boardsRef.add({
        name: this.board_name
      }).then((docRef) => {
        this.$router.push({ name: 'board.show', params: { id: docRef.id }})
      }).catch((error) => {
        console.log(`Error adding document: ${error}`) // eslint-disable-line
      })
    },
    async deleteBoard(id) {
      if (!this.admin) return
      try {
        boardsRef.doc(id).delete()
        console.log("Document successfully deleted!")
      } catch (e) {
        console.log('error', e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
  width: 200px;
  height: 200px;
}
.create_board {
  margin-top: 50px;
  .v-input {
    width: 300px;
    margin: 0 auto;
  }
  .v-btn {
    background: #eac545 !important;
    color: white;
  }
}
</style>
