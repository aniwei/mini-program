const nodemailer = require(`nodemailer`)


const main = async  () => {

  let transporter = nodemailer.createTransport({
    host: "mail.pulsesbox.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: `member@pulsesbox.com`, // generated ethereal user
      pass: `PBmem123`, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"11111 Foo 👻" <member@pulsesbox.com>', // sender address
    to: "aniwei.studio@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });
  
  console.log("Message sent: %s", info);
}

main()