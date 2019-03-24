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
        label="アイデア・質問・感想・メモなど"
        outline
      ></v-textarea>
      <p>shift + enterで投稿</p>
      <v-btn depressed small @click="createNewPost">投稿</v-btn>
    </div>

    <div>
      <transition-group tag="ul" class="posts">
        <li v-for="post in posts" :key="post.id">
          <p>{{ post.text }}</p>
          <!-- <v-btn class="deleteBtn" @click="deletePost(post.id)"
            fab small color="white">
            <v-icon dark>remove</v-icon>
          </v-btn> -->
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
      posts: []
    }
  },
  created() {
    this.boardRef = db.collection('boards').doc(this.$route.params.id)
    this.postsRef = this.boardRef.collection('posts')

    this.fetchBoard()
    this.fetchPosts()
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
            const post = {
              id: change.doc.id,
              text: change.doc.data().text,
              like
            }
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
.v-input {
  width: 300px;
  margin: 0 auto;
}
.input_board_name {
  display: inline-block;
}
.control {
  margin: 40px 0;
  p {
    margin-top: -25px;
  }
  .v-btn {
    background: #eac545 !important;
    color: white;
  }
}

.posts {
  display: flex;
  flex-wrap: wrap;
  .v-enter-active, .v-leave-active {
    transition: all 0.5s;
  }
  .v-enter, .v-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }
  li {
    position: relative;
    width: 170px;
    height: 170px;
    background: #cbb994;
    margin: 10px 15px;
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
      background: #eac545;
      opacity: 0.7;
    }
    .likeBtn {
      position: absolute;
      top: 130px;
      left: 15px;
    }
    .twitterBtn {
      position: absolute;
      top: 132px;
      right: 5px;
    }
    .twitterImg {
      width: 36px;
      height: 36px;
    }
  }
}
</style>
