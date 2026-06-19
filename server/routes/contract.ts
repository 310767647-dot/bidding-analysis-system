import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { extractTextFromFile, analyzeContract, generateSummary, ContractAnalysisResult } from '../services/contractAnalyzer'

export function contractRoutes(upload: multer.Multer): express.Router {
  const router = express.Router()
  
  router.post('/analyze', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: '请上传文件' })
      }

      // 修复中文文件名乱码：multer 默认以 latin1 解码，需转回 utf8
      const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')

      const filePath = req.file.path
      const text = await extractTextFromFile(filePath)
      const clauses = analyzeContract(text)
      const summary = generateSummary(clauses)

      fs.unlinkSync(filePath)

      const result: ContractAnalysisResult = {
        fileName: originalName,
        clauses,
        summary
      }
      
      res.json(result)
    } catch (error) {
      console.error('合同分析错误:', error)
      res.status(500).json({ error: '分析失败，请重试' })
    }
  })
  
  return router
}
