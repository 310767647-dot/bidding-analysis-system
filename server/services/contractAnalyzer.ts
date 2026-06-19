import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export interface ContractClause {
  type: string
  title: string
  content: string
  position: string
  riskLevel: 'high' | 'medium' | 'low' | 'none'
  riskDescription?: string
}

export interface ContractAnalysisResult {
  fileName: string
  clauses: ContractClause[]
  summary: {
    totalClauses: number
    highRisk: number
    mediumRisk: number
    lowRisk: number
  }
}

const clausePatterns: { type: string; title: string; patterns: string[]; riskKeywords: string[] }[] = [
  {
    type: 'payment',
    title: '付款条款',
    patterns: ['付款', '支付', '结算', '价款', '金额', '费用', '酬金', '预付款', '进度款', '竣工款', '质保金'],
    riskKeywords: ['无', '未约定', '逾期', '违约金', '利息', '滞纳金', '扣留', '暂扣']
  },
  {
    type: 'duration',
    title: '工期条款',
    patterns: ['工期', '开工', '竣工', '完工', '期限', '延误', '延期', '日历天', '工作日'],
    riskKeywords: ['延误', '违约金', '罚款', '赔偿', '赶工', '不可抗力']
  },
  {
    type: 'default',
    title: '违约条款',
    patterns: ['违约', '违反', '责任', '赔偿', '违约金', '损害赔偿', '解除', '终止'],
    riskKeywords: ['违约', '赔偿', '违约金', '解除', '终止', '双倍', '按日']
  },
  {
    type: 'acceptance',
    title: '验收条款',
    patterns: ['验收', '检验', '确认', '合格', '交付', '试运行', '保修期'],
    riskKeywords: ['不合格', '返工', '复验', '异议', '拒绝', '质保期']
  },
  {
    type: 'claim',
    title: '索赔条款',
    patterns: ['索赔', '理赔', '补偿', '追索', '权利主张'],
    riskKeywords: ['索赔', '期限', '证据', '通知', '时效']
  },
  {
    type: 'liability',
    title: '责任条款',
    patterns: ['责任', '义务', '保证', '担保', '承诺'],
    riskKeywords: ['全部', '连带责任', '无限', '赔偿']
  },
  {
    type: 'termination',
    title: '解除终止条款',
    patterns: ['解除', '终止', '撤销', '失效'],
    riskKeywords: ['任意解除', '无条件', '提前终止', '违约金']
  }
]

function analyzeRisk(content: string, riskKeywords: string[]): { level: 'high' | 'medium' | 'low' | 'none'; description?: string } {
  let level: 'high' | 'medium' | 'low' | 'none' = 'none'
  let description = ''
  
  const highRiskPatterns = ['无约定', '未约定', '未明确', '无条件', '任意', '全部责任', '连带责任', '无限责任']
  const mediumRiskPatterns = ['逾期', '违约金', '赔偿', '罚款', '扣留', '暂扣']
  
  for (const pattern of highRiskPatterns) {
    if (content.includes(pattern)) {
      level = 'high'
      description = `发现高风险关键词: ${pattern}`
      break
    }
  }
  
  if (level === 'none') {
    for (const pattern of mediumRiskPatterns) {
      if (content.includes(pattern)) {
        level = 'medium'
        description = `发现中等风险关键词: ${pattern}`
        break
      }
    }
  }
  
  if (level === 'none') {
    for (const keyword of riskKeywords) {
      if (content.includes(keyword)) {
        level = 'low'
        description = `发现风险关键词: ${keyword}`
        break
      }
    }
  }
  
  return { level, description }
}

export async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase()
  
  if (ext === '.pdf') {
    const data = await fs.promises.readFile(filePath)
    const pdfData = await pdfParse(data)
    return pdfData.text
  } else if (ext === '.doc' || ext === '.docx') {
    const data = await fs.promises.readFile(filePath)
    const result = await mammoth.extractRawText({ buffer: data })
    return result.value
  } else if (ext === '.txt') {
    return await fs.promises.readFile(filePath, 'utf-8')
  } else {
    throw new Error(`不支持的文件格式: ${ext}`)
  }
}

export function analyzeContract(text: string): ContractClause[] {
  const clauses: ContractClause[] = []
  const lines = text.split('\n')
  
  for (const clausePattern of clausePatterns) {
    let currentClause: string[] = []
    let inClause = false
    let lineNumber = 0
    
    for (const line of lines) {
      lineNumber++
      const trimmedLine = line.trim()
      
      const matchesPattern = clausePattern.patterns.some(p => 
        trimmedLine.includes(p) && trimmedLine.length > 0
      )
      
      if (matchesPattern && !inClause) {
        inClause = true
        currentClause = [trimmedLine]
      } else if (inClause) {
        if (trimmedLine.length > 0 && !clausePatterns.some(cp => 
          cp.patterns.some(p => trimmedLine.includes(p)) && cp.type !== clausePattern.type
        )) {
          currentClause.push(trimmedLine)
        } else if (currentClause.length > 0) {
          const content = currentClause.join('\n')
          const risk = analyzeRisk(content, clausePattern.riskKeywords)
          
          clauses.push({
            type: clausePattern.type,
            title: clausePattern.title,
            content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
            position: `第${lineNumber - currentClause.length + 1}-${lineNumber}行`,
            riskLevel: risk.level,
            riskDescription: risk.description
          })
          
          currentClause = []
          inClause = false
        }
      }
    }
    
    if (currentClause.length > 0) {
      const content = currentClause.join('\n')
      const risk = analyzeRisk(content, clausePattern.riskKeywords)
      
      clauses.push({
        type: clausePattern.type,
        title: clausePattern.title,
        content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
        position: `第${lineNumber - currentClause.length + 1}-${lineNumber}行`,
        riskLevel: risk.level,
        riskDescription: risk.description
      })
    }
  }
  
  return clauses
}

export function generateSummary(clauses: ContractClause[]): ContractAnalysisResult['summary'] {
  return {
    totalClauses: clauses.length,
    highRisk: clauses.filter(c => c.riskLevel === 'high').length,
    mediumRisk: clauses.filter(c => c.riskLevel === 'medium').length,
    lowRisk: clauses.filter(c => c.riskLevel === 'low').length
  }
}
