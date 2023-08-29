import React from 'react';
import {Layout} from 'antd';
import {useRecoilValue} from "recoil";
import {isConnectedState} from "../../recoil_state";

const {Footer} = Layout;

const FooterComponent = () => {
    return (
        <Footer style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: "rgba(131,204,250,0.57)",
            fontSize: '20px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.5)',
        }}>
            <div>
                <p style={{fontSize: '24px', fontWeight: 'bold'}}>
                    Copyright © 2023 Created by TradePlans.AI. All rights reserved.
                </p>
                <p style={{textAlign: 'left'}}>
                    <span style={{fontWeight: 'bold', color: '#ff5900'}}>Risk Warning:</span> This tool and its
                    content
                    should not be construed as financial advice. Signals and readings displayed by the tool are our
                    opinions only and are meant only to be educational. By viewing this tool, you agree that
                    TradePlans.ai is not liable for any gains or losses you may incur from the financial decisions
                    you
                    make. Data displayed is not guaranteed to be 100% accurate or real-time, and may be subject to
                    latency or errors. Please consult a licensed financial advisor prior to making any investment
                    decisions. Trading is not appropriate for everyone. Past performance is not indicative of future
                    results.
                </p>
            </div>
        </Footer>
    );
}

export default FooterComponent;