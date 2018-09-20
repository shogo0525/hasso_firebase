<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <div>
      <input type="text" v-model="board_name">
      <button @click="createNewBoard">新しいボードを作成する</button>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import firestore from '@/firebase/firestore'
const boardsRef = firestore.collection('boards')

export default {
  name: 'home',
  components: {
    HelloWorld
  },
  data() {
    return {
      board_name: ""
    }
  },
  created() {
    boardsRef.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.data())
      })
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
        console.log(`Error adding document: ${error}`)
      })
    }
  }
}
</script>
