import { useState } from 'react'
import { Home } from './pages/Home'
import { ContractReview } from './pages/ContractReview'
import { BiddingAnalysis } from './pages/BiddingAnalysis'
import { Layout, Menu } from 'antd'
import { HomeOutlined, FileTextOutlined, FileSearchOutlined } from '@ant-design/icons'

const { Header, Content } = Layout

type PageType = 'home' | 'contract' | 'bidding'

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('home')
  
  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType)
  }
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />
      case 'contract':
        return <ContractReview />
      case 'bidding':
        return <BiddingAnalysis />
      default:
        return <Home onNavigate={handleNavigate} />
    }
  }
  
  const showHeader = currentPage !== 'home'
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {showHeader && (
        <Header style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#1677ff' }}>
              智能分析系统
            </div>
            <Menu
              theme="light"
              mode="horizontal"
              selectedKeys={[currentPage]}
              items={[
                { key: 'home', icon: <HomeOutlined />, label: '首页', onClick: () => handleNavigate('home') },
                { key: 'contract', icon: <FileTextOutlined />, label: '合同审查', onClick: () => handleNavigate('contract') },
                { key: 'bidding', icon: <FileSearchOutlined />, label: '招标文件分析', onClick: () => handleNavigate('bidding') }
              ]}
            />
          </div>
        </Header>
      )}
      <Content>
        {renderPage()}
      </Content>
    </Layout>
  )
}

export default App
