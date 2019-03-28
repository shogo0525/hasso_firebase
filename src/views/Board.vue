<template>
  <div v-if="board" class="board">
    <h1 v-show="!edit_board_name" @click="edit_board_name = true">ボード名: {{ board.name }}</h1>
    <div v-show="edit_board_name">
      <v-text-field
        class="input_board_name"
        v-model="board.name"
        label="ボード名"
        outline
      ></v-text-field>
      <v-btn depressed small @click="updateBoardname">変更</v-btn>
    </div>

    <div class="control">
      <v-textarea
        @keydown.shift.enter="createNewPost"
        v-model="post_text"
        rows="3"
        label="メモ・感想、質問、アイデア・提案など"
        outline
      ></v-textarea>

      <v-radio-group v-model="type" row class="radio-type">
        <v-radio class="memo" label="メモ・感想" value="memo"></v-radio>
        <v-radio class="question" label="質問" value="question"></v-radio>
        <v-radio class="idea" label="アイデア・提案" value="idea"></v-radio>
      </v-radio-group>

      <v-btn depressed small @click="createNewPost">投稿</v-btn>
      <span>(shift + enterで投稿)</span>
    </div>

    <hr>

    <v-tabs v-model='viewTab' fixed-tabs class='hidden-xs-only'>
      <v-tab><v-icon>view_module</v-icon></v-tab>
      <v-tab><v-icon>view_list</v-icon></v-tab>
    </v-tabs>

    <div class="filter-types">
      <v-checkbox v-model="filterTypes" label="メモ・感想" value="memo"></v-checkbox>
      <v-checkbox v-model="filterTypes" label="質問" value="question"></v-checkbox>
      <v-checkbox v-model="filterTypes" label="アイデア・提案" value="idea"></v-checkbox>
    </div>


    <transition-group tag="ul" class="posts" :class="viewType">
      <li v-for="post in filteredPosts" :key="post.id" :class="post.type">
        <p>{{ post.text }}</p>
        <span class="likeBar" :style="{ height: (post.like * 5) + 'px' }"></span>
        <v-btn class="likeBtn" @click="likePost(post.id)"
          flat icon color="yellow">
          <v-icon large>thumb_up</v-icon>
          <span>{{ post.like }}</span>
        </v-btn>
        <a :href="getTwitterUrl(post.text)" class="twitterBtn" target="_blank" onclick="window.open(this.href, 'tweetwindow', 'width=650, height=470, personalbar=0, toolbar=0, scrollbars=1, sizable=1'); return false;">
          <img class="twitterImg" alt="twitter" src="../assets/twitter.png">
        </a>
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
      viewTab: 0,
      filterTypes: ['memo', 'question', 'idea']
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
    },
    filteredPosts() {
      return this.posts.filter(post => this.filterTypes.includes(post.type))
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
          if (change.type === "added") {
            const like = change.doc.data().like || 0
            const post = { id: change.doc.id, like, ...change.doc.data() }
            this.posts.unshift(post)
          } else if (change.type === "modified") {
            const post = this.posts.find(post => post.id === change.doc.id)
            post.like = change.doc.data().like
          } else if (change.type === "removed") {
            this.posts = this.posts.filter(post => post.id !== change.doc.id)
          }
        })
      })
    },
    updateBoardname() {
      if (this.board.name.length == 0) {
        alert("ボート名を入力してください")
        return
      }
      this.boardRef.set({
        name: this.board.name,
      }, { merge: true })
      this.edit_board_name = false
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
    deletePost(post_id) {
      try {
        this.postsRef.doc(post_id).delete()
      } catch (e) {
        console.error('Error removing document: ', e) // eslint-disable-line
      }
    },
    likePost(post_id) {
      try {
        const post = this.posts.filter(post => post.id === post_id)
        this.postsRef.doc(post_id).set({
          like: post[0].like + 1
        }, { merge: true })
      } catch (e) {
        console.error('Error liking document: ', e) // eslint-disable-line
      }
    },
    getTwitterUrl(post_text) {
      return 'https://twitter.com/intent/tweet?text=' + post_text + '&hashtags=Webナイト宮崎'
    }
  }
}
</script>

<style lang="scss" scoped>
:root {
  --post-color-memo: #cbb994;
  --post-color-question: #87cefa;
  --post-color-idea: #fa8072;
}

ul {
  padding: 0;
}

.input_board_name {
  display: inline-block;
}
.control {
  margin: 20px 0;
  .v-input {
    width: 400px;
    margin: 0 auto;
  }
  .radio-type {
    .v-radio { padding: 2px; }
    .memo { border-bottom: 2px solid var(--post-color-memo); }
    .question { border-bottom: 2px solid var(--post-color-question); }
    .idea { border-bottom: 2px solid var(--post-color-idea); }
  }
  .v-btn {
    background: #eac545 !important;
    color: white;
  }
}

.filter-types {
  .v-input {
    width: 150px;
    flex: none;
  }
  display: flex;
  justify-content: center;
}

.posts {
  &.grid-view {
    display: flex;
    flex-wrap: wrap;
    li {
      width: 180px;
      height: 180px;
      margin: 10px 15px;
    }
  }
  &.list-view {
    li {
      width: 500px;
      height: 130px;
      margin: 10px auto;
    }
  }
  .v-enter-active {
    transition: all 0.5s;
  }
  .v-enter {
    opacity: 0;
    transform: translateY(-30px);
  }
  li {
    &.question {
      border-bottom: 5px solid var(--post-color-question);
    }
    &.idea {
      border-bottom: 5px solid var(--post-color-idea);
    }
    background: var(--post-color-memo);
    position: relative;
    list-style: none;
    p {
      position: absolute;
      width: 100%;
      top: 50%;
      left: 50%;
      -ms-transform: translate(-50%,-50%);
      -webkit-transform : translate(-50%,-50%);
      transform : translate(-50%,-50%);
      text-align: center;
      color: white;
      font-weight: bold;
    }
    .deleteBtn {
      position: absolute;
      top: -20px;
      right: -20px;
    }
    .likeBar {
      display: block;
      position: absolute;
      bottom: 0px;
      left: 0px;
      width: 10px;
      background: white;
      opacity: 0.8;
    }
    .likeBtn {
      color: white !important;
      position: absolute;
      bottom: 0px;
      left: 15px;
    }
    .twitterBtn {
      position: absolute;
      bottom: 0px;
      right: 5px;
    }
    .twitterImg {
      width: 36px;
      height: 36px;
    }
  }
}

@media screen and (max-width: 600px) {
  .board {
    padding: 10px;
  }
  .v-input {
    width: 100%;
  }
  .posts {
    &.grid-view {
      li {
        width: 100%;
      }
    }
    &.list-view {
      li {
        width: 100%;
      }
    }
  }
}
</style>
