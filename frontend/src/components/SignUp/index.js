import React, {useState} from "react";
import {Modal, Form, Input, Button, Select, InputNumber} from "antd";
import md5 from "md5";
import axios from 'axios';
import {Link, useNavigate} from "react-router-dom";
import sendPlan from "../../functions/submitPlan";
import {useRecoilState, useSetRecoilState} from "recoil";
import {addflagState, userInfoState} from "../../recoil_state";
import {BASE_URL} from "../../config";
import {notificationComponent} from "../../functions/notifications";
import './index.css';

const {Option} = Select;

const countries = ["Australia", "Canada", "United Kingdom", "United States", "Austria", "Belgium", "Chile", "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Israel", "Italy", "Japan", "South Korea", "Latvia", "Lithuania", "Luxembourg", "Mexico", "Netherlands", "New Zealand", "Norway", "Poland", "Portugal", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey", "Abkhazia", "Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua & Barbuda", "Argentina", "Armenia", "Artsakh", "Aruba", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia & Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Caribbean Netherlands", "Cayman Islands", "Central African Republic", "Chad", "China", "Christmas Island", "Cocos", "Colombia", "Comoros", "Congo", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curaçao", "Cyprus", "Côte d’Ivoire", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Ghana", "Gibraltar", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard & McDonald Islands", "Honduras", "Hong Kong SAR China", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Luxembourg", "Macao SAR China", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "North Macedonia", "Northern Cyprus", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territories", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn Islands", "Poland", "Portugal", "Puerto Rico", "Qatar", "Romania", "Russia", "Rwanda", "Réunion", "Sahrawi Arab Democratic Republic", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Solomon Islands", "Somalia", "Somaliland", "South Africa", "South Georgia & South Sandwich Islands", "South Ossetia", "South Sudan", "Sri Lanka", "St. Barthélemy", "St. Helena", "St. Kitts & Nevis", "St. Lucia", "St. Martin", "St. Pierre & Miquelon", "St. Vincent & Grenadines", "Sudan", "Suriname", "Svalbard & Jan Mayen", "Syria", "São Tomé & Príncipe", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Transnistria", "Trinidad & Tobago", "Tunisia", "Turkmenistan", "Turks & Caicos Islands", "Tuvalu", "U.S. Outlying Islands", "U.S. Virgin Islands", "Uganda", "Ukraine", "United Arab Emirates", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Wallis & Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"]

const SignupModal = ({visible, onCancel, formData, selectedFile}) => {
    const [flag, setFlagState] = useRecoilState(addflagState);
    const [userInfo, setUserInfo] = useRecoilState(userInfoState);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            const hash = await md5(values.password);
            const userData = {
                email: values.email,
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                country: values.country,
                password: hash
            };

            axios
                .post(`${BASE_URL}/api/auth/register`, userData)
                .then((response) => {
                    notificationComponent("success", "Registration is completed successfully!")

                    axios
                        .post(`${BASE_URL}/api/auth/login`, {email: values.email, password: hash})
                        .then((response) => {
                            const token = response.data.token;
                            setUserInfo(response.data.user);
                            localStorage.setItem("user-token", JSON.stringify(token));
                            localStorage.setItem("user", JSON.stringify(response.data.user));

                            sendPlan(formData, selectedFile, response.data.user, setFlagState, flag);

                            navigate("/activity");
                        })
                        .catch((err) => {
                            var errs = err.response.data.message;
                            notificationComponent("error", "Error in Sign In")
                        })
                })
                .catch((err) => {
                    notificationComponent("error", "Error in Registration")
                });
        } catch (err) {

        }

        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            open={visible}
            title={
                <div style={{position: 'relative', borderBottom: '1px solid #ccc', backgroundColor: '#F4FBFF'}}>
                    <h3 style={{
                        textAlign: 'center',
                        fontSize: "21px",
                        color: '#054776',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
                    }}>Where should I send our feedback?</h3>
                    <img
                        src={"assets/img/shield.png"}
                        alt={""}
                        width={"80px"}
                        style={{
                            position: 'absolute',
                            top: '-55px',
                            left: '0%',
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
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.Item
                    name="firstName"
                    label={
                        <label style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>First Name:</label>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please enter your first name!",
                        },
                    ]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    name="lastName"
                    label={
                        <label style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>Last Name:</label>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please enter your last name!",
                        },
                    ]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    name="email"
                    label={
                        <label style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>Email:</label>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please enter your email address!",
                        },
                        {
                            type: "email",
                            message: "Please enter a valid email address!",
                        },
                    ]}
                >
                    <Input/>
                </Form.Item>

                <Form.Item
                    name="phone"
                    label={
                        <label style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>Phone:</label>
                    }
                    rules={[
                        {
                            required: true,
                            message: 'Please enter your Phone Number!'
                        }
                    ]}
                >
                    <InputNumber maxLength={15} style={{width: "100%"}}/>
                </Form.Item>

                <Form.Item
                    name="country"
                    label={
                        <label style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>Country:</label>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please select your country!",
                        },
                    ]}
                >
                    <Select showSearch>
                        {countries.map((country) => (
                            <Option key={country} value={country.toLowerCase()}>
                                {country}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="password"
                    label={
                        <label style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>Password:</label>
                    }
                    rules={[
                        {
                            required: true,
                            message: "Please enter your password!",
                        },
                    ]}
                >
                    <Input.Password/>
                </Form.Item>

                <Form.Item style={{textAlign: "center"}}>
                    <Button type="primary" htmlType="submit"
                            style={{backgroundColor: '#0D74BE', fontSize: '18px', height: '40px', width: '60%'}}>
                        Send
                    </Button>
                </Form.Item>
            </Form>

            <div>
                <p style={{textAlign: 'center', fontSize: '16px', color: '#054776'}}>
                    Already have an account?{' '}
                    <Link to="/signin" className="font-bold leading-6 text-indigo-600 hover:text-indigo-500">
                        Log In
                    </Link>
                </p>
            </div>
        </Modal>
    );
};

export default SignupModal;