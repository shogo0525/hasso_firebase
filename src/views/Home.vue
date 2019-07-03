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

    <hr>

    <div class="mt-3">
      <h4>一覧公開されているボード</h4>
      <table class="mt-3 mr-auto ml-auto">
        <tr v-for="board in publishedBoards" :key="board.id">
          <td><router-link :to="{ name: 'board.show', params: { id: board.id }}">{{ board.name }}</router-link></td>
        </tr>
      </table>
    </div>

    <div class="mt-3" v-if="admin">
      <h4>アドミンスペース: {{ admin.email }}</h4>
      <table class="mt-3 mr-auto ml-auto">
        <tr v-for="board in boards" :key="board.id">
          <td>{{ board.id }}</td>
          <td>{{ board.created_at | firebasets2Date }}</td>
          <td><router-link :to="{ name: 'board.show', params: { id: board.id }}">{{ board.name }}</router-link></td>
          <!-- <td><button @click='deleteBoard(board.id)'>削除</button></td> -->
          <td>
            <v-btn v-if='!board.public' @click='publishBoard(board.id)'>一覧公開</v-btn>
            <v-btn v-else @click='unpublishBoard(board.id)'>非公開</v-btn>
          </td>
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
      publishedBoards: [],
      boards: []
    }
  },
  created() {
    this.fetchPublishedBoards()
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        this.admin = user
        const snapshot = await boardsRef.orderBy('created_at', 'desc').get()
        this.boards = snapshot.docs.map(doc => {
          return { id: doc.id, ...doc.data() }
        })
      }
    })
  },
  methods: {
    async fetchPublishedBoards() {
      const snapshot = await boardsRef.orderBy('created_at', 'desc').where('public', '==', true).get()
      this.publishedBoards = snapshot.docs.map(doc => {
        return { id: doc.id, ...doc.data() }
      })
    },
    createNewBoard() {
      if (this.board_name.length == 0) {
        alert("ボードの名前を入力してください")
        return
      }
      boardsRef.add({
        name: this.board_name,
        created_at: firebase.firestore.Timestamp.now()
      }).then((docRef) => {
        this.$router.push({ name: 'board.show', params: { id: docRef.id }})
      }).catch((error) => {
        console.log(`Error adding document: ${error}`)
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
    },
    async publishBoard(id) {
      if (!this.admin) return
      try {
        boardsRef.doc(id).set({
          public: true
        }, { merge: true })
        console.log("Document successfully published!")
      } catch (e) {
        console.log('error', e)
      }
    },
    async unpublishBoard(id) {
      if (!this.admin) return
      try {
        boardsRef.doc(id).set({
          public: false
        }, { merge: true })
        console.log("Document successfully unpublished!")
      } catch (e) {
        console.log('error', e)
      }
    },
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
