<template>
  <div class="home">
    <img class="mx-auto w-56 h-56" alt="hasso logo" src="../assets/logo.png">
    <div class="font-bold mt-1">
      <h1 class="text-2xl">発想を、爆発させよう</h1>
      <p class="mt-2">ポストイットでブレストする、をオンラインにしました。</p>
    </div>
    <div class="mt-10">
      <input
        v-model="board_name"
        class="mx-auto w-64 focus:outline-0 focus:shadow-outline border-2 border-gray-600 rounded p-4 block appearance-none leading-normal"
        type="text"
        placeholder="ボードの名前"
      />
      <button
        @click="createNewBoard"
        class="mt-3 btn btn-yellow"
      >
        ボードをつくる
      </button>
    </div>

    <hr class="mt-5 h-1 bg-gray-300">

    <div class="mt-3">
      <h4>一覧公開されているボード</h4>
      <ul class="mt-3 mx-auto">
        <li
          v-for="board in publishedBoards"
          :key="board.id"
          class="mt-2"
        >
          <router-link
            :to="{ name: 'board.show', params: { id: board.id }}"
            class="underline"
            >
            {{ board.name }}
          </router-link>
        </li>
      </ul>
    </div>

    <template v-if="admin">
      <hr class="h-1 bg-gray-300">
      <div class="mt-3">
        <p class="font-bold">アドミンスペース: {{ admin.email }}</p>
        <table class="mt-3 mx-auto">
          <tr v-for="board in boards" :key="board.id">
            <td>{{ board.id }}</td>
            <td>{{ board.created_at | firebasets2Date }}</td>
            <td>
              <router-link
                :to="{ name: 'board.show', params: { id: board.id }}"
                class="underline"
              >
                {{ board.name }}
              </router-link>
            </td>
            <td>
              <button
                v-if='!board.public'
                @click='publishBoard(board.id)'
                class="btn btn-blue w-24"
              >
                一覧公開
              </button>
              <button
                v-else
                @click='unpublishBoard(board.id)'
                class="btn btn-green w-24"
              >
                非公開
              </button>
            </td>
            <!-- <td><button @click='deleteBoard(board.id)' class="text-red-500">削除</button></td> -->
          </tr>
        </table>
      </div>
    </template>

  </div>
</template>

<script>
import firebase from 'firebase'
import { db } from '@/firebase/firestore'

const boardsRef = db.collection('boards')

export default {
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
    async createNewBoard() {
      if (this.board_name.length == 0) {
        alert("ボードの名前を入力してください")
        return
      }

      try {
        const docRef = await boardsRef.add({
          name: this.board_name,
          created_at: firebase.firestore.Timestamp.now()
        })
        this.$router.push({ name: 'board.show', params: { id: docRef.id }})
      } catch(e) {
        console.log(`Error adding document: ${e}`)
      }
    },
    async deleteBoard(id) {
      if (!this.admin) return
      try {
        await boardsRef.doc(id).delete()
        console.log("Document successfully deleted!")
      } catch (e) {
        console.log('error', e)
      }
    },
    async publishBoard(id) {
      if (!this.admin) return
      try {
        await boardsRef.doc(id).set({
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
        await boardsRef.doc(id).set({
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
