import {getLyric}   from 'api/song'
import {ERR_OK} from 'api/config'
import {Base64} from 'js-base64'

export default class Song {
  constructor ({id,mid,singer,name,album,duration,image,url}) {
      this.id = id
      this.mid =mid
      this.singer= singer
      this.name = name
      this.album = album
      this.duration = duration
      this.image = image
      this.url = url
  }

  getLyric() {
    if (this.lyric) {
      return Promise.resolve(this.lyric)
    }
    //这里用Promsie返回，同样的道理：后面调用这个方法，方便进一步操作数据，同2中的promsie
    return new Promise((resolve, reject) => {
      getLyric(this.mid).then((res) => {
        if (res.code === ERR_OK) {
          //返回数据的是 base64 的字符串，需要解码，这里用到了第三方库: js-base64
          this.lyric = Base64.decode(res.lyric)
          resolve(this.lyric)
        } else {
          reject(new Error('no lyric'))
        }
      })
    })
  }
}

export function createSong(musicData,songVkey,guid) {
  return new Song({
      id: musicData.songid,
      mid: musicData.songmid,
      singer: filterSinger(musicData.singer),
      name:musicData.songname,
      album: musicData.albumname,
      duration: musicData.interval,
      image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
      url: `https://dl.stream.qqmusic.qq.com/C400${musicData.songid}.m4a?vkey=${songVkey}&guid=1849502645&fromtag=66`
  })
}

export function filterSinger(singer) {
    let ret = []
    if(!singer) {
      return ''
    }
    singer.forEach((s) => {
        ret.push(s.name)
    })
    return ret.join('/')
}

