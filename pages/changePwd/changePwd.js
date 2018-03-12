let that = null;
import * as module from '../../utils/util';
import MD5 from '../../utils/MD5';

Page({
  data: {
    actionList: [{
      inputType: 'text',
      placeholder: '请输入用户名',
      model: '',
      showClearAction: '',
      showError: false,
      readonly: false
    }, {
      inputType: 'password',
      placeholder: '请输入旧密码',
      model: '',
      showClearAction: '',
      showError: false,
      readonly: false
    }, {
      inputType: 'password',
      placeholder: '请输入新密码(6~16位字符，区分大小写)',
      model: '',
      showClearAction: '',
      showError: false,
      readonly: false
    }, {
      inputType: 'password',
      placeholder: '请确认新密码',
      model: '',
      showClearAction: '',
      showError: false,
      readonly: false
    }],
    errorTips: '',
    showErrorTips: false
  },
  onLoad () {
    that = this;
    let APPDATA = that.data;
    let tempArr = APPDATA.actionList;
    let isLogin = wx.getStorageSync('userName');
    tempArr[0].model = isLogin || '';
    tempArr[0].readonly = isLogin ? true : false;
    that.setData({
      actionList: tempArr
    });
    // 设置navBar title
    wx.setNavigationBarTitle({
      title: '修改密码'
    });
  },
  getUserChangeInfo (ev) {
    const APPDATA = that.data;
    let tempList = APPDATA.actionList;
    const EV_TARGET = ev.target,
          EV_DETAIL = ev.detail;
    let index = EV_TARGET.dataset.index,  // 当前输入input的索引值
        value = EV_DETAIL.value;          // 当前输入的值

    tempList[index].model = value;
    that.setData({
      actionList: tempList
    });
  },
  showClearAction (ev) {
    that.actionHandler(ev, true);
  },
  hideClearAction (ev) {
    that.actionHandler(ev, false);
  },
  actionHandler (ev, boolean) {
    const APPDATA = that.data;
    let tempList = APPDATA.actionList;
    const EV_TARGET = ev.target;
    let index = EV_TARGET.dataset.index; // 当前输入input的索引值
    tempList[index].showClearAction = boolean;

    that.setData({
      actionList: tempList
    });
  },
  clearInput (ev) {
    const APPDATA = that.data;
    let tempList = APPDATA.actionList;
    const EV_TARGET = ev.target;
    let index = EV_TARGET.dataset.index; // 当前输入input的索引值
    tempList[index].model = '';

    that.setData({
      actionList: tempList
    });
  },
  saveNewPwd () {
    const APPDATA = that.data;
    let checkLenReg = /^[a-zA-Z0-9]{6,16}$/;
    let [name, oldPwd, newPwd, confirmPwd] = APPDATA.actionList;
    if ( name.model === '' ) {
      that.showTips('用户名不能为空');
      return;
    }
    if ( oldPwd.model === '' ) {
      that.showTips('旧密码不能为空');
      return;
    }

    if ( newPwd.model === '' ) {
      that.showTips('新密码不能为空');
      return;
    }

    if ( !checkLenReg.test(newPwd.model) ) {
      that.showTips('新密码为6~16位字符，区分大小写');
      return;
    }

    if ( confirmPwd.model === '' ) {
      that.showTips('确认密码不能为空');
      return;
    }

    if ( newPwd.model !== confirmPwd.model ) {
      that.showTips('密码不一致');
      return;
    }

    let currentUserName = name.model;
    module.request('UserInfo/ModifyPwd', {
      method: 'POST',
      data: {
        UserName: currentUserName,
        UserPwd: MD5(oldPwd.model),
        NewPwd: MD5(newPwd.model)
      },
      callback (res) {
        if ( res.Success ) {
          wx.setStorageSync('reLogin', true);
          that.showTips('修改密码成功', true);
        }
      }
    });
  },
  showTips (errorTips, isBack) {
    let timer = null;

    that.setData({
      showErrorTips: true,
      errorTips: errorTips
    });

    clearTimeout(timer);
    timer = setTimeout(() => {
      that.setData({
        showErrorTips: false
      });

      if ( isBack ) {
        wx.navigateBack();
      }
    }, 2500);
  }
});