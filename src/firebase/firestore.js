import Firebase from 'firebase'
import 'firebase/firestore'

const config = {
  apiKey: "AIzaSyCRU5GWEd3yJZWtHER_sptpucokk1F_YEw",
  authDomain: "shakeb-55217.firebaseapp.com",
  databaseURL: "https://shakeb-55217.firebaseio.com",
  projectId: "shakeb-55217",
  storageBucket: "shakeb-55217.appspot.com",
  messagingSenderId: "744183415704"
}

const firebaseApp = Firebase.initializeApp(config, 'exercise-vue')
const firestore = firebaseApp.firestore()
firestore.settings({ timestampsInSnapshots: true })

export default firestore