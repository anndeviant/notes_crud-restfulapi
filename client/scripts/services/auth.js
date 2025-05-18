// Use an IIFE to avoid global variable conflicts
(function () {
  const API_URL = "http://127.0.0.1:5000";

  // Function to handle user login
  window.login = async function (email, password) {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      // Store token and user data in localStorage
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.safeUserData)
        );
        return response.data;
      }

      return null;
    } catch (error) {
      // Check if the error is due to already being logged in elsewhere
      if (
        error.response &&
        error.response.data &&
        error.response.data.alreadyLoggedIn
      ) {
        throw new Error("This account is already logged in on another device");
      }
      console.error("Login error:", error);
      throw error;
    }
  };

  // Function to handle user registration
  window.register = async function (name, email, gender, password) {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        gender,
        password,
      });

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Function to handle user logout
  window.logout = async function () {
    try {
      await axios.delete(`${API_URL}/logout`, {
        withCredentials: true,
      });

      // Clear user data from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      return true;
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      throw error;
    }
  };

  // Improved isAuthenticated function to check token expiration
  window.isAuthenticated = function () {
    const token = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      return false;
    }

    try {
      // Decode the JWT token to check expiration
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      const now = Math.floor(Date.now() / 1000);

      // If token is expired
      if (payload.exp && payload.exp < now) {
        console.log(
          "Token expired at:",
          new Date(payload.exp * 1000).toLocaleString()
        );
        console.log("Current time:", new Date().toLocaleString());

        // Clear stored data
        localStorage.removeItem("accessToken");

        return false;
      }

      return true;
    } catch (e) {
      console.error("Error parsing token:", e);
      // If we can't decode the token, consider it invalid
      localStorage.removeItem("accessToken");
      return false;
    }
  };

  // Function to get current user
  window.getCurrentUser = function () {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error("Error parsing user data:", e);
      return null;
    }
  };

  // Enhanced refresh token function
  window.refreshToken = async function () {
    try {
      console.log("Attempting to refresh token...");
      const response = await axios.get(`${API_URL}/token`, {
        withCredentials: true,
      });

      if (response.data.accessToken) {
        console.log("Token refreshed successfully");
        localStorage.setItem("accessToken", response.data.accessToken);
        return response.data.accessToken;
      }

      throw new Error("No access token received");
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Clear localStorage on refresh failure
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      throw error;
    }
  };
})();
