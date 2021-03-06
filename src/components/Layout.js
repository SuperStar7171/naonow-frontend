import React, {useState, useEffect} from "react";
import { useSelector, useDispatch } from 'react-redux';
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import "../assets/styles/layout.scss";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import io from "socket.io-client";
import { setNotification } from "../actions/notification";

const Layout = ({ children, fluid }) => {
  const isShowSidebar = useSelector(state => state.settings.isShowSidebar);
  const stripe = loadStripe(process.env.REACT_APP_STRIPE_KEY);

  const authed = useSelector(state => state.auth.authenticated);
  const user = useSelector(state => state.users.user);
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (authed && user?.id) {
      setSocket(io.connect(process.env.REACT_APP_SERVER_URL));
    }
  }, [user, authed]);

  useEffect(() => {
    if (socket) {
      socket.on("join", onUserJoined);
      socket.on('completeLesson', onCompleteLesson);
    }
  }, [socket]);

  const onCompleteLesson = (data) => {
    dispatch(setNotification({
      message: `Lesson #${data.group.group_id} is completed`,
      data
    }));
  }

  const onUserJoined = () => {
    socket.emit('join', user.id);
  };

  return (
    <Elements stripe={stripe}>
      <div className="default-layout">
        <Navbar />
        <div className={`content ${fluid ? 'fluid' : ''}`}>
          {isShowSidebar && <div className="mobile-fade-background" />}
          <Sidebar />
          <div className="children-page">
            {children}
          </div>
        </div>
        <Footer />
      </div>
    </Elements>
  )
}

export default Layout;
