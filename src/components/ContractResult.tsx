import { useState, useMemo } from 'react'
import { Card, Tag, Typography, Progress, Table, Select, Space, Statistic, Row, Col } from 'antd'
import { AlertOutlined, ClockCircleOutlined, CheckCircleOutlined, InfoCircleOutlined, FilterOutlined } from '@ant-design/icons'
import type { ContractAnalysisResult, ContractClause } from '../types'
import { getRiskLevelConfig } from '../utils/helpers'

interface ContractResultProps {
  result: ContractAnalysisResult
}

const { Title, Text, Paragraph } = Typography

const riskIconMap = {
  high: <AlertOutlined style={{ color: '#dc2626' }} />,
  medium: <ClockCircleOutlined style={{ color: '#d97706' }} />,
  low: <CheckCircleOutlined style={{ color: '#059669' }} />,
  none: <InfoCircleOutlined style={{ color: '#6b7280' }} />
}

// 分类映射
const categoryMapping: { [key: string]: string[] } = {
  '付款条款': ['付款', '支付', '结算', '收款', '价款', '费用'],
  '工期条款': ['工期', '期限', '时间', '交付', '竣工', '完成', '进度'],
  '违约责任': ['违约', '违约金', '赔偿', '损失', '责任', '赔偿金'],
  '验收条款': ['验收', '检验', '合格', '标准', '质量'],
  '索赔条款': ['索赔', '变更', '调整', '补偿', '追加'],
  '其他条款': []
}

function getClauseCategory(clause: ContractClause): string {
  const content = clause.title + ' ' + (clause.content || '')
  for (const [category, keywords] of Object.entries(categoryMapping)) {
    if (category === '其他条款') continue
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        return category
      }
    }
  }
  return '其他条款'
}

