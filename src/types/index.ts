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
