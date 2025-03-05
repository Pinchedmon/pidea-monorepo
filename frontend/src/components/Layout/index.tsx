/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link, Outlet } from "react-router";
import {
  getAllPostsRoute,
  getItRoute,
  getMediaRoute,
  getProfileRoute,
  getSignInRoute,
  getSignOutRoute,
  getSignUpRoute,
  getTechRoute,
} from "../../lib/routes";
import { Button } from "../ui/button";
import { ModeToggle } from "../mode-toggle";
import { LogOut, User } from "lucide-react";

import { useMe } from "../../lib/ctx";
import { useState } from "react";

import { ReactNode } from "react";
import { ModerationPanel } from "../ModerationPanel";

interface NavLinkProps {
  to: string;
  isActive: boolean;
  children: ReactNode;
}

export const Layout = () => {
  const me = useMe();
  const [path, setPath] = useState("");
  const NavLink = ({ to, isActive, children }: NavLinkProps) => {
    const activeClass = isActive ? "text-green-500" : "text-white";
    return (
      <Link
        to={to}
        onClick={() => setPath(to)}
        className={`px-12 py-1.5 bg-white dark:bg-[#2C2C2C] rounded-3xl border-2 border-black/10 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-[#363636] transition-colors ${
          isActive ? activeClass : "text-black dark:text-white"
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="w-screen min-h-screen bg-gray-50 dark:bg-[#1c1c1c]">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex flex-col md:flex-row items-center gap-6">
          {/* Logo and Theme Toggle */}
          <div className="flex items-center gap-4">
            <Link
              className="transition-transform hover:scale-105"
              onClick={() => setPath(getAllPostsRoute())}
              to={getAllPostsRoute()}
            >
              <Button className="px-6 py-4 text-xl font-bold text-black dark:text-white bg-white dark:bg-[#2C2C2C] border-2 border-[#37B34A] rounded-3xl hover:bg-gray-100 dark:hover:bg-[#363636] transition-colors">
                / π - форум /
              </Button>
            </Link>
            <ModeToggle />
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="flex flex-col md:flex-row gap-4">
              <NavLink to={getItRoute()} isActive={path === "/it"}>
                IT
              </NavLink>
              <NavLink to={getMediaRoute()} isActive={path === "/media"}>
                Media
              </NavLink>
              <NavLink to={getTechRoute()} isActive={path === "/tech"}>
                Tech
              </NavLink>
            </div>

            {/* Auth Links */}
            {me ? (
              <div className="flex text-black dark:text-white flex-col md:flex-row gap-4 md:ml-auto">
                <Link to={getProfileRoute()}>
                  <Button className="w-full text-black dark:text-white px-6 py-3 bg-white dark:bg-[#2C2C2C] hover:bg-gray-100 dark:hover:bg-[#363636] rounded-3xl transition-colors flex items-center gap-2 border-2 border-black/10 dark:border-white/10">
                    <User size={16} />
                    Профиль
                  </Button>
                </Link>
                <Link to={getSignOutRoute()}>
                  <Button className="w-full text-black dark:text-white px-6 py-3 bg-white dark:bg-[#2C2C2C] hover:bg-gray-100 dark:hover:bg-[#363636] rounded-3xl transition-colors flex items-center gap-2 border-2 border-black/10 dark:border-white/10">
                    <LogOut size={16} />
                    Выйти
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 md:ml-auto">
                <Link to={getSignUpRoute()}>
                  <Button className="w-full text-black dark:text-white px-6 py-3 bg-white dark:bg-[#2C2C2C] hover:bg-gray-100 dark:hover:bg-[#363636] rounded-3xl transition-colors border-2 border-black/10 dark:border-white/10">
                    Зарегистрироваться
                  </Button>
                </Link>
                <Link to={getSignInRoute()}>
                  <Button className="w-full text-black dark:text-white px-6 py-3 bg-white dark:bg-[#2C2C2C] hover:bg-gray-100 dark:hover:bg-[#363636] rounded-3xl transition-colors border-2 border-black/10 dark:border-white/10">
                    Войти
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {me?.role === "MODERATOR" ? <ModerationPanel /> : <Outlet />}
      </main>
    </div>
  );
};
