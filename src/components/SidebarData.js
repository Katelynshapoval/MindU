import React from "react";
import * as FaIcons from "react-icons/fa";
import * as AiIcons from "react-icons/ai";
import * as IoIcons from "react-icons/io";
import { RiRobot3Fill } from "react-icons/ri";

export const SidebarData = [
  {
    title: "Home",
    path: "/",
    icon: <AiIcons.AiFillHome />,
    cName: "nav-text",
  },
  {
    title: "Chat",
    path: "/chat",
    icon: <IoIcons.IoMdChatbubbles />,
    cName: "nav-text",
  },
  {
    title: "Tips",
    path: "/tips",
    icon: <FaIcons.FaLightbulb />,
    cName: "nav-text",
  },
  {
    title: "Support",
    path: "/support",
    icon: <IoIcons.IoMdHelpCircle />,
    cName: "nav-text",
  },
  {
    title: "Assistant",
    path: "/assistant",
    icon: <RiRobot3Fill />,
    cName: "nav-text",
  },
];
