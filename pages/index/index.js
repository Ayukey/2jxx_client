// index.js
// 获取应用实例
const app = getApp();
import * as module from '../../utils/util';
import news from '../../news.js';

let that = null;

Page({
  data: {
    checkScore: [],
    checkQuery: [],
    roleId: null, // 角色id
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 500,
    imgUrls: [],
    currentUser: '',
    userName: '',
    slideIn: false,
    ballRight: 10,
    ballBottom: 40,
    screenHeight: 0,
    screenWidth: 0
  },
  onLoad: function () {
    that = this;
    
    let tempImgList = [];
    news.forEach(item => {
      tempImgList.push({
        url: item.cover,
        id: item.id
      });
    });
    that.setData({
      imgUrls: tempImgList
    });

    wx.getSystemInfo({
      success (res) {
       that.setData({
        screenHeight: res.windowHeight,
        screenWidth: res.windowWidth
       });
      }
    });
  },
  onShow () {
    // 登录后未显示当前角色菜单 - 待处理
    const APPDATA = that.data;
    const ROLE_ID = wx.getStorageSync('RoleId');
    that.setData({
      roleId: ROLE_ID,
      currentUser: wx.getStorageSync('userName') || '未登录',
      userName: wx.getStorageSync('name')
    });

    if ( ROLE_ID ) {
      that.DRM(ROLE_ID);
    }

    let reLogin = wx.getStorageSync('reLogin');
    if ( reLogin ) {
      wx.clearStorage();
      that.setData({
        checkScore: [],
        checkQuery: []
      });
      wx.navigateTo({
        url: '/pages/login/login',
        success () {
          wx.removeStorageSync('reLogin');
        }
      });
    }
  },
  onSwiperTap (ev) {
    let id = ev.target.dataset.id;
    wx.navigateTo({
      url: `/pages/news/news?id=${id}`
    });
  },
  skipToLogin () {
    wx.navigateTo({
      url: '../login/login'
    })
  },
  checkIsLogin (ev) { // 是否已登录
    const DATASET = ev.currentTarget.dataset;
    const navigateUrl = DATASET.url;
    module.checkIsLogin(() => {
      wx.navigateTo({
        url: navigateUrl
      });
    });
  },
  loginOut () {
    wx.showModal({
      title: '退出登录',
      content: '确定退出当前用户?',
      success (res) {
        if ( res.confirm ) {
          wx.clearStorage();
          that.setData({
            checkScore: [],
            checkQuery: [],
            slideIn: false
          });
          wx.navigateTo({
            url: '/pages/login/login'
          });
        }
      }
    });
  },
  ballMoveEvent (e) {
    const APPDATA = that.data;
    let touchs = e.touches[0];
    let pageX = touchs.pageX;
    let pageY = touchs.pageY;

    // 防止坐标越界,view宽高的一般 
    if (pageX < 30) return;
    if (pageX > APPDATA.screenWidth - 30) return;
    if (APPDATA.screenHeight - pageY <= 30) return;
    if (pageY <= 30) return;

    // 这里用right和bottom.所以需要将pageX pageY转换
    let x = APPDATA.screenWidth - pageX - 30;
    let y = APPDATA.screenHeight - pageY - 30;
    that.setData({
      ballBottom: y,
      ballRight: x
    });
  },
  slideMenu () {
    that.setData({
      slideIn: true
    });
  },
  skipToModifyPwd () {
    wx.navigateTo({
      url: '/pages/changePwd/changePwd',
      success: function(res){
        that.setData({
          slideIn: false
        });
      }
    })
  },
  cancelSlideMenu () {
    that.setData({
      slideIn: false
    });
  },
  DRM (roleId) { // 角色权限设置
    /**
     * 角色权限(RoleID):
     *     1. 总经理(1)、书记(7) - 全部查询各种成绩
     *     2. 办公室主任(2) - 全部查询各种成绩 + 后台的汇总审核修改权限
     * 
     *     3. 部门负责人(3) - 项目打分 + 查看项目评分 + 项目评分汇总 + 查看互评得分 + 对项目负责人打分
     *     4. 部门成员(4)   - 项目打分 + 查看项目评分 + 项目评分汇总 + 查看互评得分
     * 
     *     5. 项目负责人(5) - 项目评分汇总 + 查看互评得分 + 对部门负责人打分
     *     6. 项目成员(6)   - 项目评分汇总 + 查看互评得分
     */
    
    let baseQuery = [{ // 基础考核查询列表
      name: '项目评分汇总',
      link: '/pages/scoreLists/scoreLists?isView=true&isSummary=true'
    }, {
      name: '经理互评排名',
      link: '/pages/scoreCharge/scoreCharge?&isView=true&viewScore=true&showSaveBtn=false&scoreType=1'
    }, {
      name: '科长互评排名',
      link: '/pages/scoreCharge/scoreCharge?&isView=true&viewScore=true&showSaveBtn=false&scoreType=0'
    }];

    let baseQueryDepartment = baseQuery.concat([{ // 基础考核查询列表2
      name: '查看项目评分',
      link: '/pages/project/project?isView=true&isQuery=true'
    }]);

    // 设置不同角色权限
    if ( roleId === 1 || roleId === 2 || roleId === 7 ) { // 总经理/办公室主任/书记(只有查看权限)
      that.setData({
        checkQuery: baseQuery
      });
    } else if ( roleId === 3 ) { // 部门负责人
      that.setData({
        checkScore: [{
          name: '项目评分',
          link: '/pages/project/project?showSaveBtn=true&noneMargin=true'
        }, {
          name: '项目经理考核',
          link: '/pages/scoreCharge/scoreCharge?scoreType=1&showSaveBtn=true&showNone=false'
        }],
        checkQuery: baseQuery
      });
    } else if ( roleId === 4 ) { // 部门相关人员
      that.setData({
        checkScore: [{
          name: '项目评分',
          link: '/pages/project/project?showSaveBtn=true'
        }],
        checkQuery: [{
          name: '项目评分汇总',
          link: '/pages/scoreLists/scoreLists?isView=true&isSummary=true'
        }]
      });
    } else if ( roleId === 5 ) { // 项目负责人
      that.setData({
        checkScore: [{
          name: '部门经理考核',
          link: '/pages/scoreCharge/scoreCharge?scoreType=0&showSaveBtn=true&showNone=false'
        }],
        checkQuery: baseQuery
      });
    } else if ( roleId === 6 ) { // 项目相关人员
      that.setData({
        checkQuery: [{
          name: '项目评分汇总',
          link: '/pages/scoreLists/scoreLists?isView=true&isSummary=true'
        }
        // , {
        //   name: '查看项目评分',
        //   link: '/pages/project/project?isView=true&isQuery=true'
        // }
      ]
      });
    }
  },
  changeIndicatorDots: function(e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function(e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function(e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function(e) {
    this.setData({
      duration: e.detail.value
    })
  }
})
