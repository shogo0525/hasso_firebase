<template>
  <div class="board">
    <h1 v-show="!edit_board_name" @click="edit_board_name = true">ボード名: {{ board_name }}</h1>
    <div v-show="edit_board_name">
      <v-text-field
        class="input_board_name"
        v-model="board_name"
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
        </li>
      </transition-group>
    </div>
  </div>
</template>

<script>
import firestore from '@/firebase/firestore'

export default {
  name: 'board_show',
  data() {
    return {
      boardRef: "",
      postsRef: "",
      edit_board_name: false,
      board_id: "",
      board_name: "",
      post_text: "",
      posts: []
    }
  },
  created() {
    this.post_id = this.$route.params.id
    this.boardRef = firestore.collection('boards').doc(this.post_id)
    this.postsRef = this.boardRef.collection('posts')

    this.boardRef.onSnapshot((doc) => {
      if (doc.exists) {
        this.board_name = doc.data().name
      } else {
        console.log("No such document!")
      }
    })

    this.postsRef.orderBy("created_at", "asc").onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type == "added") {
          let like = 0
          if (change.doc.data().like) like = change.doc.data().like
          const post = {
            id: change.doc.id,
            text: change.doc.data().text,
            like: like
          }
          this.posts.unshift(post)
        } else if (change.type == "modified") {
          this.posts.filter(post => {
            if(post.id == change.doc.id) {
              post.like = change.doc.data().like
            }
          })
        } else if (change.type == "removed") {
          this.posts = this.posts.filter(post => post.id !== change.doc.id)
        }
      })
    })
  },
  methods: {
    updateBoardname() {
      if (this.board_name.length == 0) {
        alert("ボート名を入力してください")
        return
      }
      this.boardRef.set({
        name: this.board_name,
      })
      this.edit_board_name = false
    },
    createNewPost() {
      if (this.post_text.length == 0) {
        alert("ポストを入力してください")
        return
      }
      const post_text = this.post_text
      
      this.postsRef.add({
        text: post_text,
        created_at: new Date()
      })
      .then((docRef) => this.post_text = "")
      .catch((error)  => console.error('Error adding document: ', error))
    },
    deletePost(post_id) {
      this.postsRef.doc(post_id).delete()
      .catch((error) => console.error("Error removing document: ", error))
    },
    likePost(post_id) {
      const post = this.posts.filter(post => post.id == post_id)
      this.postsRef.doc(post_id).update({
        like: post[0].like + 1
      })
      .catch((error) =>console.error('Error adding document: ', error))
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
    width: 150px;
    height: 150px;
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
    }
    .likeBtn {
      position: absolute;
      top: 105px;
      left: 95px;
    }
  }
}
</style>
