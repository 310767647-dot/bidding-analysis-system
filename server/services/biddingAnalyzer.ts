import fs from 'fs'
import path from 'path'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import xlsx from 'xlsx'

export interface BiddingRequirement {
  type: string
  title: string
  content: string
  position: string
}

export interface ScoringRule {
  category: string
  maxScore: number
  criteria: string[]
}

export interface DisqualificationRisk {
  description: string
  severity: 'high' | 'medium' | 'low'
  position: string
}

export interface TaskAssignment {
  taskName: string
  responsible: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
}

export interface BiddingAnalysisResult {
  fileName: string
  qualificationRequirements: BiddingRequirement[]
  billOfQuantities: any[]
  duration: BiddingRequirement[]
  scoringRules: ScoringRule[]
  disqualificationRisks: DisqualificationRisk[]
  taskAssignments: TaskAssignment[]
}

const qualificationPatterns: { type: string; title: string; patterns: string[] }[] = [
  {
    type: 'qualification',
    title: '资格条件',
    patterns: ['资质', '资格', '注册资本', '业绩', '人员', '设备', '财务', '信用']
  },
  {
    type: 'businessLicense',
    title: '营业执照',
    patterns: ['营业执照', '统一社会信用代码', '法人']
  },
  {
    type: 'certification',
    title: '认证证书',
    patterns: ['ISO', '认证', '体系认证', '资质证书']
  }
]

const durationPatterns = ['工期', '投标有效期', '交货期', '服务期', '期限']

const scoringPatterns: { category: string; patterns: string[] }[] = [
  { category: '技术方案', patterns: ['技术', '方案', '设计', '施工组织'] },
  { category: '商务报价', patterns: ['报价', '价格', '费率', '成本'] },
  { category: '企业业绩', patterns: ['业绩', '经验', '案例', '项目经历'] },
  { category: '人员配备', patterns: ['人员', '团队', '项目经理', '技术负责人'] },
  { category: '售后服务', patterns: ['售后', '服务', '质保', '维护'] }
]

const disqualificationPatterns: { pattern: string; severity: 'high' | 'medium' | 'low' }[] = [
  { pattern: '无效投标', severity: 'high' },
  { pattern: '废标', severity: 'high' },
  { pattern: '不予受理', severity: 'high' },
  { pattern: '逾期送达', severity: 'high' },
  { pattern: '密封不合格', severity: 'high' },
  { pattern: '资质不符', severity: 'high' },
  { pattern: '未加盖公章', severity: 'high' },
  { pattern: '未授权', severity: 'high' },
  { pattern: '联合体', severity: 'medium' },
  { pattern: '分包', severity: 'medium' },
  { pattern: '业绩不足', severity: 'medium' },
  { pattern: '保证金', severity: 'medium' },
  { pattern: '偏离', severity: 'low' },
  { pattern: '细微偏差', severity: 'low' }
]

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
  } else if (ext === '.xlsx' || ext === '.xls') {
    const workbook = xlsx.readFile(filePath)
    let text = ''
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName]
      text += xlsx.utils.sheet_to_csv(sheet) + '\n'
    })
    return text
  } else {
    throw new Error(`不支持的文件格式: ${ext}`)
  }
}

export function extractQualificationRequirements(text: string): BiddingRequirement[] {
  const requirements: BiddingRequirement[] = []
  const lines = text.split('\n')
  
  for (const pattern of qualificationPatterns) {
    let currentContent: string[] = []
    let inRequirement = false
    let lineNumber = 0
    
    for (const line of lines) {
      lineNumber++
      const trimmedLine = line.trim()
      
      const matchesPattern = pattern.patterns.some(p => trimmedLine.includes(p))
      
      if (matchesPattern && !inRequirement && trimmedLine.length > 0) {
        inRequirement = true
        currentContent = [trimmedLine]
      } else if (inRequirement) {
        if (trimmedLine.length > 0 && !qualificationPatterns.some(qp => 
          qp.patterns.some(p => trimmedLine.includes(p)) && qp.type !== pattern.type
        )) {
          currentContent.push(trimmedLine)
        } else if (currentContent.length > 0) {
          requirements.push({
            type: pattern.type,
            title: pattern.title,
            content: currentContent.join('\n').substring(0, 500),
            position: `第${lineNumber - currentContent.length + 1}-${lineNumber}行`
          })
          currentContent = []
          inRequirement = false
        }
      }
    }
    
    if (currentContent.length > 0) {
      requirements.push({
        type: pattern.type,
        title: pattern.title,
        content: currentContent.join('\n').substring(0, 500),
        position: `第${lines.length - currentContent.length + 1}-${lines.length}行`
      })
    }
  }
  
  return requirements
}

