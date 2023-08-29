import React, {useEffect, useState} from 'react';
import {Table, Tag, Image, Button, Typography} from 'antd';
import {PlusCircleOutlined} from "@ant-design/icons";
import TradeModal from "../../components/TradePlan";
import axios from "axios";
import {useRecoilState, useRecoilValue} from "recoil";
import {filteredPlansSelector, userInfoState} from "../../recoil_state";
import {BASE_URL} from "../../config";

const {Text} = Typography;

const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'America/New_York'
    });
};

const columns = [
    {
        title: <span style={{fontSize: '20px', color: '#0D74BE', fontWeight: 'bold'}}>Start Date</span>,
        dataIndex: 'createdTime',
        key: 'createdTime',
        width: '200px',
        render: (createdTime) => <Text strong
                                       style={{color: '#054776', fontSize: '16px'}}>{formatDate(createdTime)}</Text>,
        sorter: (a, b) => {
            let first = formatDate(a.createdTime);
            let second = formatDate(b.createdTime);
            first.localeCompare(second)
        },
    },
    {
        title: <span style={{fontSize: '20px', color: '#0D74BE', fontWeight: 'bold'}}>End Date</span>,
        dataIndex: 'endedTime',
        key: 'endedTime',
        render: (endedTime) => <Text strong style={{
            color: '#054776',
            fontSize: '16px'
        }}>{endedTime === 'Open Trade' ? endedTime : formatDate(endedTime)}</Text>,
        sorter: (a, b) => {
            let first = a.endedTime === 'Open Trade' ? a.endedTime : formatDate(a.endedTime);
            let second = b.endedTime === 'Open Trade' ? b.endedTime : formatDate(b.endedTime);
            first.localeCompare(second)
        },
    },
    {
        title: <span style={{fontSize: '20px', color: '#0D74BE', fontWeight: 'bold'}}>Plan</span>,
        key: 'plan',
        render: (data) => {
            return (
                <div>
                    <Tag style={{
                        fontSize: '15px',
                        backgroundColor: 'rgba(192,229,255,0.75)',
                        color: '#054776',
                        padding: '5px',
                        border: "none",
                        marginBottom: '2px'
                    }}>Assets : {data.assets}</Tag>
                    <Tag style={{
                        fontSize: '15px',
                        backgroundColor: 'rgba(192,229,255,0.75)',
                        color: '#054776',
                        padding: '5px',
                        border: "none",
                        marginBottom: '2px'
                    }}>Action : {data.action}</Tag>
                    <Tag style={{
                        fontSize: '15px',
                        backgroundColor: 'rgba(192,229,255,0.75)',
                        color: '#054776',
                        padding: '5px',
                        border: "none",
                        marginBottom: '2px'
                    }}>Entry : {data.entry}</Tag>
                    <Tag style={{
                        fontSize: '15px',
                        backgroundColor: 'rgba(192,229,255,0.75)',
                        color: '#054776',
                        padding: '5px',
                        border: "none",
                        marginBottom: '2px'
                    }}>Target : {data.target}</Tag>
                    <Tag style={{
                        fontSize: '15px',
                        backgroundColor: 'rgba(192,229,255,0.75)',
                        color: '#054776',
                        padding: '5px',
                        border: "none",
                        marginBottom: '2px'
                    }}>Stop : {data.stop}</Tag>
                </div>
            )
        }
    },
    {
        title: <span style={{fontSize: '20px', color: '#0D74BE', fontWeight: 'bold'}}>Agree</span>,
        dataIndex: 'agree',
        key: 'agree',
        render: (agree) => {
            return <Text strong style={{color: '#054776', fontSize: '16px'}}>{agree.length}</Text>;
        },
        sorter: (a, b) => a.agree.length - b.agree.length,
    },
    {
        title: <span style={{fontSize: '20px', color: '#0D74BE', fontWeight: 'bold'}}>Disagree</span>,
        dataIndex: 'disagree',
        key: 'disagree',
        render: (disagree) => {
            return <Text strong style={{color: '#054776', fontSize: '16px'}}>{disagree.length}</Text>;
        },
        sorter: (a, b) => a.disagree.length - b.disagree.length,
    },
    {
        title: <span style={{fontSize: '20px', color: '#0D74BE', fontWeight: 'bold'}}>Plan Image</span>,
        dataIndex: 'image',
        key: 'image',
        render: (image) => {
            return (
                <Image src={`${BASE_URL}/api/public/image/${image}`} width={'100%'} height={'50px'}/>
            )
        }
    },
    {
        title: <span style={{fontSize: '20px', color: '#0D74BE', fontWeight: 'bold'}}>Result</span>,
        dataIndex: 'result',
        key: 'result',
        render: (result) => <Text strong style={{color: '#054776', fontSize: '16px'}}>{result}</Text>,
        sorter: (a, b) => a.result.localeCompare(b.result),
    },
];

const History = () => {
    const [userInfo, setUserInfo] = useRecoilState(userInfoState);
    const filteredPlans = useRecoilValue(filteredPlansSelector);
    const [myTradePlans, setMyTrades] = useState([])
    const [trademodalVisible, setTradeModalVisible] = useState(false);

    const getMyData = async () => {
        try {
            axios
                .get(`${BASE_URL}/api/gethistory`, {
                    headers: {
                        userid: userInfo._id,
                    }
                })
                .then((response) => {
                    setMyTrades(response.data.slice().reverse())
                    console.log('success gethistory')
                })
                .catch((err) => {
                    console.log('ERR: getactivity')
                });
        } catch (err) {
            console.log('err');
        }
    }

    useEffect(() => {
        setMyTrades(filteredPlans)
    }, [filteredPlans]);

    const handleUploadPlan = () => {
        setTradeModalVisible(true);
    };

    const handleCancel = () => {
        setTradeModalVisible(false);
    };

    return (
        <div style={{
            padding: '50px 9% 50px 9%',
            backgroundImage: "linear-gradient(rgba(224, 242, 255, 0.4), rgba(236, 242, 243, 0.4)), url('assets/img/home1.png')",
            backgroundSize: "100%",
        }}>
            <div style={{
                width: '100%',
                overflowX: 'auto',
                backgroundColor: "white",
                borderRadius: "5px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.4)"
            }}>
                <Table columns={columns} dataSource={myTradePlans} bordered pagination={{position: ['bottomCenter']}}
                       style={{paddingBottom: '2%'}}/>
            </div>

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
        </div>
    );
}
export default History;