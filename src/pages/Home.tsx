import { Card, Typography, Button, Row, Col } from 'antd'
import { FileTextOutlined, FileSearchOutlined, ArrowRightOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface HomeProps {
  onNavigate: (page: string) => void
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 48 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={1} style={{ color: '#fff', fontSize: 48, marginBottom: 16 }}>
            智能分析系统
          </Title>
          <Paragraph style={{ color: '#fff', fontSize: 18, opacity: 0.9 }}>
            基于AI技术的工程合同与招标文件智能分析平台
          </Paragraph>
        </div>
        
        <Row gutter={16}>
          <Col span={12}>
            <Card
              hoverable
              style={{ 
                height: 350, 
                cursor: 'pointer',
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
              }}
              onClick={() => onNavigate('contract')}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)', 
                  borderRadius: 20, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <FileTextOutlined style={{ fontSize: 40, color: '#fff' }} />
                </div>
                
                <Title level={3} style={{ marginBottom: 16 }}>
                  工程合同风险审查助手
                </Title>
                
                <Paragraph style={{ color: '#666', marginBottom: 24 }}>
                  上传合同文件后，自动分析并提取付款、工期、违约、验收、索赔等关键条款，标记风险并引用原文位置
                </Paragraph>
                
                <Button type="link" style={{ color: '#1677ff' }}>
                  立即使用 <ArrowRightOutlined />
                </Button>
              </div>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card
              hoverable
              style={{ 
                height: 350, 
                cursor: 'pointer',
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
              }}
              onClick={() => onNavigate('bidding')}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
                  borderRadius: 20, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <FileSearchOutlined style={{ fontSize: 40, color: '#fff' }} />
                </div>
                
                <Title level={3} style={{ marginBottom: 16 }}>
                  招标文件智能分析
                </Title>
                
                <Paragraph style={{ color: '#666', marginBottom: 24 }}>
                  上传招标文件后，自动提取资格条件、清单、工期、评分规则和废标风险，生成投标任务分工
                </Paragraph>
                
                <Button type="link" style={{ color: '#059669' }}>
                  立即使用 <ArrowRightOutlined />
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
        
        <Card style={{ marginTop: 32, borderRadius: 16, border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
            功能特点
          </Title>
          
          <Row gutter={16}>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Text style={{ fontSize: 32 }}>🔍</Text>
                <Title level={5} style={{ marginTop: 12 }}>智能提取</Title>
                <Text type="secondary">自动识别关键条款和重要信息</Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Text style={{ fontSize: 32 }}>⚠️</Text>
                <Title level={5} style={{ marginTop: 12 }}>风险预警</Title>
                <Text type="secondary">标记高、中、低风险条款</Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Text style={{ fontSize: 32 }}>📋</Text>
                <Title level={5} style={{ marginTop: 12 }}>原文引用</Title>
                <Text type="secondary">精准定位条款在原文中的位置</Text>
              </div>
            </Col>
            <Col span={6}>
              <div style={{ textAlign: 'center', padding: 16 }}>
                <Text style={{ fontSize: 32 }}>👥</Text>
                <Title level={5} style={{ marginTop: 12 }}>任务分工</Title>
                <Text type="secondary">自动生成投标任务分配方案</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  )
}
