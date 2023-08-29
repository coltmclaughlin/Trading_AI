import React, {useState} from "react";
import {Modal, Form, Input, Button, Select, Radio, Row, Col, InputNumber} from "antd";
import {assets} from "../../assetsData";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {addflagState, isConnectedState, userInfoState} from "../../recoil_state";
import sendPlan from "../../functions/submitPlan";
import './index.css';
import SignupModal from "../SignUp";

const {Option, OptGroup} = Select;

const TradeModal = ({visible, onCancel}) => {
    const [userInfo, setUserInfo] = useRecoilState(userInfoState);
    const [flag, setFlagState] = useRecoilState(addflagState);
    const [form] = Form.useForm();
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedValue, setSelectedValue] = useState('stock');
    const isConnected = useRecoilValue(isConnectedState);
    const [signupmodalVisible, setSignupModalVisible] = useState(false);
    const [modalValues, setModalValues] = useState({});

    const handleRadioChange = (e) => {
        setSelectedValue(e.target.value);
    };

    const onFinish = (values) => {
        sendPlan(values, selectedFile, userInfo, setFlagState, flag);
        form.resetFields();
        setSelectedValue('stock');
        onCancel();
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleCancel = () => {
        setSignupModalVisible(false);
    };

    return (<Modal
        open={visible}
        title={
            <div style={{position: 'relative', borderBottom: '1px solid #ccc', backgroundColor: '#F4FBFF'}}>
                <h3 style={{
                    textAlign: 'center',
                    fontSize: "21px",
                    color: '#054776',
                    fontWeight: 'bold',
                }}>Get Instant Feedback on your Trade Plan!
                </h3>
                <img
                    src={"assets/img/shield.png"}
                    alt={""}
                    width={"80px"}
                    style={{
                        position: 'absolute',
                        top: '-55px',
                        left: '-10px',
                        transform: 'translateX(-50%)',
                        opacity: '0.9'
                    }}
                />
            </div>
        }
        wrapClassName="custom-modal-content"
        onCancel={onCancel}
        footer={null}
    >
        <Form form={form} layout={"vertical"} size={"large"} onFinish={onFinish}>
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

        <SignupModal visible={signupmodalVisible} onCancel={handleCancel} formData={modalValues}
                     selectedFile={selectedFile}/>
    </Modal>);
};

export default TradeModal;