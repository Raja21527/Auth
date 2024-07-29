import React, { useState } from "react";
import { AppBar, Box, Tabs, Tab, Toolbar, Typography } from "@mui/material";
import { LinkComponent, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { authActions } from "../store";
axios.defaults.withCredentials = true;
const Header = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.isLoggedIn);
  const sendLogoutReq = async () => {
    const res = await axios.post("http://localhost:5000/logout", null, {
      withCredentials: true,
    });
    if (res.status == 200) {
      return res;
    }
    return new Error("unable to logout");
  };
  const handleLogout = () => {
    sendLogoutReq().then(() => dispatch(authActions.logout()));
  };
  const [tvalue, settValue] = useState(0);
  return (
    <div>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">Mern Auth</Typography>
          <Box sx={{ marginLeft: "auto" }}>
            <Tabs
              indicatorColor="secondary"
              onChange={(e, val) => settValue(val)}
              value={tvalue}
              textColor="inherit"
            >
              {!isLoggedIn && (
                <>
                  <Tab LinkComponent={Link} to="/login" label="login" />
                  <Tab to="/signup" LinkComponent={Link} label="signup" />
                </>
              )}
              {isLoggedIn && (
                <Tab
                  onClick={handleLogout}
                  to="/login"
                  LinkComponent={Link}
                  label="logout"
                />
              )}
            </Tabs>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
