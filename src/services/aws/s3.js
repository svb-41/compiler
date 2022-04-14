const path = require('path')
const fs = require('fs')
const AWS = require('aws-sdk')

const S3 = new AWS.S3()
const Bucket = 'svb-41-dev'

module.exports.put = async ({ path: p, content }) => {
  if (process.env.NODE_ENV === 'development') {
    const base = path.resolve(__dirname, '../../../s3')
    const final = path.resolve(base, p)
    const [_, ...all] = final.split('/').reverse()
    const before = all.reverse().join('/')
    await fs.promises.mkdir(before, { recursive: true })
    return await fs.promises.writeFile(final, content)
  } else {
    return await new Promise((res, rej) => {
      const cb = (err, res_) => (err ? rej(err) : res(res_))
      S3.putObject({ Bucket, Key: p, Body: content }, cb)
    })
  }
}

module.exports.get = async ({ path: p }) => {
  if (process.env.NODE_ENV === 'development') {
    const base = path.resolve(__dirname, '../../../s3')
    const final = path.resolve(base, p)
    return await fs.promises.readFile(final)
  } else {
    return await new Promise((res, rej) => {
      const cb = (err, res_) =>
        err ? rej(err) : res(res_.Body.toString('utf-8'))
      S3.getObject({ Bucket, Key: p }, cb)
    })
  }
}