export function ContractResult({ result }: ContractResultProps) {
  const { summary, clauses, fileName } = result

  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // 计算分类统计
  const categoryStats = useMemo(() => {
    const stats: { [key: string]: { total: number; high: number; medium: number; low: number } } = {}
    for (const category of Object.keys(categoryMapping)) {
      stats[category] = { total: 0, high: 0, medium: 0, low: 0 }
    }

    clauses.forEach(clause => {
      const category = getClauseCategory(clause)
      stats[category].total++
      if (clause.riskLevel === 'high') stats[category].high++
      else if (clause.riskLevel === 'medium') stats[category].medium++
      else if (clause.riskLevel === 'low') stats[category].low++
    })

    return stats
  }, [clauses])

  // 筛选后的条款
  const filteredClauses = useMemo(() => {
    let filtered = clauses

    if (riskFilter !== 'all') {
      filtered = filtered.filter(c => c.riskLevel === riskFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(c => getClauseCategory(c) === categoryFilter)
    }

    return filtered
  }, [clauses, riskFilter, categoryFilter])

  // 计算筛选后的统计
  const filteredStats = useMemo(() => {
    return {
      total: filteredClauses.length,
      high: filteredClauses.filter(c => c.riskLevel === 'high').length,
      medium: filteredClauses.filter(c => c.riskLevel === 'medium').length,
      low: filteredClauses.filter(c => c.riskLevel === 'low').length,
      none: filteredClauses.filter(c => c.riskLevel === 'none').length
    }
  }, [filteredClauses])

  const highRiskPercent = summary.totalClauses > 0 ? (summary.highRisk / summary.totalClauses) * 100 : 0

  const columns = [
    {
      title: '条款类型',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (level: string) => {
        const config = getRiskLevelConfig(level)
        return (
          <Tag color={config.color}>{riskIconMap[level as keyof typeof riskIconMap]} {config.text}</Tag>
        )
      }
    },
    {
      title: '原文位置',
      dataIndex: 'position',
      key: 'position',
      render: (text: string) => <Text type="secondary">{text}</Text>
    },
    {
      title: '风险描述',
      dataIndex: 'riskDescription',
      key: 'riskDescription',
      render: (text?: string) => <Text type="danger">{text || '-'}</Text>
    }
  ]

  return (
    <div>
      <div style={{ padding: 24, borderBottom: '1px solid #f0f0f0' }}>
        <Title level={2}>合同分析报告</Title>
        <Text type="secondary">文件名: {fileName}</Text>
      </div>

      <div style={{ padding: 24 }}>
        {/* 风险等级筛选器 */}
        <Card style={{ marginBottom: 24 }} title={<><FilterOutlined /> 筛选条件</>}>
          <Space wrap>
            <div>
              <Text strong style={{ marginRight: 8 }}>风险等级:</Text>
              <Select
                value={riskFilter}
                onChange={setRiskFilter}
                style={{ width: 140 }}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'high', label: '高风险' },
                  { value: 'medium', label: '中风险' },
                  { value: 'low', label: '低风险' },
                  { value: 'none', label: '无风险' }
                ]}
              />
            </div>
            <div>
              <Text strong style={{ marginRight: 8 }}>条款分类:</Text>
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 160 }}
                options={[
                  { value: 'all', label: '全部' },
                  { value: '付款条款', label: '付款条款' },
                  { value: '工期条款', label: '工期条款' },
                  { value: '违约责任', label: '违约责任' },
                  { value: '验收条款', label: '验收条款' },
                  { value: '索赔条款', label: '索赔条款' },
                  { value: '其他条款', label: '其他条款' }
                ]}
              />
            </div>
          </Space>
        </Card>

        {/* 筛选后统计 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card><Statistic title="筛选条款数" value={filteredStats.total} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="高风险" value={filteredStats.high} valueStyle={{ color: '#dc2626' }} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="中风险" value={filteredStats.medium} valueStyle={{ color: '#d97706' }} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="低风险" value={filteredStats.low} valueStyle={{ color: '#059669' }} /></Card>
          </Col>
        </Row>

        {/* 风险概览 */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>整体风险概览</Title>
          <Progress percent={Math.round(highRiskPercent)} status={highRiskPercent > 30 ? 'exception' : highRiskPercent > 10 ? 'normal' : 'active'} />
          <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
            高风险条款占比: {Math.round(highRiskPercent)}%
          </Text>
        </Card>

        {/* 分类汇总 */}
        <Card style={{ marginBottom: 24 }} title="分类风险汇总">
          <Row gutter={[16, 16]}>
            {Object.entries(categoryStats).map(([category, stats]) => {
              const riskPercent = stats.total > 0 ? (stats.high / stats.total) * 100 : 0
              return (
                <Col span={8} key={category}>
                  <Card
                    size="small"
                    style={{
                      background: riskPercent > 50 ? '#fef2f2' : riskPercent > 20 ? '#fffbeb' : '#f0fdf4',
                      borderColor: riskPercent > 50 ? '#dc2626' : riskPercent > 20 ? '#d97706' : '#059669'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>{category}</Text>
                      <Tag color={riskPercent > 50 ? 'red' : riskPercent > 20 ? 'orange' : 'green'}>
                        {stats.total}条
                      </Tag>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12 }}>
                      <Text type="danger">高: {stats.high}</Text>
                      <Text type="warning" style={{ marginLeft: 8 }}>中: {stats.medium}</Text>
                      <Text type="success" style={{ marginLeft: 8 }}>低: {stats.low}</Text>
                    </div>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </Card>

        {/* 条款列表 */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>条款列表</Title>
          <Table
            dataSource={filteredClauses}
            columns={columns}
            rowKey={(record) => `${record.type}-${record.position}`}
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ padding: 16, background: '#fafafa' }}>
                  <Title level={5}>原文内容</Title>
                  <Paragraph>{record.content}</Paragraph>
                </div>
              )
            }}
          />
        </Card>

        {/* 分类详情 */}
        <Card>
          <Title level={4}>分类详情</Title>
          {Object.entries(
            filteredClauses.reduce((acc, clause) => {
              const category = getClauseCategory(clause)
              if (!acc[category]) acc[category] = []
              acc[category].push(clause)
              return acc
            }, {} as { [key: string]: ContractClause[] })
          ).map(([category, categoryClauses]) => (
            <div key={category} style={{ marginBottom: 24 }}>
              <Title level={5}>{category} ({categoryClauses.length}条)</Title>
              {categoryClauses.map((clause, index) => {
                const config = getRiskLevelConfig(clause.riskLevel)
                return (
                  <div
                    key={index}
                    style={{
                      padding: 12,
                      marginBottom: 8,
                      background: config.bgColor,
                      borderRadius: 8,
                      borderLeft: `4px solid ${config.color}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Tag color={config.color}>{config.text}</Tag>
                      <Text type="secondary">{clause.position}</Text>
                    </div>
                    <Paragraph ellipsis={{ rows: 3 }}>{clause.content}</Paragraph>
                    {clause.riskDescription && (
                      <Text type="danger" style={{ marginTop: 8, display: 'block' }}>
                        风险提示: {clause.riskDescription}
                      </Text>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
