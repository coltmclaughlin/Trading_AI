import React, {useEffect, useState} from "react";
import {Card, Form, Input, Button, Select, InputNumber} from "antd";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import md5 from "md5";
import {BASE_URL} from "../../config";
import {useRecoilState} from "recoil";
import {userInfoState} from "../../recoil_state";
import {notificationComponent} from "../../functions/notifications";

const {Option} = Select;

const countries = ["Australia", "Canada", "United Kingdom", "United States", "Austria", "Belgium", "Chile", "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Israel", "Italy", "Japan", "South Korea", "Latvia", "Lithuania", "Luxembourg", "Mexico", "Netherlands", "New Zealand", "Norway", "Poland", "Portugal", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey", "Abkhazia", "Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua & Barbuda", "Argentina", "Armenia", "Artsakh", "Aruba", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia & Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Cape Verde", "Caribbean Netherlands", "Cayman Islands", "Central African Republic", "Chad", "China", "Christmas Island", "Cocos", "Colombia", "Comoros", "Congo", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Curaçao", "Cyprus", "Côte d’Ivoire", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Ghana", "Gibraltar", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard & McDonald Islands", "Honduras", "Hong Kong SAR China", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Luxembourg", "Macao SAR China", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea", "North Macedonia", "Northern Cyprus", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territories", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn Islands", "Poland", "Portugal", "Puerto Rico", "Qatar", "Romania", "Russia", "Rwanda", "Réunion", "Sahrawi Arab Democratic Republic", "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Sint Maarten", "Solomon Islands", "Somalia", "Somaliland", "South Africa", "South Georgia & South Sandwich Islands", "South Ossetia", "South Sudan", "Sri Lanka", "St. Barthélemy", "St. Helena", "St. Kitts & Nevis", "St. Lucia", "St. Martin", "St. Pierre & Miquelon", "St. Vincent & Grenadines", "Sudan", "Suriname", "Svalbard & Jan Mayen", "Syria", "São Tomé & Príncipe", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Transnistria", "Trinidad & Tobago", "Tunisia", "Turkmenistan", "Turks & Caicos Islands", "Tuvalu", "U.S. Outlying Islands", "U.S. Virgin Islands", "Uganda", "Ukraine", "United Arab Emirates", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Wallis & Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe"]

const Profile = () => {
    const [userInfo, setUserInfo] = useRecoilState(userInfoState);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = (values) => {
        form.validateFields()
            .then(() => {
                const formData1 = {
                    ...values,
                    _id: userInfo._id,
                    password: md5(values.password)
                }

                axios
                    .post(`${BASE_URL}/api/auth/profile`, formData1, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                    .then((response) => {
                        notificationComponent("success", "Your profile is updated successfully!")
                        localStorage.setItem("user", JSON.stringify(formData1))
                        setUserInfo(formData1);
                        navigate('/activity');
                    })
                    .catch((err) => {
                        notificationComponent("error", "Error in Updating Profile")
                    });
            })
            .catch(error => {
                notificationComponent("error", "Error in Updating Profile")
            });
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '7% 2%',
                backgroundImage: "linear-gradient(rgba(224, 242, 255, 0.4), rgba(236, 242, 243, 0.3)), url('assets/img/background.png')",
                backgroundSize: "cover",
                minHeight: '88vh',
            }}
        >
            <Card style={{
                width: 480,
                backgroundColor: "rgba(229,245,255,0.62)",
                boxShadow: "2px 4px 8px rgba(13, 116, 190, 0.65)",
            }}>
                <div style={{position: 'relative', borderBottom: '1px solid #ccc', margin: '10px'}}>
                    <h3 style={{textAlign: 'center', color: '#2d9ae7', fontSize: '22px'}}>
                        Update Profile
                    </h3>
                    <img
                        src={"assets/img/shield.png"}
                        alt={""}
                        width={"80px"}
                        style={{
                            position: 'absolute',
                            top: '-50px',
                            left: '-1%',
                            transform: 'translateX(-50%)',
                            opacity: '0.8'
                        }}
                    />
                </div>

                <Form initialValues={{...userInfo, password: ""}} form={form} onFinish={onFinish} size={"large"} style={{marginTop: '20px'}}>
                    <Form.Item
                        name="firstName"
                        label={
                            <label
                                style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>First Name:
                            </label>
                        }
                        rules={[{
                            required: true, message: "Please enter your first name!",
                        },]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        name="lastName"
                        label={
                            <label
                                style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>Last Name:
                            </label>
                        }
                        rules={[{
                            required: true, message: "Please enter your last name!",
                        },]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label={
                            <label
                                style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>Email Address:
                            </label>
                        }
                        rules={[{
                            required: true, message: "Please enter your email address!",
                        }, {
                            type: "email", message: "Please enter a valid email address!",
                        },]}
                    >
                        <Input/>
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label={
                            <label
                                style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>Phone Number:
                            </label>
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
                            <label
                                style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>Country:
                            </label>
                        }
                        rules={[{
                            required: true, message: "Please select your country!",
                        },]}
                    >
                        <Select showSearch defaultValue={"Australia"}>
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
                            <label
                                style={{fontSize: "17px", fontWeight: "bold", color: "#054776"}}>Password:
                            </label>
                        }
                        rules={[{
                            required: true, message: "Please enter your password!",
                        },]}
                    >
                        <Input.Password/>
                    </Form.Item>

                    <Form.Item style={{textAlign: 'center'}}>
                        <Button type="primary" htmlType="submit" style={{backgroundColor: "#0D74BE", width: '50%'}}>
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>);
};

export default Profile;