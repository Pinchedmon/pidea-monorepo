/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BrowserRouter, Route, Routes } from "react-router";
import { TrpcProvider } from "./lib/trpc";
import * as routes from "./lib/routes";
import { Layout } from "./components/Layout";
import "./styles/global.scss";
import { SignOutPage } from "./pages/auth/SignOutPage";
import { SignUpPage } from "./pages/auth/SignUpPage";

import { ViewPostPage } from "./pages/posts/ViewPostPage";
import { ThemeProvider } from "./components/theme-provider";
import { AllPostsPage } from "./pages/posts/AllIPostsPage";
import ProfilePage from "./pages/auth/Profile";
import { SignInPage } from "./pages/auth/SignInPage";
import { AppContextProvider } from "./lib/ctx";
import { ItPage } from "./pages/posts/it";
import { MediaPage } from "./pages/posts/media";
import { TechPage } from "./pages/posts/tech";

export const App = () => {
  return (
    <TrpcProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AppContextProvider>
          <BrowserRouter>
            {/* <NotAuthRouteTracker /> */}
            <Routes>
              <Route
                path={routes.getSignUpRoute.definition}
                element={<SignUpPage />}
              />
              <Route
                path={routes.getSignInRoute.definition}
                element={<SignInPage />}
              />
              <Route
                path={routes.getSignOutRoute.definition}
                element={<SignOutPage />}
              />
              <Route element={<Layout />}>
                {/* <Route path={routes.getEditProfileRoute.definition} element={<EditProfilePage />} /> */}
                <Route
                  path={routes.getProfileRoute.definition}
                  element={<ProfilePage />}
                />
                <Route
                  path={routes.getAllPostsRoute.definition}
                  element={<AllPostsPage />}
                />
                <Route
                  path={routes.getViewPostRoute.definition}
                  element={<ViewPostPage />}
                />
                <Route
                  path={routes.getItRoute.definition}
                  element={<ItPage />}
                />
                <Route
                  path={routes.getMediaRoute.definition}
                  element={<MediaPage />}
                />
                <Route
                  path={routes.getTechRoute.definition}
                  element={<TechPage />}
                />
                {/* <Route path={routes.getViewPostRoute.definition} element={<ViewPostPage />} />
              <Route path={routes.getEditPostRoute.definition} element={<EditPostPage />} />
              <Route path={routes.getNewPostRoute.definition} element={<NewPostPage />} /> */}
              </Route>
            </Routes>
          </BrowserRouter>
        </AppContextProvider>
      </ThemeProvider>
    </TrpcProvider>
  );
};
