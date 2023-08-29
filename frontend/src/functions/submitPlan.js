import axios from "axios";
import {BASE_URL} from "../config";
import {notificationComponent} from "./notifications";


const sendPlan = (values, selectedFile, userInfo, setFlagState, flag) => {
    const userId = userInfo._id;
    const userEmail = userInfo.email;
    const firstName = userInfo.firstName;
    const lastName = userInfo.lastName;


    const newFormData = {
        ...values,
        firstName: firstName,
        lastName: lastName,
        name_id: userId,
        agree: [],
        disagree: [],
        image: selectedFile,
        endedTime: "Open Trade",
        result: 'Waiting'
    }

    try {
        axios
            .post(`${BASE_URL}/api/addactivity`, newFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then((response) => {
                setFlagState(!flag);
                notificationComponent("success", "Your plan has been posted successfully!")
            })
            .catch((err) => {
                console.log(err);
                notificationComponent("error", "Error in Uploading your plan!")
            })

        const chartData = {
            assets: values['assets'],
            action: values['action'],
            user_id: userId,
            user_email: userEmail,
            user_name: firstName
        }

        console.log("chartData", chartData);

        axios
            .post(`${BASE_URL}/chart/genchart/`, chartData)
            .then((response) => {
                notificationComponent("success", "Our feedback has been sent successfully!")
            })
            .catch((err) => {
                notificationComponent("error", "Error in Sending Feedback!")
            })

    } catch (err) {
        console.log('Error in Backend');
    }

}

export default sendPlan;