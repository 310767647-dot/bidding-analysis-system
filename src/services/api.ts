import axios from 'axios'
import type { ContractAnalysisResult, BiddingAnalysisResult } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000
})

export async function analyzeContract(file: File): Promise<ContractAnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post<ContractAnalysisResult>('/contract/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  return response.data
}

export async function analyzeBidding(file: File): Promise<BiddingAnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post<BiddingAnalysisResult>('/bidding/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  
  return response.data
}
