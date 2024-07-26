import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Button, ConfigProvider, Space, Input, Select, message } from "antd";
import { MdOutlinePostAdd } from "react-icons/md";
import { css } from "@emotion/css";
import "./HomePage.css";
import { Navbar } from "../../Components/Navbar";
import TaskModal from "../TaskModel/TaskModel";
import lodash from "lodash";
import { TaskPage } from "../TaskPage/TaskPage";
import { Loader } from "../../Components/Loader/Loader";

const { Option } = Select;

const HomePage = () => {
  const token = localStorage.getItem("userToken");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("all");
  const [inProgress, setInProgress] = useState(undefined);
  const [isCompleted, setIsCompleted] = useState(undefined);
  const [load, setLoad] = useState(true);
  const [taskData, setTaskData] = useState([]);
  const fetchUserInfo = async () => {
    if (token) {
      try {
        setLoad(true);
        const response = await axios.get("https://voosh-assignment-4zan.onrender.com/user/info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        localStorage.setItem("userData", JSON.stringify(response?.data?.user));
        setLoad(false);
      } catch (error) {
        console.error("Failed to fetch user info", error);
        setLoad(false);
      }
    }
  };

  const fetchTaskData = () => {
    const params = {};

    if (search) params.search = search;
    if (sortBy && sortBy !== "all") params.sortBy = sortBy;
    if (inProgress !== undefined) params.in_progress = inProgress;
    if (isCompleted !== undefined) params.is_completed = isCompleted;
    setLoad(true);
    axios
      .get("https://voosh-assignment-4zan.onrender.com/task/all", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setTaskData(res?.data);
        setLoad(false);
      })
      .catch((err) => {
        message.error("OOPS! Something Went Wrong");
        setLoad(false);
      });
  };

  const handleSearchChange = lodash.debounce((value) => {
    setSearch(value);
  }, 300);

  useEffect(() => {
    fetchUserInfo();
  }, [token]);

  useEffect(() => {
    fetchTaskData();
  }, [search, sortBy, inProgress, isCompleted]);

  const handleSortChange = (value) => {
    setSortBy(value);
    if (value === "in_progress") {
      setInProgress(true);
      setIsCompleted(undefined);
    } else if (value === "is_completed") {
      setInProgress(undefined);
      setIsCompleted(true);
    } else {
      setInProgress(undefined);
      setIsCompleted(undefined);
    }
  };

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const linearGradientButton = css`
    &.${rootPrefixCls}-btn-primary:not([disabled]):not(
        .${rootPrefixCls}-btn-dangerous
      ) {
      border-width: 0;

      > span {
        position: relative;
      }

      &::before {
        content: "";
        background: linear-gradient(135deg, #6253e1, #04befe);
        position: absolute;
        inset: 0;
        opacity: 1;
        transition: all 0.3s;
        border-radius: inherit;
      }

      &:hover::before {
        opacity: 0;
      }
    }
  `;

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />

      <div className="homepage-container">
        <ConfigProvider
          button={{
            className: linearGradientButton,
          }}
        >
          <Space style={{marginLeft:"100px"}}>
            <Button
              type="primary"
              size="large"
              icon={<MdOutlinePostAdd />}
              onClick={() => setIsModalVisible(true)}
            >
              Add Task
            </Button>
          </Space>
        </ConfigProvider>

        <div className="filter-parent">
          <div className="search-filter-container">
            <div className="search-bar">
              <label>Search</label>
              <Input
                placeholder="Search..."
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <div className="filter-select">
              <label>Sort By</label>
              <Select
                defaultValue="all"
                style={{ width: 140 }}
                onChange={handleSortChange}
              >
                <Option value="all">All</Option>
                <Option value="createdAt_asc">Recent</Option>
                <Option value="createdAt_desc">Oldest</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="is_completed">Completed</Option>
              </Select>
            </div>
          </div>
        </div>

        {load ? (
          <div style={{display:"flex", justifyContent:"center", alignItems:"center", height:"50vh"}}>
          <Loader />
          </div>
        ) : (
          <div>
            <TaskPage
              taskData={taskData}
              setTaskData={setTaskData}
              fetchTaskData={fetchTaskData}
            />
          </div>
        )}

        <TaskModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          fetchTaskData={fetchTaskData}
        />
      </div>
    </div>
  );
};

export default HomePage;
