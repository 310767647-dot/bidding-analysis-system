import { useState } from 'react'
import { Card, Typography, Button, Spin, Alert } from 'antd'
import { FileUpload } from '../components/FileUpload'
import { BiddingResult } from '../components/BiddingResult'
import { analyzeBidding } from '../services/api'
import type { BiddingAnalysisResult } from '../types'

const { Title, Text } = Typography

export function BiddingAnalysis() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<BiddingAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setResult(null)
    setError('')
  }
  
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('请先选择文件')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const analysisResult = await analyzeBidding(selectedFile)
      setResult(analysisResult)
    } catch (err) {
      setError('分析失败，请重试')
      console.error('分析错误:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleReset = () => {
    setSelectedFile(null)
    setResult(null)
    setError('')
  }
  
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: 24 }}>
      <Title level={1} style={{ textAlign: 'center', marginBottom: 32 }}>
        招标文件智能分析
      </Title>
      
      {result ? (
        <BiddingResult result={result} />
      ) : (
        <Card style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={3} style={{ marginBottom: 24 }}>
              上传招标文件
            </Title>
            
            {error && (
              <Alert message={error} type="error" style={{ marginBottom: 16 }} />
            )}
            
            <FileUpload onFileSelect={handleFileSelect} disabled={loading} accept=".pdf,.doc,.docx,.txt,.xlsx,.xls" />
            
            {selectedFile && (
              <div style={{ marginTop: 16, padding: 16, background: '#f0f5ff', borderRadius: 8 }}>
                <Text strong>已选择文件: </Text>
                <Text>{selectedFile.name}</Text>
              </div>
            )}
            
            <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Button
                type="primary"
                size="large"
                onClick={handleAnalyze}
                loading={loading}
                disabled={!selectedFile || loading}
              >
                {loading ? '分析中...' : '开始分析'}
              </Button>
              
              {selectedFile && (
                <Button size="large" onClick={handleReset}>
                  重新选择
                </Button>
              )}
            </div>
            
            {loading && (
              <div style={{ marginTop: 24 }}>
                <Spin tip="正在分析招标文件内容..." size="large" />
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
