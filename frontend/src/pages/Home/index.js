import React, {useState} from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {Row, Col, Form, Select, Radio, InputNumber, Button, Card, Rate} from "antd";
import ReactPlayer from "react-player";
import {Link, useNavigate} from 'react-router-dom';
import SignupModal from "../../components/SignUp";
import {userInfoState, isConnectedState, addflagState} from "../../recoil_state";
import {assets} from '../../assetsData';

import sendPlan from "../../functions/submitPlan";

const {Option} = Select;

const HomePage = () => {
    const [userInfo, setUserInfo] = useRecoilState(userInfoState);
    const [flag, setFlagState] = useRecoilState(addflagState);
    const isConnected = useRecoilValue(isConnectedState);
    const [signupmodalVisible, setSignupModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [modalValues, setModalValues] = useState({});
    const [selectedValue, setSelectedValue] = useState('stock');
    const navigate = useNavigate();

    const [form] = Form.useForm();

    const handleCancel = () => {
        setSignupModalVisible(false);
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleRadioChange = (e) => {
        setSelectedValue(e.target.value);
    };

    const handleSubmitPlan = (values) => {
        if (isConnected) {
            form.resetFields();
            sendPlan(values, selectedFile, userInfo, setFlagState, flag);
            navigate('/activity');
        } else {
            setSignupModalVisible(true);
            setModalValues(values);
        }
    }

    return (
        <div style={{justifyContent: "center", alignItems: "center"}}>
            <Row gutter={8} justify="center" align="middle"
                 style={{
                     backgroundImage: "linear-gradient(rgba(224, 242, 255, 0.4), rgba(236, 242, 243, 0.3)), url('assets/img/home1.png')",
                     backgroundSize: "100%",
                     padding: "5%"
                 }}>
                <Col span={16} xs={24} sm={24} md={16} lg={16}
                     style={{
                         display: 'flex',
                         justifyContent: 'center',
                         alignItems: 'center',
                         backgroundImage: "url('assets/img/home_com.png')",
                         backgroundSize: "100% 100%",
                         padding: '4% 13%',
                         margin: '5% 0',
                         opacity: '0.9'
                     }}>
                    <ReactPlayer
                        url="https://vimeo.com/848727646"
                        controls={true}
                        playing={true}
                        style={{width: '100%', height: '100%'}}
                    />
                </Col>

                <Col span={8} xs={24} sm={24} md={8} lg={8}>
                    <Card style={{
                        backgroundColor: "rgba(244, 251, 255, 0.8)",
                        boxShadow: "0 2px 8px rgba(13, 116, 190, 0.65)",
                        marginTop: '2%'
                    }}>
                        <div style={{position: 'relative', borderBottom: '1px solid #ccc', margin: '1%'}}>
                            <h3 style={{textAlign: 'center', color: '#2d9ae7', fontSize: '22px'}}>
                                Get Instant Feedback on your Trade Plan!
                            </h3>
                            <img
                                src={"assets/img/shield.png"}
                                alt={""}
                                width={"80px"}
                                style={{
                                    position: 'absolute',
                                    top: '-80px',
                                    left: '-1%',
                                    transform: 'translateX(-50%)',
                                    opacity: '0.8'
                                }}
                            />
                        </div>

                        <Form form={form} layout={"vertical"} size={"large"} onFinish={handleSubmitPlan}>
                            <Form.Item
                                name="field"
                                label={
                                    <label
                                        style={{fontSize: "20px", fontWeight: "bold", color: "#054776"}}>Assets:</label>
                                }
                            >
                                <Radio.Group onChange={handleRadioChange} value={selectedValue} defaultValue={'stock'}>
                                    <Radio value="stock" style={{color: "red"}}>Stock</Radio>
                                    <Radio value="forex" style={{color: "violet"}}>Forex</Radio>
                                    {/*<Radio value="futures" style={{color: "green"}}>Futures</Radio>*/}
                                    <Radio value="crypto" style={{color: "blue"}}>Crypto</Radio>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item
                                name={"assets"}
                                rules={[{required: true, message: 'Please select an asset!'}]}
                            >
                                <Select showSearch style={{width: "100%"}} showArrow>
                                    {assets[selectedValue].map((option) => (
                                        <Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Option>))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="action"
                                label={<label
                                    style={{fontSize: "20px", fontWeight: "bold", color: "#054776"}}>Action:</label>}
                                rules={[{required: true, message: "Please select a radio option"}]}
                            >
                                <Radio.Group optionType={"button"} size={"large"}>
                                    <Radio value="buy" style={{
                                        color: "rgb(6,143,6)",
                                        fontWeight: 'bold',
                                        backgroundColor: "rgba(145,246,201,0.28)"
                                    }}>Buy</Radio>
                                    <Radio value="sell" style={{
                                        color: "rgb(243,9,9)",
                                        fontWeight: 'bold',
                                        backgroundColor: "rgba(241,163,168,0.21)"
                                    }}>Sell</Radio>
                                </Radio.Group>
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        name="entry"
                                        label={<label style={{
                                            fontSize: "18px",
                                            fontWeight: "bold",
                                            color: "#054776"
                                        }}>Entry:</label>}
                                        rules={[{required: true, message: "Please enter a value"}]}
                                    >
                                        <InputNumber style={{width: "100%"}}/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="target"
                                        label={<label style={{
                                            fontSize: "18px",
                                            fontWeight: "bold",
                                            color: "#054776"
                                        }}>Target:</label>}
                                        rules={[{required: true, message: "Please enter a value"}]}
                                    >
                                        <InputNumber style={{width: "100%"}}/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        name="stop"
                                        label={<label style={{
                                            fontSize: "18px",
                                            fontWeight: "bold",
                                            color: "#054776"
                                        }}>Stop:</label>}
                                        rules={[{required: true, message: "Please enter a value"}]}
                                    >
                                        <InputNumber style={{width: "100%"}}/>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="image"
                                label={<label style={{fontSize: "20px", fontWeight: "bold", color: "#054776"}}>Plan
                                    Image:</label>}
                                rules={[{required: true, message: "Please upload an image"}]}
                            >
                                <div style={{display: "flex", justifyContent: "left", alignItems: "left"}}>
                                    <input
                                        type="file"
                                        id="file"
                                        name="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{
                                            marginTop: "8px",
                                            padding: "8px",
                                            border: "none",
                                            background: "rgba(120,197,248,0.34)",
                                            borderRadius: "4px",
                                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                                        }}
                                    />
                                </div>
                            </Form.Item>

                            <div style={{textAlign: "center", marginTop: "20px"}}>
                                <Button type="primary" htmlType="submit"
                                        style={{
                                            width: "60%",
                                            backgroundColor: '#0D74BE',
                                            fontSize: '20px',
                                            height: '50px'
                                        }}>
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col span={12} xs={24} sm={24} md={12} lg={12}>
                    <div style={{justifyContent: "center", alignItems: "center", height: "100%", padding: "5%"}}>
                        <img
                            src="assets/img/home2.png"
                            alt="Your Image"
                            style={{width: "100%"}}
                        />
                    </div>
                </Col>
                <Col span={12} xs={24} sm={24} md={12} lg={12}
                     style={{backgroundImage: "url('assets/img/home3.png')", backgroundSize: "100%"}}>
                    <div style={{padding: "20% 25% 10% 15%"}}>
                        <h1 style={{color: "#054776", fontSize: "35px"}}>About TradePlans.AI</h1>
                        <p style={{
                            fontSize: "22px",
                            textAlign: "justify",
                            fontWeight: 'bold',
                            marginBottom: '50px',
                            color: '#222',
                        }}>
                            TradePlans.AI is a tool for traders that provides signals and readings to help with trading
                            decisions. The tool is meant to be educational and the signals and readings displayed are
                            the opinions of TradePlans.AI only. TradePlans.AI also has a feature where traders can post
                            a trading idea and receive feedback in several seconds. The tool leverages artificial
                            intelligence to automate research, analyze data, and generate trade ideas, aiming to enhance
                            trading efficiency, accuracy, and profitability.
                        </p>
                        {/*<Link to={'/aboutus'}>*/}
                        {/*    <span style={{*/}
                        {/*        fontSize: "20px",*/}
                        {/*        fontWeight: "bold",*/}
                        {/*        backgroundColor: 'rgb(80,168,232)',*/}
                        {/*        color: 'white',*/}
                        {/*        borderRadius: '5px',*/}
                        {/*        padding: '10px 30px'*/}
                        {/*    }}>About Us</span>*/}
                        {/*</Link>*/}
                    </div>
                </Col>
            </Row>

            <Row style={{
                backgroundImage: `url('assets/img/home4.png')`,
                backgroundSize: "cover",
                padding: "5%"
            }}>
                <div style={{width: "100%", textAlign: "center"}}>
                    <h1 style={{fontSize: "35px", color: "#054776"}}>Traders' Feedback</h1>
                    <h3>70,000+ traders use Altrady to manage their investments.</h3>
                    <div style={{justifyContent: "center", alignItems: "center", marginTop: '20px'}}>
                        <Row gutter={[8, 8]}>
                            <Col span={6} xs={24} sm={24} md={6} lg={6}>
                                <Card title={<h3>Jun Hao</h3>} style={{
                                    backgroundColor: "rgba(237,245,250,0.59)",
                                    boxShadow: "0 2px 8px rgba(13, 116, 190, 0.5)"
                                }}>
                                    <Rate disabled defaultValue={5}/>
                                    <p style={{textAlign: "left", fontSize: "15px", fontWeight: "bold"}}>
                                        TradePlans.AI has been an invaluable tool in my trading journey. The instant
                                        feedback and analysis it provides on my trade plans have greatly enhanced my
                                        decision-making process.
                                    </p>
                                </Card>
                            </Col>
                            <Col span={6} xs={24} sm={24} md={6} lg={6}>
                                <Card title={<h3>Jun Hao</h3>} style={{
                                    backgroundColor: "rgba(237,245,250,0.59)",
                                    boxShadow: "0 2px 8px rgba(13, 116, 190, 0.5)"
                                }}>
                                    <Rate disabled defaultValue={5}/>
                                    <p style={{textAlign: "left", fontSize: "15px", fontWeight: "bold"}}>
                                        TradePlans.AI has been an invaluable tool in my trading journey. The instant
                                        feedback and analysis it provides on my trade plans have greatly enhanced my
                                        decision-making process.
                                    </p>
                                </Card>
                            </Col>
                            <Col span={6} xs={24} sm={24} md={6} lg={6}>
                                <Card title={<h3>Jun Hao</h3>} style={{
                                    backgroundColor: "rgba(237,245,250,0.59)",
                                    boxShadow: "0 2px 8px rgba(13, 116, 190, 0.5)"
                                }}>
                                    <Rate disabled defaultValue={5}/>
                                    <p style={{textAlign: "left", fontSize: "15px", fontWeight: "bold"}}>
                                        TradePlans.AI has been an invaluable tool in my trading journey. The instant
                                        feedback and analysis it provides on my trade plans have greatly enhanced my
                                        decision-making process.
                                    </p>
                                </Card>
                            </Col>
                            <Col span={6} xs={24} sm={24} md={6} lg={6}>
                                <Card title={<h3>Jun Hao</h3>} style={{
                                    backgroundColor: "rgba(237,245,250,0.59)",
                                    boxShadow: "0 2px 8px rgba(13, 116, 190, 0.5)"
                                }}>
                                    <Rate disabled defaultValue={5}/>
                                    <p style={{textAlign: "left", fontSize: "15px", fontWeight: "bold"}}>
                                        TradePlans.AI has been an invaluable tool in my trading journey. The instant
                                        feedback and analysis it provides on my trade plans have greatly enhanced my
                                        decision-making process.
                                    </p>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Row>

            <SignupModal visible={signupmodalVisible} onCancel={handleCancel} formData={modalValues}
                         selectedFile={selectedFile}/>
        </div>
    )
}

export default HomePage;