const regeneratorRuntime = require('regenerator-runtime')

const isDev = false

const Host = isDev ? "http://localhost:8080/" : "https://scapi.sh2j.com/"

const Api = {
  UserLogin: `${Host}UserInfo/UserLogin`,
  GetCurrentQuarter: `${Host}AppCommon/GetCurrentQuarter`,
};

// 微信请求
const wxRequest = async(url, method = "GET", data = {}) => {
  return await new Promise(function(resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      success: function(res) {
        console.log(res)
        if (res.statusCode == 200) {
          if (res.data.Success) {
            resolve(res.data.Data)
          } else {
            reject(res.data.Msg)
          }
        } else {
          reject(res.errMsg)
        }
      },
      fail: function(err) {
        reject(err)
      }
    })
  })
}

module.exports = {
  Api,
  wxRequest,
}