#### 上海建工二建集团小程序评分系统

##### 小程序管理页面
```
  登录地址: https://mp.weixin.qq.com/
  账号: scg201kh@163.com
  密码: zxc123

微信公众平台:
  密码: scg201201
```

##### 后台管理页面
```
http://scadmin.sh2j.com/index.aspx

用户名: admin
密码:   123456
```

##### 小程序发布注意事项
1. 修改 `utils/utils.js` => const isDev = true 改为 false;
    true: 连接测试环境
    false: 连接正式环境

2. 小程序最大体积为 `2M`, 更换图片务必压缩!!!!!!, 否则导致上传失败!!!!!
