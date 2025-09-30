import { Layout, Menu, theme } from 'antd';
import { UserOutlined, DashboardOutlined } from '@ant-design/icons';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import IntervieweeView from './pages/IntervieweeView';
import InterviewerView from './pages/InterviewerView';

const { Header, Content, Footer } = Layout;

const items = [
  {
    label: <Link to="/">Interviewee</Link>,
    key: '/',
    icon: <UserOutlined />,
  },
  {
    label: <Link to="/dashboard">Interviewer</Link>,
    key: '/dashboard',
    icon: <DashboardOutlined />,
  },
];

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={items}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      {}
      <Content 
        style={{ 
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', 
        }}
      >
        <div
          style={{
            background: colorBgContainer,
            padding: 24,
            borderRadius: borderRadiusLG,
            maxWidth: '1200px',
            width: '100%',
          }}
        >
          <Routes>
            <Route path="/" element={<IntervieweeView />} />
            <Route path="/dashboard" element={<InterviewerView />} />
          </Routes>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        AI Interview Assistant ©{new Date().getFullYear()} Created for Swipe
      </Footer>
    </Layout>
  );
};

const Root = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default Root;
