import { useState, useMemo } from 'react'
import { Card, Tag, Typography, Table, Divider, Button, Input, Select, Space, Statistic, Row, Col, Empty } from 'antd'
import { UserOutlined, ClockCircleOutlined, FileTextOutlined, AlertOutlined, CheckCircleOutlined, EditOutlined, SaveOutlined, FilterOutlined, DollarOutlined, StarOutlined } from '@ant-design/icons'
import type { BiddingAnalysisResult, TaskAssignment } from '../types'
import { getRiskLevelConfig, getPriorityConfig } from '../utils/helpers'

interface BiddingResultProps {
  result: BiddingAnalysisResult
}

const { Title, Text, Paragraph } = Typography

// 分类映射配置
const categoryConfig = [
  {
    key: 'qualification',
    label: '资格条件',
    icon: <UserOutlined />,
    color: '#1890ff'
  },
  {
    key: 'duration',
    label: '工期要求',
    icon: <ClockCircleOutlined />,
    color: '#fa8c16'
  },
  {
    key: 'payment',
    label: '付款条件',
    icon: <DollarOutlined />,
    color: '#52c41a'
  },
  {
    key: 'scoring',
    label: '评分规则',
    icon: <StarOutlined />,
    color: '#722ed1'
  },
  {
    key: 'risk',
    label: '废标风险',
    icon: <AlertOutlined />,
    color: '#f5222d'
  }
]

