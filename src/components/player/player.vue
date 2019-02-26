<template>
    <div class="player" v-show="playlist.length>0">
      <transition name="normal">
        <div class="normal-player" v-show="fullScreen">
            <div class="background">
              <img width="100%" height="100%" :src="currentSong.image">
            </div>
            <div class="top">
              <div class="back" @click ="back">
                <i class="icon-back"></i>
              </div>
              <h1 class="title" v-html="currentSong.name"></h1>
              <h2 class="subtitle" v-html="currentSong.singer"></h2>
            </div>
            <div class="middle">                      
                <Scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                  <div class="lyric-wrapper">
                    <div v-if="currentLyric">
                      <p ref="lyricLine" 
                        class="text"
                        :class= "{'current': currentLineNum === index}"
                        v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
                    </div>
                  </div>
                </Scroll>
            </div>
            <div class="bottom">
              <div class="progress-wrapper">
                <span class="time time-l">{{format(currentTime)}}</span>
                <div class="progress-bar-wrapper">
                  <progress-bar :percent="percent"></progress-bar>
                </div>
                <span class="time time-r">{{format(currentSong.duration)}}</span>
              </div>
              <div class="operators">
                  <div class="icon i-left" @click="changeMode"> 
                      <i :class="iconMode"></i>
                  </div>                  
                  <div class="icon i-left">
                      <i class="icon-prev" @click="prev"></i>
                  </div>
                  <div class="icon i-center">
                      <i :class="playIcon" @click="togglePlaying"></i>
                  </div>
                  <div class="icon i-right">
                      <i class="icon-next" @click="next"></i>
                  </div>
                  <div class="icon i-right">
                      <i class="icon-not-favorite"></i>
                  </div>

              </div>
            </div>
        </div>
      </transition>
      <transition name="mini">
        <div class="mini-player" v-show="!fullScreen" @click="open">
            <div class="icon" >
              <img  :class="cdCls" :src="currentSong.image" height="40" width='40'>
            </div>
            <div class="text">
                <h2 class="name" v-html="currentSong.name"></h2>
                <p class="desc" v-html="currentSong.singer"></p>
            </div>
            <div class="control">
                <i @click.stop="togglePlaying" :class="miniIcon"></i>
            </div>
            <div class="control" @click.stop="showPlaylist">
                <i class="icon-playlist"></i>
            </div>
        </div>
      </transition>
      <playlist ref="playlist"></playlist>
      <audio ref="audio" @timeupdate ="updateTime">
        <source :src="currentSong.url" type="audio/mpeg">
      </audio>
    </div>
</template>

<script>
import {mapGetters,mapMutations} from 'vuex'
import ProgressBar from 'base/progress-bar/progress-bar'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import Playlist from 'components/playlist/playlist'

export default {
  data(){
    return { 
      currentTime:0,
      currentLyric:null,
      currentLineNum:0,
    }
  },
  computed:{
    percent(){
      return this.currentTime/this.currentSong.duration
    },
    cdCls(){
      return this.playing? 'play':'play pause'
    },
    iconMode(){
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop':'icon-random'
    },
    playIcon(){
      return this.playing? 'icon-pause':'icon-play'
    },
    miniIcon(){
      return this.playing? 'icon-pause-mini' : 'icon-play-mini'
    },
    ...mapGetters([
      'fullScreen',
      'playlist',
      'currentSong',
      'playing',
      'currentIndex',
      'mode',
      'sequenceList'
    ])
  },
  methods:{
    showPlaylist(){
      this.$refs.playlist.show()
    },
    //改变播放模式
    changeMode(){
      const mode = (this.mode + 1)%3
      this.setPlayMode(mode)
      let list = null
      if(mode === playMode.random){
        list = shuffle(this.sequenceList)
      }else{
        list = this.sequenceList
      }
      this.resetCurrentIndex(list)
      this.setPlayList(list)
    },

    resetCurrentIndex(list){
      let index = list.findIndex((item)=>{
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    //缩小播放页
    back(){
      this.setFullScreen(false)
    },
    //打开播放页
    open(){
      this.setFullScreen(true)
    },
    //播放时间
    updateTime(e){
      this.currentTime = e.target.currentTime
    },
    format(interval){
      interval = interval | 0
      const minute = interval/60 | 0
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    _pad(num, n = 2){
      let len = num.toString().length
      while(len <n){
        num = '0' + num
        len++
      }
      return num
    },
    ...mapMutations({
      setFullScreen: "SET_FULL_SCREEN",
      setPlayingState: "SET_PLAYING_STATE",
      setCurrentIndex: "SET_CURRENT_INDEX",
      setPlayMode: "SET_PLAY_MODE",
      setPlayList: "SET_PLAYLIST"
    }),
    //下一首
    next(){
      let index = this.currentIndex + 1
      if(index === this.playlist.length){
        index = 0
      }
      this.setCurrentIndex(index)
      if(!this.playing){
        this.togglePlaying()
      }
    },
    //上一首
    prev(){
      let index = this.currentIndex + 1
      if(index === -1){
        index = this.playlist.length -1
      }
      this.setCurrentIndex(index)
      if(!this.playing){
        this.togglePlaying()
      }
    },
    togglePlaying(){
      this.setPlayingState(!this.playing)
      if(this.currentLyric){
        this.currentLyric.togglePlay()
      }
    },
    getLyric() {
      this.currentSong.getLyric().then((lyric) => {
    //利用第三方库: js-lyric ，解析我们的歌词，生成方便操作的对象
    //new Lyric生成的实例,还有一些api方便使用play、stop等等
    //this.handleLyric回调函数handleLyric(lineNum,txt):(当前播放的行数，当前播放的文字)
      this.currentLyric = new Lyric(lyric, this.handleLyric)
      console.log(this.currentLyric)
      if (this.playing) {
        this.currentLyric.play()
      }
      }).catch(() => {
        //如果歌词有问题，初始化
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    handleLyric({lineNum,txt}) {
      this.currentLineNum = lineNum
    }

    
  },
  watch: {
    currentSong(newSong, oldSong){
      if(!newSong.id){
        return
      }
      if (newSong.id === oldSong.id){
        return 
      }
      if(this.currentLyric){
        this.currentLyric.stop()
      }
      this.$nextTick(()=>{
         this.$refs.audio.play()
         this.getLyric()
      })  
    },
    playing(newPlaying){
      const audio = this.$refs.audio
      this.$nextTick(()=>{
        newPlaying? audio.play() : audio.pause()
      }) 
    }
  },
  components:{
    ProgressBar,
    Scroll,
    Playlist
  }
}
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>