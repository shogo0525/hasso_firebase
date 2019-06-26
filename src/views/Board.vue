<template>
  <div v-if="board" class="board">
    <h1
      v-show="!edit_board_name"
      @click="edit_board_name = true"
      class="text-xl font-bold"
    >
      ボード名: {{ board.name }}
    </h1>
    <div v-show="edit_board_name">
      <input
        v-model="board.name"
        class="mx-auto w-full sm:w-1/2 md:w-1/2 focus:outline-0 focus:shadow-outline border-2 border-gray-600 rounded p-4 block appearance-none leading-normal"
        type="text"
        placeholder="ボード名"
      />
      <button
        @click="updateBoardname"
        class="btn btn-gray mt-2"
      >
        変更
      </button>
    </div>

    <div class="my-5">
      <textarea
        v-model="post_text"
        @keydown.shift.enter="createNewPost"
        class="mx-auto w-full sm:w-1/2 focus:outline-0 focus:shadow-outline border-2 border-gray-600 rounded p-4 block appearance-none leading-normal"
        placeholder="メモ・感想、質問など"
      ></textarea>

      <div class="mt-3 mx-auto flex justify-center text-white">
        <label
          for="memo"
          :class="type === 'memo' ? 'border border-gray-700 bg-gray-600' : 'bg-gray-400'"
          class="block p-1 shadow-md w-32 font-bold rounded-l"
        >
          <input v-model="type" type="radio" id="memo" value="memo" class="mr-2" hidden>
          メモ・感想
        </label>
        <label
          for="question"
          :class="type === 'question' ? 'border border-gray-700 bg-gray-600' : 'bg-gray-400'"
          class="block p-1 shadow-md w-32 font-bold rounded-r"
        >
          <input v-model="type" type="radio" id="question" value="question" class="mr-2" hidden>
          質問
        </label>
      </div>

      <button @click="createNewPost" class="btn btn-yellow mt-5 w-32">投稿</button>
      <span class="block mt-1">(shift + enterで投稿)</span>
    </div>

    <hr class="my-5 h-1 bg-gray-300">

    <transition-group tag="ul" :class="viewType" class="posts sm:flex sm:flex-wrap">
      <li
        v-for="post in posts"
        :key="post.id"
        :class="`bg-${post.type}`"
        class="rounded overflow-hidden shadow-lg text-white flex flex-col justify-between
        w-full sm:min-w-xs sm:max-w-xs sm:w-auto
        mt-2 sm:mr-2"
      >
        <div class="px-5 py-5">
          <p class="text-base">{{ post.text }}</p>
        </div>
        <div class="px-2 flex justify-between">
          <span class="inline-block">
            <span @click="likePost(post)" class="inline-block mr-2">
              <svg class="stroke-current fill-current w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M11 0h1v3l3 7v8a2 2 0 0 1-2 2H5c-1.1 0-2.31-.84-2.7-1.88L0 12v-2a2 2 0 0 1 2-2h7V2a2 2 0 0 1 2-2zm6 10h3v10h-3V10z"/></svg>
            </span>
            <span class="inline-block">{{ post.like }}</span>
          </span>
          <span class="inline-block">
            <a :href="getTwitterUrl(post.text)" target="_blank" onclick="window.open(this.href, 'tweetwindow', 'width=650, height=470, personalbar=0, toolbar=0, scrollbars=1, sizable=1'); return false;">
              <img class="w-8 h-8" alt="twitter" src="../assets/twitter.png">
            </a>
          </span>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script>
import firebase from 'firebase'
import { db } from '@/firebase/firestore'

export default {
  name: 'board-show',
  data() {
    return {
      boardRef: "",
      postsRef: "",
      edit_board_name: false,
      board: null,
      post_text: "",
      type: 'memo',
      posts: [],
    }
  },
  created() {
    this.boardRef = db.collection('boards').doc(this.$route.params.id)
    this.postsRef = this.boardRef.collection('posts')

    this.fetchBoard()
    this.fetchPosts()
  },
  computed: {
    viewType() {
      return this.viewTab === 0 ? 'grid-view' : 'list-view'
    }
  },
  methods: {
    async fetchBoard() {
      const doc = await this.boardRef.get()
      if (!doc.exists) {
        this.$router.push({ name: 'home' })
        return
      }
      this.board = doc.data()
    },
    async fetchPosts() {
      this.postsRef.orderBy("created_at", "asc").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(change => {
          const data = change.doc.data()
          if (change.type === "added") {
            const like = data.like || 0
            const type = data.type || 'memo'
            const post = {
              id: change.doc.id,
              text: data.text,
              like,
              type,
              created_at: data.created_at
            }
            this.posts.unshift(post)
          } else if (change.type === "modified") {
            const post = this.posts.find(post => post.id === change.doc.id)
            post.like = data.like
          } else if (change.type === "removed") {
            this.posts = this.posts.filter(post => post.id !== change.doc.id)
          }
        })
      })
    },
    async updateBoardname() {
      if (this.board.name.length == 0) {
        alert("ボート名を入力してください")
        return
      }

      try {
        await this.boardRef.set({
          name: this.board.name,
        }, { merge: true })
      } catch (e) {
        console.error('Error adding document: ', e) // eslint-disable-line
      } finally {
        this.edit_board_name = false
      }
    },
    async createNewPost() {
      if (this.post_text.length == 0) {
        alert("ポストを入力してください")
        return
      }
      
      try {
        await this.postsRef.add({
          text: this.post_text,
          type: this.type || 'memo',
          created_at: firebase.firestore.Timestamp.now()
        })
        this.post_text = ""
      } catch (e) {
        console.error('Error adding document: ', e) // eslint-disable-line
      }
    },
    async deletePost(post_id) {
      try {
        await this.postsRef.doc(post_id).delete()
      } catch (e) {
        console.error('Error removing document: ', e) // eslint-disable-line
      }
    },
    async likePost(post) {
      try {
        await this.postsRef.doc(post.id).set({
          like: post.like + 1
        }, { merge: true })
      } catch (e) {
        console.error('Error liking document: ', e) // eslint-disable-line
      }
    },
    getTwitterUrl(post_text) {
      return `https://twitter.com/intent/tweet?text=${post_text}&hashtags=Webナイト宮崎`
    }
  }
}
</script>

<style lang="scss" scoped>
.posts {
  .v-enter-active {
    transition: all 0.5s;
  }
  .v-enter {
    opacity: 0;
    transform: translateY(-30px);
  }
}
</style>