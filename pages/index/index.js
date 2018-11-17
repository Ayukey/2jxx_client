// index.js
// 获取应用实例
const app = getApp();
import news from '../../news.js';

const {
  Api,
  wxRequest
} = require('../../utils/httpclient.js');

const regeneratorRuntime = require('regenerator-runtime');

Page({
  data: {
    checkScore: [],
    checkQuery: [],
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 500,
    imgUrls: [],
    slideIn: false,
    ballRight: 10,
    ballBottom: 40,
    screenHeight: 0,
    screenWidth: 0,

    //当前登录用户
    currentUser: {},
  },
  onLoad: function() {
    let that = this

    let tempImgList = [];
    news.forEach(item => {
      tempImgList.push({
        url: item.cover,
        id: item.id
      })
    })

    this.setData({
      imgUrls: tempImgList
    })


    wx.getSystemInfo({
      success(res) {
        that.setData({
          screenHeight: res.windowHeight,
          screenWidth: res.windowWidth
        })
      }
    })
  },
  onShow() {
    // 登录后未显示当前角色菜单 - 待处理
    const currentUser = wx.getStorageSync('user');
    if (currentUser) {
      this.setData({
        currentUser
      });
      this.DRM(currentUser.roleId);

      this.getActiveQuarter()
    }

    let reLogin = wx.getStorageSync('reLogin');
    if (reLogin) {
      wx.clearStorage();
      this.setData({
        checkScore: [],
        checkQuery: []
      });
      wx.navigateTo({
        url: '/pages/login/login',
        success() {
          wx.removeStorageSync('reLogin');
        }
      });
    }
  },
  /**
   * 跳转至新闻
   */
  onSwiperTap(ev) {
    let id = ev.target.dataset.id;
    wx.navigateTo({
      url: `/pages/news/news?id=${id}`
    });
  },
  /**
   * 跳转至登录
   */
  skipToLogin() {
    wx.navigateTo({
      url: '../login/login'
    })
  },
  checkIsLogin(ev) { // 是否已登录
    const {
      currentUser
    } = this.data

    const type = ev.currentTarget.dataset.type
    const url = ev.currentTarget.dataset.url
    const activeQuarter = wx.getStorageSync('activeQuarter');
    if (type == 1) {
      if (!currentUser.uid || !activeQuarter.inActive) {
        wx.showModal({
          title: '系统提示',
          content: '考核尚未开始',
          showCancel: false,
          confirmText: "知道了"
        })
        return
      }
    }

    wx.navigateTo({
      url
    })
  },

  /**
   *  登出
   */
  loginOut() {
    let that = this
    wx.showModal({
      title: '退出登录',
      content: '确定退出当前用户?',
      success(res) {
        if (res.confirm) {
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

  ballMoveEvent(e) {
    const APPDATA = this.data;
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
    this.setData({
      ballBottom: y,
      ballRight: x
    });
  },

  slideMenu() {
    this.setData({
      slideIn: true
    });
  },

  /**
   *  跳转至修改密码
   */
  skipToModifyPwd() {
    let that = this
    wx.navigateTo({
      url: '/pages/changePwd/changePwd',
      success: function(res) {
        that.setData({
          slideIn: false
        });
      }
    })
  },

  cancelSlideMenu() {
    this.setData({
      slideIn: false
    });
  },

  DRM(roleId) { // 角色权限设置
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
    if (roleId === 1 || roleId === 2 || roleId === 7) { // 总经理/办公室主任/书记(只有查看权限)
      this.setData({
        checkQuery: baseQuery
      });
    } else if (roleId === 3) { // 部门负责人
      this.setData({
        checkScore: [{
          name: '项目评分',
          link: '/pages/project/project?showSaveBtn=true&noneMargin=true'
        }, {
          name: '项目经理考核',
          link: '/pages/scoreCharge/scoreCharge?scoreType=1&showSaveBtn=true&showNone=false'
        }],
        checkQuery: baseQuery
      });
    } else if (roleId === 4) { // 部门相关人员
      this.setData({
        checkScore: [{
          name: '项目评分',
          link: '/pages/project/project?showSaveBtn=true'
        }],
        checkQuery: [{
          name: '项目评分汇总',
          link: '/pages/scoreLists/scoreLists?isView=true&isSummary=true'
        }]
      });
    } else if (roleId === 5) { // 项目负责人
      this.setData({
        checkScore: [{
          name: '部门经理考核',
          link: '/pages/scoreCharge/scoreCharge?scoreType=0&showSaveBtn=true&showNone=false'
        }],
        checkQuery: baseQuery
      });
    } else if (roleId === 6) { // 项目相关人员
      this.setData({
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
  },

  /**
   *  获取当前考核季度状态信息
   */
  getActiveQuarter: async function() {
    try {
      const resp = await wxRequest(Api.GetCurrentQuarter)

      if (resp) {
        wx.setStorageSync('activeQuarter', resp);
        wx.navigateBack();
      }
    } catch (error) {
      console.log(error)
    }
  }
})