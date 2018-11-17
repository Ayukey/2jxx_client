import MD5 from '../../utils/MD5';

const {
  Api,
  wxRequest
} = require('../../utils/httpclient.js');

const regeneratorRuntime = require('regenerator-runtime');
import Toast from '../../dist/toast/toast';

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
    }]
  },
  onLoad() {
    let {
      actionList
    } = this.data
    const user = wx.getStorageSync('user');
    if (user) {
      actionList[0].model = user.account
      actionList[0].readonly = true
    }

    this.setData({
      actionList
    });

  },
  getUserChangeInfo(ev) {
    let {
      actionList
    } = this.data
    const tartget = ev.target
    const detail = ev.detail
    let index = tartget.dataset.index // 当前输入input的索引值
    let value = detail.value // 当前输入的值

    actionList[index].model = value;

    this.setData({
      actionList
    });
  },
  showClearAction(ev) {
    this.actionHandler(ev, true);
  },
  hideClearAction(ev) {
    this.actionHandler(ev, false);
  },
  actionHandler(ev, boolean) {
    let {
      actionList
    } = this.data;
    const tartget = ev.target
    let index = tartget.dataset.index; // 当前输入input的索引值
    actionList[index].showClearAction = boolean;

    this.setData({
      actionList
    })
  },
  clearInput(ev) {
    let {
      actionList
    } = this.data;
    const tartget = ev.target
    let index = tartget.dataset.index; // 当前输入input的索引值
    actionList[index].model = '';

    this.setData({
      actionList
    });
  },
  saveNewPwd() {
    let {
      actionList
    } = this.data;
    let [name, oldPwd, newPwd, confirmPwd] = actionList
    let checkLenReg = /^[a-zA-Z0-9]{6,16}$/;
    if (name.model === '') {
      Toast.fail('用户名不为空')
      return;
    }
    if (oldPwd.model === '') {
      Toast.fail('旧密码不为空')
      return;
    }

    if (newPwd.model === '') {
      Toast.fail('新密码不为空')
      return;
    }

    if (!checkLenReg.test(newPwd.model)) {
      Toast.fail('新密码为6~16位字符，区分大小写')
      return;
    }

    if (confirmPwd.model === '') {
      Toast.fail('确认密码不能为空')
      return;
    }

    if (newPwd.model !== confirmPwd.model) {
      Toast.fail('密码不一致')
      return;
    }

    this.changePassword(name.model, oldPwd.model, newPwd.model)
  },

  /**
   * 修改密码
   */
  changePassword: async function(name, oldPwd, newPwd) {
    Toast.loading({
      mask: true,
      message: '加载中...'
    })

    try {
      const resp = await wxRequest(Api.ModifyPwd, 'POST', {
        account: name,
        oldPassword: MD5(oldPwd),
        newPassword: MD5(newPwd)
      })
      Toast.success('操作成功');
      wx.setStorageSync('reLogin', true)
      wx.navigateBack()
    }
    catch (error) {
      Toast.fail(error);
    }
  }
});