export function extractDuration(text: string): BiddingRequirement[] {
  const requirements: BiddingRequirement[] = []
  const lines = text.split('\n')
  
  let currentContent: string[] = []
  let inDuration = false
  let lineNumber = 0
  
  for (const line of lines) {
    lineNumber++
    const trimmedLine = line.trim()
    
    const matchesPattern = durationPatterns.some(p => trimmedLine.includes(p))
    
    if (matchesPattern && !inDuration && trimmedLine.length > 0) {
      inDuration = true
      currentContent = [trimmedLine]
    } else if (inDuration) {
      if (trimmedLine.length > 0 && !durationPatterns.some(p => trimmedLine.includes(p))) {
        currentContent.push(trimmedLine)
      } else if (currentContent.length > 0) {
        requirements.push({
          type: 'duration',
          title: '工期/期限要求',
          content: currentContent.join('\n').substring(0, 500),
          position: `第${lineNumber - currentContent.length + 1}-${lineNumber}行`
        })
        currentContent = []
        inDuration = false
      }
    }
  }
  
  if (currentContent.length > 0) {
    requirements.push({
      type: 'duration',
      title: '工期/期限要求',
      content: currentContent.join('\n').substring(0, 500),
      position: `第${lines.length - currentContent.length + 1}-${lines.length}行`
    })
  }
  
  return requirements
}

export function extractScoringRules(text: string): ScoringRule[] {
  const rules: ScoringRule[] = []
  const lines = text.split('\n')
  
  for (const pattern of scoringPatterns) {
    const criteria: string[] = []
    let foundCategory = false
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      if (pattern.patterns.some(p => trimmedLine.includes(p))) {
        foundCategory = true
        if (trimmedLine.length > 0) {
          criteria.push(trimmedLine)
        }
      } else if (foundCategory && trimmedLine.length > 0) {
        criteria.push(trimmedLine)
      } else if (foundCategory && trimmedLine.length === 0 && criteria.length > 0) {
        break
      }
    }
    
    if (criteria.length > 0) {
      let maxScore = 0
      for (const line of criteria) {
        const match = line.match(/(\d+)\s*分/)
        if (match) {
          maxScore = Math.max(maxScore, parseInt(match[1]))
        }
      }
      
      rules.push({
        category: pattern.category,
        maxScore: maxScore || 20,
        criteria: criteria.slice(0, 10)
      })
    }
  }
  
  return rules
}

export function extractDisqualificationRisks(text: string): DisqualificationRisk[] {
  const risks: DisqualificationRisk[] = []
  const lines = text.split('\n')
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (const pattern of disqualificationPatterns) {
      if (line.includes(pattern.pattern)) {
        risks.push({
          description: line.trim().substring(0, 200),
          severity: pattern.severity,
          position: `第${i + 1}行`
        })
      }
    }
  }
  
  return risks
}

export function extractBillOfQuantities(filePath: string): any[] {
  const ext = path.extname(filePath).toLowerCase()
  
  if (ext === '.xlsx' || ext === '.xls') {
    const workbook = xlsx.readFile(filePath)
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = xlsx.utils.sheet_to_json(firstSheet)
    return data.slice(0, 50)
  }
  
  return []
}

export function generateTaskAssignments(scoringRules: ScoringRule[], deadline: string): TaskAssignment[] {
  const tasks: TaskAssignment[] = []
  
  const taskMapping: { [key: string]: { responsible: string; priority: 'high' | 'medium' | 'low' } } = {
    '技术方案': { responsible: '技术部', priority: 'high' },
    '商务报价': { responsible: '商务部', priority: 'high' },
    '企业业绩': { responsible: '市场部', priority: 'medium' },
    '人员配备': { responsible: '人力资源部', priority: 'medium' },
    '售后服务': { responsible: '运维部', priority: 'low' }
  }
  
  for (const rule of scoringRules) {
    const mapping = taskMapping[rule.category] || { responsible: '综合部', priority: 'medium' }
    tasks.push({
      taskName: `${rule.category}准备`,
      responsible: mapping.responsible,
      deadline: deadline,
      priority: mapping.priority
    })
  }
  
  tasks.push(
    { taskName: '资格文件准备', responsible: '行政部', deadline: deadline, priority: 'high' },
    { taskName: '投标文件审核', responsible: '法务部', deadline: deadline, priority: 'high' },
    { taskName: '标书装订与密封', responsible: '行政部', deadline: deadline, priority: 'high' }
  )
  
  return tasks
}
