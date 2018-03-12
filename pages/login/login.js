import * as module from '../../utils/util';
import MD5 from '../../utils/MD5';
let that = null;

Page({
  data: {
    userName: '',
    userPwd: '',
    nameFocus: true
  },
  onLoad () {
    that = this;
  },
  getUserName (ev) { // 获取当前用户名
    const EV_DETAIL = ev.detail.value;
    that.setData({
      userName: EV_DETAIL,
    });
  },
  getUserPwd (ev) { // 获取当前用户密码
    const EV_DETAIL = ev.detail.value;
    that.setData({
      userPwd: EV_DETAIL
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
    const APPDATA = that.data;
    module.request('UserInfo/UserLogin', {
      method: "POST",
      data: {
        UserName: APPDATA.userName,
        UserPwd: MD5(APPDATA.userPwd)
      },
      callback (res) {
        let data = res.Data;
        // 存储当前角色id
        wx.setStorage({
          key: 'RoleId',
          data: data.RoleID,
          success: function(res){
            // 跳转到首页
            wx.navigateBack();
          }
        });
        wx.setStorageSync('userId', data.ID);
        wx.setStorageSync('userName', data.UserName);
        wx.setStorageSync('departId', data.DepartmentID);
        wx.setStorageSync('projectId', data.ProjectID);
        wx.setStorageSync('name', data.Name);

        that.getCurrentQuarter();
      }
    });
  },
  getCurrentQuarter () {
    // 获取当前季度
    const QUARTER_STORAGE = wx.getStorageSync('quarterNum');
    if( !QUARTER_STORAGE ){
      wx.request({
        url: `${module.config.url}AppCommon/GetCurrentQuarter`,
        method: 'GET',
        success (res) {
          if( !res.data.Success ) return;
          const QUARTER = res.data.Data,  // 获取当前季度
                CURRENT_QUARTER_STR = QUARTER.split('-'),
                CURRENT_YEAR = CURRENT_QUARTER_STR[0],  // 当前年
                CURRENT_QUARTER = CURRENT_QUARTER_STR[1]; // 当前季度
          const CURRENT_QUARTER_RESULT = `${CURRENT_YEAR}年第${convertUnit(CURRENT_QUARTER)}季度`;
          // 存储中的季度值与当前季度是否为同一季度
          if( QUARTER_STORAGE !== QUARTER ){
            wx.setStorageSync('quarterNum', QUARTER); // 数字格式季度值, 用于传参
            wx.setStorageSync('currentQuarter', CURRENT_QUARTER_RESULT); // 中文格式季度值, 用于显示当前季度
          }
        }
      })
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