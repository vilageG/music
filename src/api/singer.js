
// import jsonp from 'common/js/jsonp'
// import {commonParams, options} from './config'
// import axios from 'axios'

// export function getSingerList () {
//   const url = '/api/getSingerList'
//   const data = {
//     'comm': {
//       'ct': 24,
//       'cv': 10000
//     },
//     'singerList': {
//       'module': 'Music.SingerListServer',
//       'method': 'get_singer_list',
//       'param': {
//         'area': -100,
//         'sex': -100,
//         'genre': -100,
//         'index': -100,
//         'sin': 0,
//         'cur_page': 1
//       }
//     }
//   }
//   // 实现将多个对象拷贝到同一个对象中
//   const param = Object.assign({},commonParams,{
//       loginUin: 0,
//       hostUin: 0,
//       format: 'jsonp',
//       platform: 'yqq',
//       needNewCode: 0,
//       data: JSON.stringify(data)
//     })
//   // 返回值就是promise
//   return axios.get(url, {
//     params: param
//   }).then((res) => {
//     return Promise.resolve(res.data)
//   })
// }

import jsonp from 'common/js/jsonp'
import {commonParams,options} from './config'
import axios from 'axios'

export function  getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'
  const param = Object.assign({}, commonParams, {
    g_tk: 1928093487,
    notice: 0,
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1
  })

  return jsonp(url, param, options)
}

export function getSingerDetail(singerId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
  const param = Object.assign({}, commonParams, {
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    num: 30,
    songstatus: 1,
    g_tk: 5381,
    singermid: singerId
  })

  return jsonp(url, param, options)

}

export function getMusic(songmid) {
  const url = '/api/music'
  const param = Object.assign({}, commonParams, {
    songmid: songmid,
    filename:'C400' + songmid +'.m4a',
    guid: 1849502645,
    platform: 'yqq',
    loginUin: 0,
    hostUin: 0,
    needNewCode: 0,
    cid: 205361747,
    uin: 0,
    format: 'json'
  })

  return axios.get(url,{
    params: param
  }).then((res) => {
    return Promise.resolve(res.data)
  })

}