<template>
  <div class="board">
    <h1>ボード名: {{ board_name }}</h1>
    <div>
      <input type="text" v-model="post_text">
      <button @click="createNewPost">ポストイット！</button>
    </div>
    <div>
      <ul>
        <li v-for="post in posts" :key="post.id">
          <p>{{ post }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import firestore from '@/firebase/firestore'

export default {
  name: 'board_show',
  data() {
    return {
      board_name: "",
      post_text: "",
      posts: []
    }
  },
  created() {
    const boardRef = firestore.collection('boards').doc(this.$route.params.id)
    boardRef.get().then((doc) => {
      if (doc.exists) {
        this.board_name = doc.data().name
      } else {
        console.log("No such document!")
      }
    }).catch((error) =>  {
        console.log("Error getting document:", error);
    })

    const postsRef = boardRef.collection('posts')
    // postsRef.get().then((querySnapshot) => {
    //   querySnapshot.forEach((doc) => {
    //     this.posts.push(doc.data().text)
    //   })
    // })

    postsRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(change => {
        this.posts.push(change.doc.data().text)
      })
    })
  },
  methods: {
    createNewPost() {
      if (this.post_text.length == 0) {
        alert("ポストを入力してください")
        return
      }
      
      const boardRef = firestore.collection('boards').doc(this.$route.params.id)
      const postsRef = boardRef.collection('posts')
      postsRef.add({
        text: this.post_text
      }).then((docRef) => {
        console.log("postしたよ！")
      }).catch((error)  => {
        console.error('Error adding document: ', error)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
ul {
  display: flex;
  flex-wrap: wrap;
  li {
    position: relative;
    width: 150px;
    height: 150px;
    background: #cbb994;
    margin: 10px;
    list-style: none;

    &:before, &:after
    {
      z-index: -1;
      position: absolute;
      content: "";
      bottom: 15px;
      left: 10px;
      width: 50%;
      top: 80%;
      max-width:300px;
      background: #777;
      -webkit-box-shadow: 0 15px 10px #777;
      -moz-box-shadow: 0 15px 10px #777;
      box-shadow: 0 15px 10px #777;
      -webkit-transform: rotate(-3deg);
      -moz-transform: rotate(-3deg);
      -o-transform: rotate(-3deg);
      -ms-transform: rotate(-3deg);
      transform: rotate(-3deg);
    }
    &:after
    {
      -webkit-transform: rotate(3deg);
      -moz-transform: rotate(3deg);
      -o-transform: rotate(3deg);
      -ms-transform: rotate(3deg);
      transform: rotate(3deg);
      right: 10px;
      left: auto;
    }
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
  }
}
</style>
