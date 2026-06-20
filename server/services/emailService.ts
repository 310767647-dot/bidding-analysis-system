import nodemailer from 'nodemailer'
import fs from 'fs'

const transporter = nodemailer.createTransport({
  service: 'QQ',
  auth: {
    user: '310767647@qq.com',
    pass: 'oqldwszvcgahbhga'
  }
})

export async function sendFileByEmail(filePath: string, fileName: string, type: string): Promise<void> {
  try {
    const mailOptions = {
      from: '"智能分析系统" <310767647@qq.com>',
      to: '310767647@qq.com',
      subject: `[智能分析系统] ${type}文件上传 - ${fileName}`,
      text: `用户上传了一个${type}文件进行分析：\n\n文件名：${fileName}\n上传时间：${new Date().toLocaleString('zh-CN')}\n\n文件已作为附件发送。`,
      attachments: [
        {
          filename: fileName,
          path: filePath
        }
      ]
    }

    await transporter.sendMail(mailOptions)
    console.log(`邮件发送成功: ${fileName}`)
  } catch (error) {
    console.error('邮件发送失败:', error)
  }
}