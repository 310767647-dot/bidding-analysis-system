import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const app = express()
const port = parseInt(process.env.PORT || '3001', 10)

app.use(cors())
app.use(express.json())

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads')
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, `${Date.now()}-${originalName}`)
  }
})

const upload = multer({ storage })

import { contractRoutes } from './routes/contract'
import { biddingRoutes } from './routes/bidding'

app.use('/api/contract', contractRoutes(upload))
app.use('/api/bidding', biddingRoutes(upload))

// Serve static frontend files
const publicPath = path.join(__dirname, '../public')
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath))
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html')
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath)
    } else {
      res.status(404).send('Frontend not built')
    }
  })
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`)
})
