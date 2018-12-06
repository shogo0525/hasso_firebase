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
  </div>
</template>

<script>
import firestore from '@/firebase/firestore'
const boardsRef = firestore.collection('boards')

export default {
  name: 'home',
  data() {
    return {
      board_name: "",
      boards: ""
    }
  },
  created() {
    boardsRef.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(doc.data()) // eslint-disable-line
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
        console.log(`Error adding document: ${error}`) // eslint-disable-line
      })
    }
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
