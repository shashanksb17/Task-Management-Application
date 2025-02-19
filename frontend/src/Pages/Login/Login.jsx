import React, { useState, useEffect } from "react";
import { Navbar } from "../../Components/Navbar";
import { Form, Input, Button, message } from "antd";
import { GoogleOutlined, TruckOutlined } from "@ant-design/icons";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader } from "../../Components/Loader/Loader";
import { signInWithGooglePopup } from "./gooleAuth";

export const Login = () => {
  const navigate = useNavigate();
  const [load, setload] = useState(false);
  const loadBackend = () => {
    setload(TruckOutlined);
    axios
      .get("https://task-management-application-v0f3.onrender.com")
      .then((res) => {
        setload(false);
      })
      .catch((err) => {
        message.error("Unable To Start The Backend");
        setload(false);
      });
  };
  useEffect(() => {
    loadBackend();
  }, []);
  const onFinish = (values) => {
    if (
      !/[A-Z]/.test(values?.password) ||
      !/[1-9]/.test(values?.password) ||
      !/[!@#$%^&*_?":]/.test(values.password) ||
      values.password.length < 8
    ) {
      return message.error("Password must have One uppercase, One number, and One Special Character")
    }
    axios
      .post("https://task-management-application-v0f3.onrender.com/user/login", values)
      .then((res) => {
        localStorage.setItem("userToken", res?.data?.token);
        message.success("Successfully Logged In");
        navigate("/home");
      }).catch((err)=>message.error(err?.response?.data?.error))
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await signInWithGooglePopup();
      const { email, displayName, photoUrl } = response._tokenResponse;
      const uid = response?.user.uid
      const [firstName, lastName] = displayName.split(" ");
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
      {load ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "40vh",
          }}
        >
          <Loader />
          <h2>Please Wait Backend Is Starting</h2>
        </div>
      ) : (
        <>
          <Navbar />
          <div className="login-container">
            <h2>Login</h2>
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your Email!" },
                ]}
              >
                <Input placeholder="Email" type="email" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your Password!" },
                ]}
              >
                <Input.Password placeholder="Password" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Login
                </Button>
              </Form.Item>
            </Form>
            <div className="alternate-option">
              Don't have an account?{" "}
              <a
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/signup")}
              >
                Signup
              </a>
            </div>
            <Button
              type="default"
              icon={<GoogleOutlined />}
              block
              onClick={handleGoogleLogin}
            >
              Login with Google
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
