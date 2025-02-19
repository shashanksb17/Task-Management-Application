import React from "react";
import { Form, Input, Button } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import "./Signup.css";
import { Navbar } from "../../Components/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios"
import { message } from "antd";
import { signInWithGooglePopup } from "../Login/gooleAuth";

export const Signup = () => {
  const navigate = useNavigate();
  const validateNotEmpty = (rule, value) => {
    if (!value || value.trim() === "") {
      return Promise.reject("This field cannot be empty or whitespace only!");
    }
    return Promise.resolve();
  };
  const onFinish = (values) => {
    if (
      !/[A-Z]/.test(values?.password) ||
      !/[1-9]/.test(values?.password) ||
      !/[!@#$%^&*_?":]/.test(values.password) ||
      values.password.length < 8
    ) {
      return message.error("Password must have One uppercase, One number, and One Special Character")
    }
    axios.post("https://task-management-application-v0f3.onrender.com/user/register", values).then((res)=>{
      message.success("User Registered Successfully")
      navigate("/")
    })
    .catch((err)=>{
      message.error(err?.response?.data?.error)
    })
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await signInWithGooglePopup();
      const { email, displayName, photoUrl } = response._tokenResponse;
      const uid = response?.user.uid
      const [firstName, lastName] = displayName.split(" ");

      console.log(email, displayName, photoUrl, uid)

      const res = await axios.post(
        "https://task-management-application-v0f3.onrender.com/user/auth-google",
        {
          googleId: uid,
          firstName,
          lastName,
          email,
          avatar: photoUrl,
        }
      );

      localStorage.setItem("userToken", res.data.token);
      message.success("Successfully Logged In");
      navigate("/home");
    } catch (error) {
      message.error("Google Login Failed");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="signup-container">
        <h2>Signup</h2>
        <Form
          name="signup"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="firstName"
            rules={[{ required: true, message: "Please input your First Name!" },  { validator: validateNotEmpty },]}
          >
            <Input placeholder="First Name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            rules={[{ required: true, message: "Please input your Last Name!" },  { validator: validateNotEmpty },]}
          >
            <Input placeholder="Last Name" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ required: true, message: "Please input your Email!" },  { validator: validateNotEmpty },]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" },  { validator: validateNotEmpty },]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Please confirm your Password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("The two passwords that you entered do not match!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Signup
            </Button>
          </Form.Item>
        </Form>
        <div className="alternate-option">
          Already have an account? <a style={{ cursor: "pointer" }} onClick={() => navigate("/")}>Login</a>
        </div>
        <Button type="default" icon={<GoogleOutlined />} block onClick={handleGoogleLogin}>
           Google
        </Button>
      </div>
    </div>
  );
};
