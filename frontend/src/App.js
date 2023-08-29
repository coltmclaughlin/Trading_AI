import React, {useEffect} from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import {useRecoilState, useRecoilValue} from "recoil";
import {Layout} from 'antd';
import HeaderComponent from "./components/Header";
import FooterComponent from "./components/Footer";
import HomePage from "./pages/Home";
import Activity from "./pages/Activity";
import History from "./pages/History";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import {isConnectedState, userInfoState} from "./recoil_state";
import ProtectedRoute from "./functions/ProtectedRoute";
import ForceRedirect from "./functions/ForceRedirect";

const {Content, Sider} = Layout;

const App = () => {
    const [userInfo, setUserInfo] = useRecoilState(userInfoState);
    const isConnected = useRecoilValue(isConnectedState);

    const checkUserToken = () => {
        if (typeof window !== "undefined") {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user) {
                setUserInfo(user);
            }
        }
    };

    useEffect(() => {
        checkUserToken();
    }, [isConnected]);

    return (
        <BrowserRouter>
            <Layout>
                <HeaderComponent/>
                <Layout style={{
                    minHeight: '88vh',
                }}>
                    <Content style={{backgroundColor: "white"}}>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <ForceRedirect isConnected={isConnected}>
                                        <HomePage/>
                                    </ForceRedirect>
                                }
                            />
                            <Route
                                path="/activity"
                                element={<Activity/>}/>

                            <Route
                                path="/history"
                                element={<ProtectedRoute isConnected={isConnected}>
                                    <History/>
                                </ProtectedRoute>}
                            />
                            <Route
                                path="/profile"
                                element={<ProtectedRoute isConnected={isConnected}>
                                    <Profile/>
                                </ProtectedRoute>}
                            />
                            <Route
                                path="/signin"
                                element={
                                    <ForceRedirect isConnected={isConnected}>
                                        <SignIn/>
                                    </ForceRedirect>
                                }
                            />
                            <Route
                                path="/*"
                                element={<NotFound/>}
                            />
                        </Routes>
                    </Content>
                </Layout>
                <FooterComponent/>
            </Layout>
        </BrowserRouter>);
}

export default App;
