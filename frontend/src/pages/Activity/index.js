import React, {useState, useEffect} from "react";
import {Card, List, Avatar, Typography, Image, Button, Tag, Space, Tooltip, Badge, Select, Col, Row} from 'antd';
import {PlusOutlined, LikeOutlined, DislikeOutlined, PlusCircleOutlined} from '@ant-design/icons';
import axios from "axios";
import TradeModal from "../../components/TradePlan";
import {BASE_URL} from "../../config";
import {useRecoilState} from "recoil";
import {addflagState, allPlansState, userInfoState} from "../../recoil_state";
import {notificationComponent} from "../../functions/notifications";
import useBreakpoint from 'antd/es/grid/hooks/useBreakpoint';

const {Text} = Typography;
const {Option} = Select;

const fieldDict = {"FOREX": "Forex", "undefined": "Forex", "US": "Stock", "CC": "Crypto", "INDX": "Stock"}
const assetDict = {"SPY": "S&P 500", "NDX": "NASDAQ", "N225": "NIEKKEI"}

const Activity = () => {
    const [allPlans, setAllPlans] = useRecoilState(allPlansState);
    const [flag, setFlagState] = useRecoilState(addflagState);
    const [userInfo, setUserInfo] = useRecoilState(userInfoState);
    const [trademodalVisible, setTradeModalVisible] = useState(false);
    const breakpoints = useBreakpoint();

    const [pageSize, setPageSize] = useState(10);

    const getAllData = async () => {
        try {
            axios
                .get(`${BASE_URL}/api/getactivity`)
                .then((response) => {
                    setAllPlans(response.data.slice().reverse());
                })
                .catch((err) => {
                    notificationComponent("error", "Error in Getting Data")
                });
        } catch (err) {
            notificationComponent("error", "Error in Getting Data")
        }
    }

    useEffect(() => {
        getAllData();

        const intervalId = setInterval(getAllData, 12000);

        return () => {
            clearInterval(intervalId);
        }
    }, [flag]);


    const handleSort = (value) => {
        if (value === 'createdTime') setAllPlans([...allPlans].sort((a, b) => b[value].localeCompare(a[value])));
        else if (value === 'action') setAllPlans([...allPlans].sort((a, b) => a[value].localeCompare(b[value])));
        else setAllPlans([...allPlans].sort((a, b) => (splitAsset(a[value])[0] + splitAsset(a[value])[1]).localeCompare((splitAsset(b[value])[0] + splitAsset(b[value])[1]))));
    }

    const handleUploadPlan = () => {
        setTradeModalVisible(true);
    };

    const handleCancel = () => {
        setTradeModalVisible(false);
    };

    const handlePageSizeChange = (current, newPageSize) => {
        setPageSize(newPageSize);
    };

    const capitalizeFirstLetter = (text) => {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    const likechange = (item) => {
        let id = allPlans.indexOf(item)
        let agree = allPlans[id].agree;
        let disagree = allPlans[id].disagree;
        const userid = userInfo._id;
        if (!agree.includes(userid) && !disagree.includes(userid)) {
            axios.get(`${BASE_URL}/api/like/${true}/${userid}/${item._id}`).then((res) => {

            }).catch((err) => {
                // notificationComponent('error', 'Error in Agreement! Plz try again!')
            });
        } else {
            if (agree.includes(userid)) notificationComponent('warning', 'You already agreed!');
            else notificationComponent('warning', 'You already disagreed!');
        }
        setFlagState(!flag);
    }

    const unLikechange = (item) => {
        let id = allPlans.indexOf(item)
        let agree = allPlans[id].agree;
        let disagree = allPlans[id].disagree;
        const userid = userInfo._id;
        if (!agree.includes(userid) && !disagree.includes(userid)) {
            axios.get(`${BASE_URL}/api/like/${false}/${userid}/${item._id}`).then((res) => {

            }).catch((err) => {
                // notificationComponent('error', 'Error in Disagreement! Plz try again!')
            });
        } else {
            if (agree.includes(userid)) notificationComponent('warning', 'You already agreed!');
            else notificationComponent('warning', 'You already disagreed!');
        }
        setFlagState(!flag);
    }

    const splitAsset = (text) => {
        const splitText = text.split('.');
        const asset = assetDict[splitText[0]] === undefined ? splitText[0] : assetDict[splitText[0]]
        return [fieldDict[splitText[1]], asset]
    }

    return (
        <div style={{
            minHeight: '88vh',
            backgroundImage: "linear-gradient(rgba(224, 242, 255, 0.4), rgba(236, 242, 243, 0.4)), url('assets/img/home1.png')",
            backgroundSize: "100%",
            padding: "3% 0"
        }}>
            <Card bordered={true}
                  style={{
                      borderColor: 'rgba(182,217,252,0.65)',
                      backgroundColor: '#F9FCFF',
                      width: '80%',
                      marginLeft: '10%',
                      marginRight: '10%',
                      padding: '2% 2%',
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.4)",
                  }}>
                <div style={{marginBottom: '20px'}}>
                    <span style={{width: '100%', color: '#0D74BE', fontSize: '18px', fontWeight: 'bold'}}>Sort BY</span>
                    <Row gutter={16} style={{marginTop: '10px'}}>
                        <Col xs={20} md={12}>
                            <Select showArrow style={{width: '120px'}} size="large" defaultValue={"createdTime"}
                                    onChange={handleSort}>
                                <Option key="assets" value="assets"> Assets </Option>
                                <Option key="createdTime" value="createdTime"> Date </Option>
                                <Option key="action" value="action"> Bias </Option>
                            </Select>
                        </Col>
                        <Col xs={4} md={12}>
                            <Tooltip title="Post Your Plan!">
                                <Button
                                    size="large"
                                    style={{
                                        float: 'right',
                                        backgroundColor: '#0D74BE',
                                        color: 'white',
                                        fontWeight: 'bold',
                                    }}
                                    onClick={handleUploadPlan}
                                    icon={breakpoints.md ? null : <PlusCircleOutlined/>}
                                >
                                    {breakpoints.md ? <Text strong style={{
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '17px'
                                    }}><PlusCircleOutlined/> New Trade Plan</Text> : null}
                                </Button>
                            </Tooltip>
                        </Col>
                    </Row>
                </div>

                <List
                    itemLayout="vertical"
                    dataSource={allPlans}
                    pagination={{
                        pageSize,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: [3, 5, 10, 20],
                        onShowSizeChange: handlePageSizeChange,
                    }}
                    style={{
                        backgroundColor: 'rgba(213,237,255,0.45)',
                        borderColor: '#51c2c2',
                        borderRadius: '7px',
                        padding: '1% 5px'
                    }}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                title={
                                    <div style={{paddingRight: '10px'}}>
                                        <Text strong style={{
                                            fontSize: 24, padding: "2px", color: '#054776', textAlign: 'center'
                                        }}>
                                            {capitalizeFirstLetter(item.action)}ing {splitAsset(item.assets)[0]}: {splitAsset(item.assets)[1]}
                                        </Text>

                                        <Text type="secondary" style={{
                                            fontSize: 16,
                                            float: 'right',
                                            color: 'rgba(6,78,129,0.65)',
                                            backgroundColor: 'rgba(192,229,255,0.3)',
                                            padding: "2px 5px",
                                            borderRadius: '5px'
                                        }}>
                                            {new Date(item.createdTime).toLocaleString('en-US', {
                                                month: '2-digit',
                                                day: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                timeZone: 'America/New_York'
                                            })}
                                        </Text>
                                    </div>
                                }
                                style={{marginLeft: "3%"}}
                            />

                            <div style={{margin: "0 0 1% 3%"}}>
                                <Tag style={{
                                    fontSize: '15px',
                                    backgroundColor: 'rgba(192,229,255,0.75)',
                                    color: '#054776',
                                    fontWeight: 'bold',
                                    padding: '5px',
                                    border: "none",
                                    marginBottom: '2px'
                                }}>Assets : {splitAsset(item.assets)[1]}</Tag>
                                <Tag style={{
                                    fontSize: '15px',
                                    backgroundColor: 'rgba(192,229,255,0.75)',
                                    color: '#054776',
                                    fontWeight: 'bold',
                                    padding: '5px',
                                    border: "none",
                                    marginBottom: '2px'
                                }}>Action : {item.action}</Tag>
                                <Tag style={{
                                    fontSize: '15px',
                                    backgroundColor: 'rgba(192,229,255,0.75)',
                                    color: '#054776',
                                    fontWeight: 'bold',
                                    padding: '5px',
                                    border: "none",
                                    marginBottom: '2px'
                                }}>Entry : {item.entry}</Tag>
                                <Tag style={{
                                    fontSize: '15px',
                                    backgroundColor: 'rgba(192,229,255,0.75)',
                                    color: '#054776',
                                    fontWeight: 'bold',
                                    padding: '5px',
                                    border: "none",
                                    marginBottom: '2px'
                                }}>Target : {item.target}</Tag>
                                <Tag style={{
                                    fontSize: '15px',
                                    backgroundColor: 'rgba(192,229,255,0.75)',
                                    color: '#054776',
                                    fontWeight: 'bold',
                                    padding: '5px',
                                    border: "none",
                                    marginBottom: '2px'
                                }}>Stop : {item.stop}</Tag>
                            </div>

                            <Image
                                width={'100%'}
                                height={300}
                                alt="logo"
                                src={`${BASE_URL}/api/public/image/${item.image}`}
                                style={{
                                    objectFit: 'cover',
                                    objectPosition: '0px -20px',
                                    width: '94%',
                                    marginLeft: '3%',
                                    marginRight: '3%',
                                    padding: '5px'
                                }}
                            />

                            <Space style={{margin: "1% 2%"}}>
                                <Button type="link" icon={<LikeOutlined style={{
                                    backgroundColor: '#AAFEA4',
                                    color: '#1B9513',
                                    padding: '7px',
                                    marginRight: '5px',
                                    borderRadius: '6px'
                                }}/>} size="large" style={{fontSize: 20, color: '#08DB37'}}
                                        onClick={() => likechange(item)}>
                                    {item.agree.length}
                                </Button>
                                <Button type="link" icon={<DislikeOutlined style={{
                                    backgroundColor: '#FD9394',
                                    color: '#B70102',
                                    padding: '7px',
                                    marginRight: '5px',
                                    borderRadius: '6px'
                                }}/>} size="large" style={{fontSize: 20, color: '#f54041',}}
                                        onClick={() => unLikechange(item)}>
                                    {item.disagree.length}
                                </Button>
                            </Space>
                        </List.Item>)}
                />
            </Card>

            <div style={{position: 'fixed', bottom: '11%', right: '5%', zIndex: '9999'}}>
                <Button type="primary" size="large" onClick={handleUploadPlan} style={{
                    width: '55px',
                    height: '55px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#0D74BE',
                    color: 'white'
                }} icon={<PlusCircleOutlined style={{
                    fontSize: '24px',
                }}/>}/>
            </div>

            <TradeModal visible={trademodalVisible} onCancel={handleCancel}/>
        </div>);
};

export default Activity;