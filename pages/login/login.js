import * as module from '../../utils/util';
import MD5 from '../../utils/MD5';

const {
  Api,
  wxRequest
} = require('../../utils/httpclient.js');

const regeneratorRuntime = require('regenerator-runtime');
import Toast from '../../dist/toast/toast';

Page({
  data: {
    account: '',
    password: '',
    nameFocus: true
  },
  onLoad () {

  },
  getUserName (ev) { // 获取当前用户名
    const account = ev.detail.value;
    this.setData({
      account,
    });
  },
  getUserPwd (ev) { // 获取当前用户密码
    const password = ev.detail.value;
    this.setData({
      password
    });
  },
  skipToModify () {
    wx.navigateTo({
      url: '/pages/changePwd/changePwd'
    })
  },
  loginHandler () {
    /**
     * 角色权限(RoleID):
     *     1. 总经理(与书记权限相同)
     *     2. 办公室主任
     *     3. 部门负责人
     *     4. 部门成员
     *     5. 项目负责人
     *     6. 项目成员
     *     7. 书记(与总经理权限相同)
     */

    this.doLogin()
  },

  /**
   * 修改密码
   */
  doLogin: async function () {
    const {account,password} = this.data
    Toast.loading({
      mask: true,
      message: '登录中...'
    })

    try {
      const resp = await wxRequest(Api.UserLogin, 'POST', {
        account: account,
        password: MD5(password)
      })

      Toast.success('登录成功');

      if (resp){
        wx.setStorageSync('user', resp);
        wx.navigateBack();
      }
    }
    catch (error) {
      Toast.fail(error);
    }
  }
})

// 转换对应季度为中文
let convertUnit = (unit) => {
  switch (unit) {
    case '1': return '一';
        break;
    case '2': return '二';
        break;
    case '3': return '三';
        break;
    case '4': return '四';
        break;
  }
}