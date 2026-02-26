import React, { useState } from "react";
import { createPopper } from "@popperjs/core";
import { ToastContainer, toast } from "react-toastify";

const UserDropdown = () => {
  // dropdown props
  const [dropdownPopoverShow, setDropdownPopoverShow] = React.useState(false);
  const btnDropdownRef = React.createRef();
  const popoverDropdownRef = React.createRef();
  const openDropdownPopover = () => {
    createPopper(btnDropdownRef.current, popoverDropdownRef.current, {
      placement: "bottom-start",
    });
    setDropdownPopoverShow(true);
  };
  const closeDropdownPopover = () => {
    setDropdownPopoverShow(false);
  };

  const [user, setUser] = useState({
    id: null,
    name: "",
    email: "",
  });

  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const handleLogout = async () => {
    // Handle logout logic here
    try {
      const response = await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        console.log("User logged out");
        toast.success("User logged out successfully!", {
          position: "top-left",
          autoClose: 6000,
        });
        // Clear session storage
        sessionStorage.clear();
        window.location.href = "/login";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // const email = sessionStorage.getItem("email");
  // setUser(email);
  // console.log("Fetching details for user ID:", email);

  return (
    <>
      <a
        className="text-blueGray-500 block"
        href="#pablo"
        ref={btnDropdownRef}
        onClick={(e) => {
          e.preventDefault();
          dropdownPopoverShow ? closeDropdownPopover() : openDropdownPopover();
        }}
      >
        <div className="items-center flex">
          <span className="w-12 h-12 text-sm text-white bg-blueGray-200 inline-flex items-center justify-center rounded-full ml-6">
            <img
              alt="..."
              className="w-full rounded-full align-middle border-none shadow-lg"
              src={require("../../assets/img/ceb.png")}
            />
          </span>
        </div>
      </a>
      <div
        ref={popoverDropdownRef}
        className={
          (dropdownPopoverShow ? "block " : "hidden ") +
          "bg-white text-base z-50 float-left py-2 list-none text-left rounded shadow-lg min-w-48"
        }
      >
        <a
          href="#pablo"
          className={
            "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
          }
          onClick={(e) => e.preventDefault()}
        >
          Maps
        </a>
        <a
          href="#pablo"
          className={
            "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
          }
          onClick={(e) => e.preventDefault()}
        >
          Smart Plug Registration
        </a>
        <a
          href="#pablo"
          className={
            "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
          }
          onClick={(e) => e.preventDefault()}
        >
          Contact Us
        </a>
        <div className="h-0 my-2 border border-solid border-blueGray-100" />
        <a
          href="/src/views/auth/Login.js"
          className={
            "text-sm py-2 px-4 font-normal block w-full whitespace-nowrap bg-transparent text-blueGray-700"
          }
          onClick={() => handleLogout()}
        >
          Logout
        </a>
      </div>
      <ToastContainer />
    </>
  );
};

export default UserDropdown;
