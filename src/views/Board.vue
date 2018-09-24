<template>
  <div class="board">
    <h1>ボード名: {{ board_name }}</h1>
    <div class="control">
      <v-text-field
        v-model="post_text"
        label="アイデア"
        outline
      ></v-text-field>
      <v-btn depressed small @click="createNewPost">post it!!</v-btn>
    </div>
    <div>
      <transition-group tag="ul" class="posts">
        <li v-for="post in posts" :key="post.id">
          <v-btn class="deleteBtn" @click="deletePost(post.id)"
            fab dark small color="primary">
            <v-icon dark>remove</v-icon>
          </v-btn>
          <p>{{ post.data().text }}</p>
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
      board_id: "",
      board_name: "",
      post_text: "",
      posts: []
    }
  },
  created() {
    this.post_id = this.$route.params.id;
    const boardRef = firestore.collection('boards').doc(this.post_id)
    const postsRef = boardRef.collection('posts')

    boardRef.get().then((doc) => {
      if (doc.exists) {
        this.board_name = doc.data().name
      } else {
        console.log("No such document!")
      }
    }).catch((error) =>  {
        console.log("Error getting document:", error);
    })

    postsRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type == "added") { 
          this.posts.push(change.doc)
        } else if (change.type == "removed") {
          this.posts = this.posts.filter(post => post.id !== change.doc.id);
        }
      })
    })
  },
  methods: {
    createNewPost() {
      if (this.post_text.length == 0) {
        alert("ポストを入力してください")
        return
      }
      
      const boardRef = firestore.collection('boards').doc(this.post_id)
      const postsRef = boardRef.collection('posts')
      postsRef.add({
        text: this.post_text
      }).then((docRef) => {
        this.post_text = ""
      }).catch((error)  => {
        console.error('Error adding document: ', error)
      })
    },
    deletePost(post_id) {
      const boardRef = firestore.collection('boards').doc(this.post_id)
      const postsRef = boardRef.collection('posts')
      postsRef.doc(post_id).delete().then(function() {
          console.log("Document successfully deleted!");
      }).catch(function(error) {
          console.error("Error removing document: ", error);
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.v-btn {
  background: #eac545 !important;
  color: white;
}
.control {
  margin-top: 50px;
  .v-input {
    width: 300px;
    margin: 0 auto;
  }
}

.posts {
  display: flex;
  flex-wrap: wrap;
  .v-enter-active, .v-leave-active {
    transition: all 1.2s;
  }
  .v-enter, .v-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
  li {
    position: relative;
    width: 150px;
    height: 150px;
    background: #cbb994;
    margin: 10px;
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
      left: -20px;
    }
  }
}
</style>
