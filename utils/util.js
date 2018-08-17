
//  全局默认配置项
const isDev = false;
export const config = {
  initYear: '2018',
  url: isDev ? 'https://scapi.sh2j.com/' : 'https://scapi.sh2j.com/'  // url
  // http://localhost:8080/

  // 'https://scapi.sh2j.com/' 

  // http://jg2j.ayukey.cn/

  //http://121.43.174.137:82/
}

export const isFloat = n => {
  return n != parseInt(n);
}

export const getNum = floatNum => {
  if ( !floatNum ) return '';
  floatNum = floatNum.toString();
  let newFloat;
  let floatReg = /([0-9]+\.[0-9]{2})[0-9]*/;  
  newFloat = floatNum.replace(floatReg,"$1");

  return newFloat;
}

export const formatTime = date => {
  const year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

export const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

/**
 * [request 小程序网络请求]
 * @param {String} interfaceName 请求接口名
 * @param {Object} options 请求接口参数
 */
export const request = (interfaceName, options) => {
  // 基于获取网络状态后再执行后续操作
  wx.getNetworkType ({
    success (res) {
      const type = res.networkType;
      if( type === 'none' ) {  // 当前无网络连接
        wx.showModal({
          content: '当前无网络连接, 请稍候重试',
          showCancel: false,
          confirmColor: '#4eb2da'
        });
        return;
      }
      
      // 正常网络连接
      options = options || {};
      const resUrl = `${config.url}${interfaceName}`;
      const callback = options.callback || function(){},
            errorback = options.errorback || function(){};
      const loginInfo = wx.getStorageSync('loginInfo'); // 获取本地存储登录信息
      
      // var header = new Object();
      // header.UserName = wx.getStorageSync('userName');

      var header = {
        'content-type': 'application/json'
      };

      // Loading
      wx.showLoading({
        title: '加载中...'
      });
      // 小程序https请求

      console.log("发起请求～");
      wx.request({
        url: resUrl,
        header: header,
        data: options.data,
        method: options.method || 'GET',
        success(res){
          const data = res.data;
          wx.hideLoading(); // 关闭Loading
          if( data.Success ){ // 请求成功
            if( typeof (options.callback) === 'function' ){
              options.callback(res.data);
            }
          } else{
            // 提示请求错误信息
            wx.showToast({
              title: data.Msg,
              icon: 'loading',
              duration: 2000
            });
          }
        },
        fail(err){
          console.log(err);
          if( typeof(options.errorback) == "function" ){
            options.errorback(err);
          }
        },
        complete(comp){
          console.log("complete失败");
          if( typeof(options.compback) == "function" ){
            options.compback(comp);
          }
        }
      });
    }
  })
}

/**
 * [checkIsLogin 检查是否登录]
 * @param {Function} 回调函数, 检查是否登录后续操作
 */
export const checkIsLogin = (fn) => {
  const hasRoleId = wx.getStorageSync('RoleId');
  if ( !hasRoleId ) {
    wx.showModal({
      content: "登录后才可进行当前操作",
      confirmText: '去登录',
      success (res) {
        if ( res.confirm ) {
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
    return;
  }
  

  fn && typeof fn === "function" && fn();
}



