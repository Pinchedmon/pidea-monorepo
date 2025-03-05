import type { Post, User, UserPermission } from '@prisma/client'

type MaybeUser = Pick<User, 'permissions' | 'id'> | null
type MaybePost = Pick<Post, 'authorId'> | null

export const hasPermission = (user: MaybeUser, permission: UserPermission) => {
  return user?.permissions.includes(permission) || user?.permissions.includes('ALL') || false
}

export const canBlockPosts = (user: MaybeUser) => {
  return hasPermission(user, 'BLOCK_POSTS')
}

export const canEditPost = (user: MaybeUser, Post: MaybePost) => {
  return !!user && !!Post && user?.id === Post?.authorId
}