export function BiddingResult({ result }: BiddingResultProps) {
  const {
    fileName,
    qualificationRequirements,
    billOfQuantities,
    duration,
    scoringRules,
    disqualificationRisks,
    taskAssignments
  } = result

  const [editableTasks, setEditableTasks] = useState<TaskAssignment[]>(taskAssignments)
  const [editingRow, setEditingRow] = useState<string | null>(null)

  // 分类筛选
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  // 风险等级筛选（仅对废标风险生效）
  const [riskFilter, setRiskFilter] = useState<string>('all')

  // 统计计算
  const stats = useMemo(() => {
    return {
      qualification: qualificationRequirements.length,
      duration: duration.length,
      scoring: scoringRules.length,
      risk: disqualificationRisks.length
    }
  }, [qualificationRequirements, duration, scoringRules, disqualificationRisks])

  const handleEdit = (taskName: string) => {
    setEditingRow(taskName)
  }

  const handleSave = () => {
    setEditingRow(null)
  }

  const handleTaskChange = (taskName: string, field: keyof TaskAssignment, value: string) => {
    setEditableTasks(prev => prev.map(task =>
      task.taskName === taskName ? { ...task, [field]: value } : task
    ))
  }

  // 资格条件表格列
  const qualificationColumns = [
    { title: '类型', dataIndex: 'title', key: 'title', render: (t: string) => <Tag color="blue">{t}</Tag> },
    { title: '原文位置', dataIndex: 'position', key: 'position', render: (t: string) => <Text type="secondary">{t}</Text> },
    { title: '内容摘要', dataIndex: 'content', key: 'content' }
  ]

  // 评分规则表格列
  const scoringColumns = [
    { title: '评分项', dataIndex: 'category', key: 'category' },
    { title: '满分', dataIndex: 'maxScore', key: 'maxScore', render: (s: number) => `${s}分` },
    { title: '评分标准', dataIndex: 'criteria', key: 'criteria', render: (c: string[]) => c.join('; ') }
  ]

  // 废标风险表格列
  const riskColumns = [
    {
      title: '风险描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      key: 'severity',
      render: (s: string) => {
        const config = getRiskLevelConfig(s)
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    { title: '位置', dataIndex: 'position', key: 'position', render: (t: string) => <Text type="secondary">{t}</Text> }
  ]

  // 任务分工表格列
  const taskColumns = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (p: string, record: TaskAssignment) => {
        if (editingRow === record.taskName) {
          return (
            <Select
              value={p}
              onChange={(value) => handleTaskChange(record.taskName, 'priority', value)}
              style={{ width: 100 }}
              options={[
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' }
              ]}
            />
          )
        }
        const config = getPriorityConfig(p)
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '负责人',
      dataIndex: 'responsible',
      key: 'responsible',
      render: (r: string, record: TaskAssignment) => {
        if (editingRow === record.taskName) {
          return (
            <Input
              value={r}
              onChange={(e) => handleTaskChange(record.taskName, 'responsible', e.target.value)}
              style={{ width: 120 }}
            />
          )
        }
        return <Tag color="green">{r}</Tag>
      }
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (d: string, record: TaskAssignment) => {
        if (editingRow === record.taskName) {
          return (
            <Input
              type="date"
              value={d}
              onChange={(e) => handleTaskChange(record.taskName, 'deadline', e.target.value)}
              style={{ width: 150 }}
            />
          )
        }
        return <Text>{d}</Text>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TaskAssignment) => {
        if (editingRow === record.taskName) {
          return (
            <Button type="primary" size="small" icon={<SaveOutlined />} onClick={handleSave}>
              保存
            </Button>
          )
        }
        return (
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record.taskName)}>
            编辑
          </Button>
        )
      }
    }
  ]

  // 筛选后的废标风险
  const filteredRisks = useMemo(() => {
    if (riskFilter === 'all') return disqualificationRisks
    return disqualificationRisks.filter(r => r.severity === riskFilter)
  }, [disqualificationRisks, riskFilter])

  // 渲染筛选后的内容
  const renderFilteredContent = () => {
    switch (categoryFilter) {
      case 'qualification':
        return (
          <Card style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}><UserOutlined style={{ marginRight: 8, fontSize: 20, color: '#1890ff' }} /><Title level={4}>资格条件</Title></div>
            {qualificationRequirements.length > 0 ? (
              <Table
                dataSource={qualificationRequirements}
                columns={qualificationColumns}
                rowKey={(record) => `${record.type}-${record.position}`}
                pagination={{ pageSize: 10 }}
                expandable={{
                  expandedRowRender: (record) => (
                    <div style={{ padding: 16, background: '#fafafa' }}>
                      <Paragraph>{record.content}</Paragraph>
                    </div>
                  )
                }}
              />
            ) : (
              <Empty description="未提取到资格条件信息" />
            )}
          </Card>
        )

      case 'duration':
        return (
          <Card style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}><ClockCircleOutlined style={{ marginRight: 8, fontSize: 20, color: '#fa8c16' }} /><Title level={4}>工期要求</Title></div>
            {duration.length > 0 ? (
              duration.map((item, index) => (
                <div key={index} style={{ marginBottom: 16, padding: 12, background: '#fff7e6', borderRadius: 8, borderLeft: '4px solid #fa8c16' }}>
                  <Tag color="orange">{item.title}</Tag>
                  <Text type="secondary" style={{ marginLeft: 8 }}>{item.position}</Text>
                  <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{item.content}</Paragraph>
                </div>
              ))
            ) : (
              <Empty description="未提取到工期信息" />
            )}
          </Card>
        )

      case 'payment':
        return (
          <Card style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}><DollarOutlined style={{ marginRight: 8, fontSize: 20, color: '#52c41a' }} /><Title level={4}>付款条件</Title></div>
            <Text type="secondary">以下为与付款相关的资格条件条款：</Text>
            {(() => {
              const paymentRelated = qualificationRequirements.filter(q =>
                q.title?.includes('付款') || q.title?.includes('支付') || q.title?.includes('资金') || q.title?.includes('费用')
              )
              if (paymentRelated.length > 0) {
                return (
                  <Table
                    dataSource={paymentRelated}
                    columns={qualificationColumns}
                    rowKey={(record) => `${record.type}-${record.position}`}
                    pagination={false}
                    style={{ marginTop: 16 }}
                  />
                )
              }
              return <Empty description="未找到付款相关条款" style={{ marginTop: 24 }} />
            })()}
          </Card>
        )

      case 'scoring':
        return (
          <Card style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}><StarOutlined style={{ marginRight: 8, fontSize: 20, color: '#722ed1' }} /><Title level={4}>评分规则</Title></div>
            {scoringRules.length > 0 ? (
              <Table
                dataSource={scoringRules}
                columns={scoringColumns}
                rowKey={(record) => record.category}
                pagination={false}
              />
            ) : (
              <Empty description="未提取到评分规则信息" />
            )}
          </Card>
        )

      case 'risk':
        return (
          <Card style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}><AlertOutlined style={{ marginRight: 8, fontSize: 20, color: '#f5222d' }} /><Title level={4}>废标风险</Title></div>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ marginRight: 8 }}>风险等级筛选:</Text>
              <Select
                value={riskFilter}
                onChange={setRiskFilter}
                style={{ width: 140 }}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'high', label: '高风险' },
                  { value: 'medium', label: '中风险' },
                  { value: 'low', label: '低风险' }
                ]}
              />
            </div>
            {filteredRisks.length > 0 ? (
              <Table
                dataSource={filteredRisks}
                columns={riskColumns}
                rowKey={(_, index) => `${index ?? 0}`}
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', color: '#52c41a', justifyContent: 'center', padding: 24 }}>
                <CheckCircleOutlined style={{ marginRight: 8, fontSize: 20 }} />
                <Text style={{ fontSize: 16 }}>未发现废标风险条款</Text>
              </div>
            )}
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <div style={{ padding: 24, borderBottom: '1px solid #f0f0f0' }}>
        <Title level={2}>招标文件分析报告</Title>
        <Text type="secondary">文件名: {fileName}</Text>
      </div>

      <div style={{ padding: 24 }}>
        {/* 统计概览 */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card><Statistic title="资格条件" value={stats.qualification} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="工期要求" value={stats.duration} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="评分规则" value={stats.scoring} /></Card>
          </Col>
          <Col span={6}>
            <Card><Statistic title="废标风险" value={stats.risk} valueStyle={{ color: stats.risk > 0 ? '#f5222d' : '#52c41a' }} /></Card>
          </Col>
        </Row>

        {/* 分类筛选 */}
        <Card style={{ marginBottom: 24 }} title={<><FilterOutlined /> 按分类查看</>}>
          <Space wrap size="large">
            {categoryConfig.map(cat => (
              <Card
                key={cat.key}
                size="small"
                hoverable
                onClick={() => setCategoryFilter(cat.key)}
                style={{
                  width: 120,
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderColor: categoryFilter === cat.key ? cat.color : '#d9d9d9',
                  background: categoryFilter === cat.key ? `${cat.color}10` : '#fff'
                }}
              >
                <div style={{ fontSize: 24, color: cat.color, marginBottom: 8 }}>{cat.icon}</div>
                <Text strong style={{ color: categoryFilter === cat.key ? cat.color : '#333' }}>{cat.label}</Text>
                <div style={{ marginTop: 4 }}>
                  <Tag color={cat.color}>{stats[cat.key as keyof typeof stats]}条</Tag>
                </div>
              </Card>
            ))}
          </Space>
        </Card>

        {/* 分类内容 */}
        {categoryFilter === 'all' ? (
          <>
            {/* 默认显示全部内容 */}
            <Card style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}><UserOutlined style={{ marginRight: 8, fontSize: 20, color: '#1890ff' }} /><Title level={4}>资格条件</Title></div>
              {qualificationRequirements.length > 0 ? (
                <Table
                  dataSource={qualificationRequirements}
                  columns={qualificationColumns}
                  rowKey={(record) => `${record.type}-${record.position}`}
                  pagination={{ pageSize: 10 }}
                  expandable={{
                    expandedRowRender: (record) => (
                      <div style={{ padding: 16, background: '#fafafa' }}>
                        <Paragraph>{record.content}</Paragraph>
                      </div>
                    )
                  }}
                />
              ) : (
                <Empty description="未提取到资格条件信息" />
              )}
            </Card>

            <Card style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}><ClockCircleOutlined style={{ marginRight: 8, fontSize: 20, color: '#fa8c16' }} /><Title level={4}>工期要求</Title></div>
              {duration.length > 0 ? (
                duration.map((item, index) => (
                  <div key={index} style={{ marginBottom: 16, padding: 12, background: '#fff7e6', borderRadius: 8, borderLeft: '4px solid #fa8c16' }}>
                    <Tag color="orange">{item.title}</Tag>
                    <Text type="secondary" style={{ marginLeft: 8 }}>{item.position}</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>{item.content}</Paragraph>
                  </div>
                ))
              ) : (
                <Empty description="未提取到工期信息" />
              )}
            </Card>

            {billOfQuantities.length > 0 && (
              <Card style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}><FileTextOutlined style={{ marginRight: 8, fontSize: 20, color: '#13c2c2' }} /><Title level={4}>工程量清单</Title></div>
                <Table
                  dataSource={billOfQuantities.slice(0, 20)}
                  columns={Object.keys(billOfQuantities[0] || {}).map(key => ({
                    title: key,
                    dataIndex: key,
                    key: key
                  }))}
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            )}

            <Card style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}><StarOutlined style={{ marginRight: 8, fontSize: 20, color: '#722ed1' }} /><Title level={4}>评分规则</Title></div>
              {scoringRules.length > 0 ? (
                <Table
                  dataSource={scoringRules}
                  columns={scoringColumns}
                  rowKey={(record) => record.category}
                  pagination={false}
                />
              ) : (
                <Empty description="未提取到评分规则信息" />
              )}
            </Card>

            <Card style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}><AlertOutlined style={{ marginRight: 8, fontSize: 20, color: '#f5222d' }} /><Title level={4}>废标风险</Title></div>
              {disqualificationRisks.length > 0 ? (
                <Table
                  dataSource={disqualificationRisks}
                  columns={riskColumns}
                  rowKey={(_, index) => `${index ?? 0}`}
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', color: '#52c41a', justifyContent: 'center', padding: 24 }}>
                  <CheckCircleOutlined style={{ marginRight: 8, fontSize: 20 }} />
                  <Text style={{ fontSize: 16 }}>未发现废标风险条款</Text>
                </div>
              )}
            </Card>
          </>
        ) : (
          renderFilteredContent()
        )}

        <Divider />

        <Card style={{ marginTop: 24, borderColor: '#1890ff', borderWidth: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}><CheckCircleOutlined style={{ marginRight: 8, fontSize: 20, color: '#1890ff' }} /><Title level={4}>投标任务分工 <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal' }}>(点击编辑可修改)</Text></Title></div>
          <Table
            dataSource={editableTasks}
            columns={taskColumns}
            rowKey={(record) => record.taskName}
            pagination={false}
          />
        </Card>
      </div>
    </div>
  )
}
