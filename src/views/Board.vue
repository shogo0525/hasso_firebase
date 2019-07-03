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

      <type-tab :types="types" :type="type" v-on:update-type="updateType" class="mt-3" />

      <button @click="createNewPost" class="btn btn-yellow mt-5 w-32">投稿</button>
      <span class="block mt-1">(shift + enterで投稿)</span>
    </div>

    <hr class="my-5 h-1 bg-gray-300">

    <transition-group tag="ul" class="posts sm:flex sm:flex-wrap">
      <post-item
        v-for="post in posts"
        :post="post"
        :key="post.id"
        :postsRef="postsRef"
        class="mt-2 sm:mr-2"
      />
    </transition-group>
  </div>
</template>

<script>
/* eslint-disable */
import firebase from 'firebase'
import { db } from '@/firebase/firestore'
import TypeTab from '@/components/TypeTab'
import PostItem from '@/components/PostItem'

export default {
  name: 'board',
  components: {
    TypeTab,
    PostItem
  },
  data() {
    return {
      boardRef: "",
      postsRef: "",
      edit_board_name: false,
      board: null,
      post_text: "",
      types: [
        { key: 'memo', value: 'メモ・感想' },
        { key: 'question', value: '質問' },
      ],
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
  methods: {
    updateType(type) {
      this.type = type
    },
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
        console.error('Error adding document: ', e)
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
        console.error('Error adding document: ', e)
      }
    },
    async likePost(post) {
      try {
        await this.postsRef.doc(post.id).set({
          like: post.like + 1
        }, { merge: true })
      } catch (e) {
        console.error('Error liking document: ', e)
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