import * as module from '../../utils/util';
let that = null;

Page({
  data: {
    showDetails: false,
    currentQuarter: wx.getStorageSync('currentQuarter'),
    quarterNum: wx.getStorageSync('quarterNum'),
    scoreType: 0 // 0 - 项目负责人, 1 - 部门负责人
  },
  onLoad (options) {
    that = this;
    const APPDATA = that.data;
    if ( options ) {
      APPDATA.scoreType = options.scoreType;
    }


    // 获取部门负责人评分分类
    switch ( APPDATA.scoreType ) {
      case 0: that.getDepartmentScoreType();
            break;
      case 1: that.getProjectScoreType();
            break;
    }
    
  },
  getDepartmentScoreType () { // 获取部门负责人列表
    const APPDATA = that.data;
    module.request('Departments/GetDepartmentors', {
      data: {
        qt: APPDATA.quarterNum
      },
      callback (res) {
        console.log(res);
      }
    });
  },
  getProjectScoreType () { // 获取项目负责人列表
    const APPDATA = that.data;
    module.request('Projects/GetCanScoreProjects', {
      data: {
        qt: APPDATA.quarterNum
      },
      callback (res) {
        console.log(res);
      }
    });
  },
  departmentCharge () { // 给部门负责人评分
    const APPDATA = that.data;
    module.request('/Departments/DepartmentChargerScore', {
      data: {
        suserid: 1,
        userid: 6,
        departmentid: 2,
        tid: 1,
        score: 10,
        qt: APPDATA.quarterNum
      },
      callback (res) {
        console.log(res);
      }
    });
  },
  projectCharge () {
    const APPDATA = that.data;
    module.request('', {
      
    });
  }
})