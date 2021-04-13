## 图片墙 - 移动端

### display

![](https://github.com/WuLianN/gallary/blob/master/src/assets/display/display-1.jpg)

### 技术栈

- Vite
- Vue3
- medium-zoom

<br>

### 功能

- [x] 图片可放大
- [x] 图片放大状态，可左右滑动切换图片
- [x] 滑动加载更多图片
- [x] 关闭放大状态后，检测滑动状态，若滑动了，滚动到当前图片位置
- [ ] 放大状态下，可以再缩放图片

<br>

**待优化**

图片在放大的状态下，想再放大 :heart_eyes: ，只能缩放浏览器，手势很容易被认为滑动。

解决方案：在图片放大状态下，先用手势（如双击），取消滑动监听。

<br>

**坑**

```js
// 移动端一直为0，pc端可以识别
document.documentElement.scrollTop

// 更换为获取 body 的 scrollTop
document.body.scrollTop
```
