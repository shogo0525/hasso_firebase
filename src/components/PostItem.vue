<template>
  <li
    :class="`bg-${post.type}`"
    class="rounded shadow-lg text-white flex flex-col justify-between
    w-full sm:min-w-xs sm:max-w-xs sm:w-auto"
  >
    <div class="px-5 py-5">
      <p class="text-base">{{ post.text }}</p>
    </div>
    <div class="px-2 flex justify-between">
      <span class="inline-block">
        <span @click="likePost(post)" class="inline-block mr-2">
          <svg class="stroke-current fill-current w-8 h-8" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M11 0h1v3l3 7v8a2 2 0 0 1-2 2H5c-1.1 0-2.31-.84-2.7-1.88L0 12v-2a2 2 0 0 1 2-2h7V2a2 2 0 0 1 2-2zm6 10h3v10h-3V10z"/></svg>
        </span>
        <span class="inline-block">{{ post.like }}</span>
      </span>
      <span class="inline-block">
        <a :href="getTwitterUrl(post.text)" target="_blank" onclick="window.open(this.href, 'tweetwindow', 'width=650, height=470, personalbar=0, toolbar=0, scrollbars=1, sizable=1'); return false;">
          <img class="w-8 h-8" alt="twitter" src="../assets/twitter.png">
        </a>
      </span>
    </div>
  </li>
</template>

<script>
export default {
  name: 'post-item',
  props: {
    post: {
      type: Object,
      required: true,
    },
    postsRef: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async likePost(post) {
      try {
        await this.postsRef.doc(post.id).set({
          like: post.like + 1
        }, { merge: true })
      } catch (e) {
        console.error('Error liking document: ', e) // eslint-disable-line
      }
    },
    getTwitterUrl(post_text) {
      return `https://twitter.com/intent/tweet?text=${post_text}&hashtags=Webナイト宮崎`
    }
  }
}
</script>