import * as module from '../../utils/util';
let that = null;

Page({
  data: {
    peerList: [],
    forbidProject: false,
    forbidDepartment: false
  },
  onLoad () {
    that = this;
    const APPDATA = that.data;

    const ROLE_ID = wx.getStorageSync('RoleId');
    let SCORE_TYPE;
    if ( ROLE_ID == 3 ) {
      SCORE_TYPE = 0;
      that.setData({
        forbidDepartment: true
      });
    } else if ( ROLE_ID == 5 ) {
      SCORE_TYPE = 1;
      that.setData({
        forbidProject: true
      });
    }

    const baseUrl = `/pages/scoreCharge/scoreCharge?&isView=true&viewScore=true&showSaveBtn=false`;
    that.setData({
      peerList: [{
        name: '项目经理评分',
        link: `${baseUrl}&scoreType=1`,
        enable: APPDATA.forbidProject,
        isAllow: APPDATA.forbidProject ? '' : 'forbid'
      }, {
        name: '部门经理评分',
        link: `${baseUrl}&scoreType=0`,
        enable: APPDATA.forbidDepartment,
        isAllow: APPDATA.forbidDepartment ? '' : 'forbid'
      }]
    });

    wx.setNavigationBarTitle({
      title: '互评排名'
    });
  },

});