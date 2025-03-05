import pick from 'lodash/pick'
import { useNavigate } from 'react-router'
import { Alert } from '../../../components/Alert'
import { Button } from '../../../components/Button'
import { FormItems } from '../../../components/FormItems'
import { Input } from '../../../components/Input'
import { Segment } from '../../../components/Segment'
import { Textarea } from '../../../components/Textarea'
import { getEditPostRoute, getViewPostRoute } from '../../../lib/routes'
import { trpc } from '../../../lib/trpc'
import { useForm } from '../../../lib/form'
import { withPageWrapper } from '../../../lib/pageWrapper'
import { canEditPost } from '@tutor1/backend/src/utils/can'
import { zUpdatePostTrpcInput } from '@tutor1/backend/src/router/posts/updateIdea/input'

export const EditPostPage = withPageWrapper({
  authorizedOnly: true,
  useQuery: () => {
    const { PostNick } = getEditPostRoute.useParams()
    return trpc.getPost.useQuery({
      PostNick,
    })
  },
  setProps: ({ queryResult, ctx, checkExists, checkAccess }) => {
    const Post = checkExists(queryResult.data.Post, 'Post not found')
    checkAccess(canEditPost(ctx.me, Post as any), 'An Post can only be edited by the author')
    return {
      Post,
    }
  },
  title: ({ Post }) => `Edit Post "${Post.name}"`,
})(({ Post }) => {
  const navigate = useNavigate()
  const updatePost = trpc.updatePost.useMutation()
  const { formik, buttonProps, alertProps } = useForm({
    initialValues: {
      name: Post.name || '',

      nick: Post.nick || '',

      description: Post.description || '',

      text: Post.text || '',
    },
    validationSchema: zUpdatePostTrpcInput.omit({ PostId: true }),
    onSubmit: async (values) => {
      await updatePost.mutateAsync({ PostId: Post.id as string, ...values })
      navigate(getViewPostRoute({ PostNick: Post.nick as string }))
    },
    resetOnSuccess: false,
    showValidationAlert: true,
  })

  return (
    <Segment title={`Edit Post: ${Post.nick}`}>
      <form onSubmit={formik.handleSubmit}>
        <FormItems>
          <Input label="Name" name="name" formik={formik} />
          <Input label="Nick" name="nick" formik={formik} />
          <Input label="Description" name="description" maxWidth={500} formik={formik} />
          <Textarea label="Text" name="text" formik={formik} />
          <Alert {...alertProps} />
          <Button {...buttonProps}>Update Post</Button>
        </FormItems>
      </form>
    </Segment>
  )
})
