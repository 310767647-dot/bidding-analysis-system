import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import {
  extractTextFromFile,
  extractQualificationRequirements,
  extractDuration,
  extractScoringRules,
  extractDisqualificationRisks,
  extractBillOfQuantities,
  generateTaskAssignments,
  BiddingAnalysisResult
} from '../services/biddingAnalyzer'

export function biddingRoutes(upload: multer.Multer): express.Router {
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

      const qualificationRequirements = extractQualificationRequirements(text)
      const duration = extractDuration(text)
      const scoringRules = extractScoringRules(text)
      const disqualificationRisks = extractDisqualificationRisks(text)

      const ext = path.extname(originalName).toLowerCase()
      let billOfQuantities = []
      if (ext === '.xlsx' || ext === '.xls') {
        billOfQuantities = extractBillOfQuantities(filePath)
      }

      const today = new Date()
      const deadline = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const taskAssignments = generateTaskAssignments(scoringRules, deadline.toISOString().split('T')[0])

      fs.unlinkSync(filePath)

      const result: BiddingAnalysisResult = {
        fileName: originalName,
        qualificationRequirements,
        billOfQuantities,
        duration,
        scoringRules,
        disqualificationRisks,
        taskAssignments
      }
      
      res.json(result)
    } catch (error) {
      console.error('招标文件分析错误:', error)
      const errorMessage = error instanceof Error ? error.message : '分析失败，请重试'
      res.status(500).json({ error: errorMessage })
    }
  })
  
  return router
}
