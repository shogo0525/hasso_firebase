import Firebase from 'firebase'
import 'firebase/firestore'

const config = {
  apiKey: "AIzaSyDsfX78AL1octGmYIsg6bH-qWhMBUdAlmg",
  authDomain: "hasso-2018.firebaseapp.com",
  databaseURL: "https://hasso-2018.firebaseio.com",
  projectId: "hasso-2018",
  storageBucket: "hasso-2018.appspot.com",
  messagingSenderId: "295572460052"
}

const firebaseApp = Firebase.initializeApp(config, 'exercise-vue')
const firestore = firebaseApp.firestore()
firestore.settings({ timestampsInSnapshots: true })

export default firestore