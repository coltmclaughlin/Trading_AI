import {Card, Form, Input, Button, notification} from 'antd';
import md5 from "md5";
import axios from "axios";
import {useRecoilState} from "recoil";
import {useNavigate} from "react-router-dom";
import {addflagState, userInfoState} from "../../recoil_state";
import {BASE_URL} from "../../config";
import {notificationComponent} from "../../functions/notifications";
import React from "react";

const SignIn = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useRecoilState(userInfoState);
    const [flag, setFlagState] = useRecoilState(addflagState);

    const onFinish = (values) => {
        console.log('Received values:', values);
        const hash = md5(values.password);

        const formData = {
            email: values.email,
            password: hash
        }

        try {
            axios
                .post(`${BASE_URL}/api/auth/login`, formData)
                .then((response) => {
                    const token = response.data.token;
                    console.log(response.data.user);
                    setUserInfo(response.data.user);
                    localStorage.setItem("user-token", JSON.stringify(token));
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                    navigate('/activity');
                    setFlagState(!flag)
                })
                .catch((err) => {
                    var errs = err.response.data.message;
                    notificationComponent("error", "Error in Sign In")
                })
        } catch (err) {
            notificationComponent("error", "Error in Sign In")
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '7% 2%',
                backgroundImage: "linear-gradient(rgba(224, 242, 255, 0.4), rgba(236, 242, 243, 0.3)), url('assets/img/background.png')",
                backgroundSize: "100% 100%",
                minHeight: '88vh',
            }}
        >
            <Card title={
                <div style={{position: 'relative'}}>
                    <h3 style={{textAlign: 'center', color: '#2d9ae7', fontSize: '25px'}}>
                        Sign In
                    </h3>
                    <img
                        src={"assets/img/shield.png"}
                        alt={""}
                        width={"60px"}
                        style={{
                            position: 'absolute',
                            top: '-20px',
                            left: '50px',
                            transform: 'translateX(-50%)',
                            opacity: '0.8'
                        }}
                    />
                </div>
            }
                  style={{
                      width: 480,
                      backgroundColor: "rgba(229,245,255,0.62)",
                      boxShadow: "2px 4px 8px rgba(13, 116, 190, 0.65)",
                  }}>
                <Form onFinish={onFinish} layout={"vertical"} size={'large'}>
                    <Form.Item
                        name="email"
                        label={
                            <label
                                style={{fontSize: "18px", fontWeight: "bold", color: "#054776"}}>Email Address:
                            </label>
                        }
                        rules={[
                            {required: true, message: 'Please enter your email'},
                            {type: 'email', message: 'Please enter a valid email'},
                        ]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={
                            <label
                                style={{fontSize: "18px", fontWeight: "bold", color: "#054776"}}>Password:</label>
                        }
                        rules={[{required: true, message: 'Please enter your password'}]}
                    >
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item style={{marginTop: "10%", textAlign: 'center'}}>
                        <Button type="primary" htmlType="submit" style={{backgroundColor: '#0D74BE', width: '60%'}}>
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>);
};

export default SignIn;