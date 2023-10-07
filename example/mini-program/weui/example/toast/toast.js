Page({
  mixins: [require('../../mixin/common')],
  data: {
    toast: false,
    warnToast: false,
    textMoreToast: false,
    textToast: false,
    loading: false,
    hideToast: false,
    hideWarnToast: false,
    hideTextMoreToast: false,
    hideTextToast: false,
    hideLoading: false,
  },
  openToast() {
    this.setData({
      toast: true,
    });
    setTimeout(() => {
      this.setData({
        hideToast: true,
      });
      setTimeout(() => {
        this.setData({
          toast: false,
          hideToast: false,
        });
      }, 300);
    }, 3000);
  },
  openWarnToast() {
    this.setData({
      warnToast: true,
    });
    setTimeout(() => {
      this.setData({
        hidewarnToast: true,
      });
      setTimeout(() => {
        this.setData({
          warnToast: false,
          hidewarnToast: false,
        });
      }, 300);
    }, 3000);
  },
  openTextMoreToast() {
    this.setData({
      textMoreToast: true,
    });
    setTimeout(() => {
      this.setData({
        hideTextMoreToast: true,
      });
      setTimeout(() => {
        this.setData({
          textMoreToast: false,
          hideTextMoreToast: false,
        });
      }, 300);
    }, 3000);
  },
  openTextToast() {
    this.setData({
      textToast: true,
    });
    setTimeout(() => {
      this.setData({
        hideTextToast: true,
      });
      setTimeout(() => {
        this.setData({
          textToast: false,
          hideTextToast: false,
        });
      }, 300);
    }, 3000);
  },
  openLoading() {
    this.setData({
      loading: true,
    });
    setTimeout(() => {
      this.setData({
        hideLoading: true,
      });
      setTimeout(() => {
        this.setData({
          loading: false,
          hideLoading: false,
        });
      }, 300);
    }, 3000);
  },
});
