import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Layout, Menu, Row, Col, Avatar} from 'antd';
import {
    LogoutOutlined,
    HomeOutlined,
    UserOutlined,
    HistoryOutlined,
    UserAddOutlined,
    TeamOutlined,
    LockOutlined,
    LoginOutlined,
    UnlockOutlined
} from '@ant-design/icons';
import {useRecoilState, useRecoilValue} from "recoil";
import {isConnectedState, userInfoState} from "../../recoil_state";

const {Header} = Layout;

const headerItems = [
    {key: "1", label: 'Activity', to: '/activity', icon: <TeamOutlined style={{fontSize: '20px'}}/>},
    {key: "2", label: 'History', to: '/history', icon: <HistoryOutlined style={{fontSize: '20px'}}/>},];

const pathTokey = {"/": "0", "/activity": "1", "/history": "2", "/signin": "1"}

const HeaderComponent = () => {
    const isConnected = useRecoilValue(isConnectedState);
    const [userInfo, setUserInfo] = useRecoilState(userInfoState);
    const [currentPage, setCurrentPage] = useState(pathTokey[window.location.pathname] | "0");


    const checkLogin = () => {
        console.log(userInfo);
    }

    const handleMenuClick = (key) => {
        setCurrentPage(key);
    };

    const handleLogout = () => {
        setUserInfo({});
        localStorage.clear();
    }

    useEffect(() => {
        setCurrentPage(pathTokey[window.location.pathname]);
        // checkLogin();
    }, [window.location.pathname]);

    return (
        <Header style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: "#e0f2ff",
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.5)',
            zIndex: "10"
        }}>
            <div className="demo-logo"/>
            <Row align="middle" style={{width: '100%'}}>
                <Col xs={6} sm={14} md={18}>
                    <Menu mode="horizontal" defaultSelectedKeys={[currentPage]}
                          style={{fontSize: '20px', backgroundColor: "#e0f2ff", height: "80%"}}
                          selectedKeys={[currentPage]}>
                        {isConnected ?
                            headerItems.map(item => (
                                <Menu.Item key={item.key} icon={item.icon} onClick={() => handleMenuClick(item.key)}>
                                    <Link style={{textDecoration: 'none', fontWeight: 'bold'}}
                                          to={item.to}>{item.label}</Link>
                                </Menu.Item>))
                            :
                            <Menu.Item key={"0"}
                                // icon={<HomeOutlined style={{fontSize: '20px'}}/>}
                                       onClick={() => handleMenuClick("0")}>
                                <Link to={"/"}
                                      style={{
                                          textDecoration: 'none',
                                          fontWeight: 'bold',
                                          color: "#054776"
                                      }}>{"TradePlans.AI"}</Link>
                            </Menu.Item>
                        }
                    </Menu>
                </Col>

                <Col xs={18} sm={10} md={6}>
                    <div style={{float: 'right'}}>
                        {isConnected ? <>
                                <Link to={'/profile'}>
                                    <Avatar size={50} icon={<UserOutlined/>} style={{backgroundColor: '#9ab4b2'}}/>
                                </Link>
                                <Avatar
                                    size={50}
                                    icon={<LogoutOutlined/>}
                                    style={{backgroundColor: 'rgba(245,83,104,0.6)', marginLeft: '1rem', cursor: 'pointer'}}
                                    onClick={handleLogout}
                                />
                            </> :
                            <Link to={'/signin'}>
                                <span style={{fontSize: "20px", fontWeight: "bold", backgroundColor: '#0D74BE', color: 'white', borderRadius: '5px', padding: '10px 14px'}}>Log In</span>
                            </Link>}
                    </div>
                </Col>
            </Row>
        </Header>);
}

export default HeaderComponent;