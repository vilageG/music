<template>
    <transition name="slide">
    <MusicList :songs="songs" :title="title" :id="id"></MusicList>
    </transition>
</template>


<script>
import {mapGetters} from 'vuex'
import {getSingerDetail,getMusic} from 'api/singer'
import {ERR_OK} from 'api/config'
import {createSong} from 'common/js/song'
import MusicList from 'components/music-list/music-list'

export default {
  data(){
    return {
      songs: []
    }
  },
  computed:{
    title(){
      return this.singer.name
    },
    id(){
      return this.singer.id
    },
    ...mapGetters([
      'singer'
    ])
  },
  created(){
    this._getDtails()
  },
  methods: {
    _getDtails(){
    if(!this.singer.id){
      this.$router.push('/singer')
      return
    }
      getSingerDetail(this.singer.id).then((res) => {
        if(res.code === ERR_OK) {
          this.songs = this._normalizeSongs(res.data.list)
          console.log(this.songs)
        }
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item) => {
        let {musicData} = item
        if(musicData.songid && musicData.albummid){
          getMusic(musicData.songmid).then(res => {
            if(res.code === ERR_OK){
              const svkey =res.data.items
              const songVkey = svkey.vkey
              const newSong = createSong(musicData, songVkey)
              ret.push(newSong)
            }
          })
        }
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>

<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .singer-detail
    position: fixed
    z-index: 100
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: $color-background

  .slide-enter-active,.slide-leave-active
    transform: all 0.3s
  .slide-enter,.slide-leave-to
    transform: translate3d(100%,0,0)
</style>
