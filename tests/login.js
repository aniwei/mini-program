const axios = require('axios')
const qrcode = require('qrcode-terminal')

const host = `https://open.weixin.qq.com`

axios.get(`${host}/connect/qrconnect?appid=wxde40e023744664cb&redirect_uri=https%3A%2F%2Fmp.weixin.qq.com%2Fdebug%2Fcgi-bin%2Fwebdebugger%2Fqrcode&scope=snsapi_login&state=login&os=darwin&clientversion=1062208010`).then(res => {
  console.log(res.data)
  const rqrcode = /src="\/(connect\/qrcode\/.+)"/
  const result = res.data.match(rqrcode)

  const url = `${host}/${result[1]}`;
  qrcode.generate(url)

  const longPollReg = /"(https:\/\/long.open.weixin.qq.com\/connect\/l\/qrconnect\?uuid=.+?)"/
  const pollUrl = res.data.match(longPollReg)[1]

  console.log(url, pollUrl)

  const LOGIN_WX_ERRR_CODE = {
    SUCCESS: 405,
    SCANNED: 404,
    CANCELLED: 403,
    TIMEOUT: 402,
    ERROR: 500,
    KEEP_ALIVE: 408
  }

  const platform = 'darwin' === process.platform ? 'darwin' : 'win'

  axios.get(`${pollUrl}&last=""}&_=${+new Date()}`).then(result => {
    console.log(`result`, result.data)
    eval(result.data)
    const e = window.wx_errcode
    console.log(e)
    switch(e) {
      case LOGIN_WX_ERRR_CODE.SUCCESS:
        const loginRedirectUrl = `https://mp.weixin.qq.com/debug/cgi-bin/webdebugger/qrcode?code=${window.wx_code}&state=${platform}`;
        // // 拿到登陆信息
        // request({ url: loginRedirectUrl }, (a, b, res) => {
        //     let a = JSON.parse(res);
        //     let i = b.headers,
        //     j = i["debugger-signature"],
        //     k = i["debugger-newticket"],
        //     l = +new Date(),
        //     m = {
        //       signature: j,
        //       newticket: k,
        //       openid: a.openid,
        //       nickName: a.nickname,
        //       headUrl:
        //         a.headurl ||
        //         "https://res.wx.qq.com/zh_CN/htmledition/v2/images/web_wechat_no_contect.png",
        //       ticketExpiredTime: 1e3 * a.ticket_expired_time + l,
        //       signatureExpiredTime: 1e3 * a.signature_expired_time + l,
        //       sex: 1 === a.sex ? "male" : "female",
        //       province: a.province,
        //       city: a.city,
        //       contry: a.contry
        //     }
        // })
  }
  })
}).catch(error => {
  console.log(error)
})