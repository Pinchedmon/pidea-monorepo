import { pgr } from "../utils/pumpGetRoute";

export const getSignUpRoute = pgr(() => "/sign-up");

export const getSignInRoute = pgr(() => "/sign-in");

export const getSignOutRoute = pgr(() => "/sign-out");

export const getTechRoute = pgr(() => "/tech");
export const getMediaRoute = pgr(() => "/media");
export const getItRoute = pgr(() => "/it");

export const getEditProfileRoute = pgr(() => "/edit-profile");
export const getProfileRoute = pgr(() => "/profile");
export const getAllPostsRoute = pgr(() => "/");
export const getViewPostRoute = pgr(
  { PostNick: true },
  ({ PostNick }: { PostNick: string }) => `/post/${PostNick}`
);

export const getEditPostRoute = pgr(
  { PostNick: true },
  ({ PostNick }: { PostNick: string }) => `/Posts/${PostNick}/edit`
);

export const getNewPostRoute = pgr(() => "/Posts/new");
