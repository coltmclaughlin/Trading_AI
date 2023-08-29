import {notification} from "antd";
import {CheckCircleOutlined, ExclamationCircleOutlined, WarningOutlined} from "@ant-design/icons";

export const notificationComponent = (result, text) => {
    if (result === "success")
        return notification.success({
            message: 'Success',
            description: text,
            duration: 3, // Duration in seconds, after which the notification will be automatically closed
            icon: <CheckCircleOutlined style={{color: '#52c41a'}}/>, // Custom success icon
            style: {
                backgroundColor: '#f6ffed', // Custom background color
            },
        });

    else if (result === 'warning')
        return notification.warning({
            message: 'Warning',
            description: text,
            duration: 3,
            icon: <WarningOutlined style={{color: '#faad14'}}/>,
            style: {
                backgroundColor: '#fffbe6',
            },
        });

    else
        return notification.error({
            message: 'Error',
            description: text,
            duration: 5, // Duration in seconds, after which the notification will be automatically closed
            icon: <ExclamationCircleOutlined style={{color: '#ff4d4f'}}/>, // Custom error icon
            style: {
                backgroundColor: '#fff1f0', // Custom background color
            },
        });
}