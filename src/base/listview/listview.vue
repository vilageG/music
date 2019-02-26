<template>
    <Scroll class="listview" :data="data" ref="listview" :listen-scroll="listenScroll" @scroll="scroll" :probe-type="probeType">
      <ul>
        <li v-for="group in data" class="list-group" ref="listGroup">
            <h2 class="list-group-title">{{group.title}}</h2>
            <ul>
                <li v-for="item in group.items" class="list-group-item"  @click="selectItem(item)">
                    <img v-lazy="'http://y.gtimg.cn/music/photo_new/T001R150x150M000'+item.id +'.webp'" alt="" class="avatar">
                    <span class="name">{{item.name}}</span>
                </li>
            </ul>
        </li>
      </ul>
      <div class="list-shortcut" @touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
          <ul>
              <li v-for="(item,index) in shortcutList" :class="{'current': currentIndex==index}" class="item" :data-index="index">
                  {{item}}
              </li>
          </ul>
      </div>
    </Scroll>
</template>


<script>
import Scroll from 'base/scroll/scroll'
import {getData} from 'common/js/dom'

const ANCHOR_HEIGHT =18

export default {
  created(){
    this.probeType = 3
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
  },
  data(){
    return {
      scrollY : -1,
      currentIndex: 0

    }
  },
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  computed: {
    shortcutList(){
        return this.data.map((group)=>{
            return group.title.substr(0,1)
        })
    }
  },
  methods: {
    selectItem(item){
      this.$emit('select',item)
    },
    //初次点击记录点击点
    onShortcutTouchStart(e){
      let anchorIndex = getData(e.target, 'index')
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    //拖动时计算拖动点与初次点距离计算拖动多少点
    onShortcutTouchMove(e){
      let firstTouch = e.touches[0]
      this.touch.y2 =firstTouch.pageY
      let delta = (this.touch.y2 - this.touch.y1)/ ANCHOR_HEIGHT | 0 
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta
      this._scrollTo(anchorIndex)
    },
    //跳到指定点
    _scrollTo(index){
      if(index <0){
        index = 0
      } else if(index > this.listHeight.length - 2){
        index = this.listHeight.length - 2
      }
      this.scrollY = -this.listHeight[index]
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index],0)
    },
    scroll(pos){
      this.scrollY = pos.y
    },
    // 计算歌手列表高度
    _calculateHeight(){
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for(let i=0;i<list.length;i++){
        let item = list[i]
        height+= item.clientHeight
        this.listHeight.push(height)
      }
    },
    refresh() {
      this.$refs.listview.refresh()
    }
  },
  watch:{
    data(){
      setTimeout(()=>{
        this._calculateHeight()
      },20)
    },
    scrollY(newY){
      const listHeight = this.listHeight
      //当滚动到顶部
      if(newY > 0){
        this.currentIndex = 0 
        return 
      }
      //在中间部分滚动
      for(let i=0;i<listHeight.length -1; i++){
        let height1 = listHeight[i]
        let height2 = listHeight[i+1]
        if(-newY >= height1 && -newY < height2){
          this.currentIndex = i
          return 
        }
      }
      // 当滚动到底部，且-newY大于最后一个元素上限
      this.currentIndex = listHeight.length - 2
    }
  },
  components: {
    Scroll
  }
    
}
</script>


<style lang="stylus" scoped>
  @import "~common/stylus/variable"

  .listview
    position relative
    width: 100%
    height : 100%
    overflow hidden
    background : $color-background
    .list-group
      padding-bottom : 30px
      .list-group-title
        height : 30px
        line-height : 30px
        padding-left: 20px
        font-size: $font-size-small
        color : $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute 
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)



</style>
