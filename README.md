# 音乐播放器cat-music 

> music
## 视图层
> 
* 推荐页
* 歌手页
	* 歌手详情
* 歌曲排行榜
	* 排行榜详情
* 搜索页
* 用户中心

## 数据来源
所有数据都来自于QQ音乐，抓取自QQ的接口，其中一些接口限制了`host`，不能直接抓取，开发环境用proxyTable配置反向代理,生产环境采用的方法是用`axios`代理，设置`header`，以此绕过`host`的限制。


## 技术栈
> 
* [x] Vue
* [x] Vuex
* [x] Vue-Router
* [x] Vue-cli
* [x] Stylus
* [x] Axios

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:80
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
