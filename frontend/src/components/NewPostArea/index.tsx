import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

import { useFormik } from "formik";
import { withZodSchema } from "formik-validator-zod";
import { useState, useMemo } from "react";
import { z } from "zod";

export const NewPostArea = (props: { theme: string }) => {
  const createPost = trpc.createPost.useMutation();
  const trpcUtils = trpc.useUtils();
  const formik = useFormik({
    initialValues: {
      text: "",
      theme: props.theme as "IT" | "MEDIA" | "TECH",
    },
    validate: withZodSchema(
      z.object({
        theme: z.enum(["IT", "MEDIA", "TECH"]),
        text: z.string().min(1),
      })
    ),
    onSubmit: async (values) => {
      setSubmittingError(null);
      try {
        await createPost.mutateAsync(values);
        formik.resetForm();
        await trpcUtils.getPostsWithTheme.refetch();
        setSuccessMessageVisible(true);
        setTimeout(() => {
          setSuccessMessageVisible(false);
        }, 3000);
      } catch (error) {
        setSubmittingError(error as Error);
      }
    },
  });

  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [submittingError, setSubmittingError] = useState<Error | null>(null);

  const alertProps = useMemo(() => {
    if (submittingError) {
      return {
        hidden: false,
        message: submittingError.message,
        color: "red",
      };
    }
    if (!formik.isValid && !!formik.submitCount) {
      return {
        hidden: false,
        message: "Some fields are invalid",
        color: "red",
      };
    }
    if (successMessageVisible) {
      return {
        hidden: false,
        message: "Message created!",
        color: "green",
      };
    }
    return {
      hidden: true,
      message: null,
      color: null,
    };
  }, [
    submittingError,
    formik.isValid,
    formik.submitCount,
    successMessageVisible,
  ]);

  return (
    <form
      className="flex flex-col w-full gap-4 p-6 bg-white dark:bg-[#2c2c2c] rounded-3xl shadow-lg border border-black/5 dark:border-white/5"
      onSubmit={(e) => {
        e.preventDefault();
        formik.handleSubmit();
      }}
    >
      {!alertProps.hidden && (
        <div
          className={`px-4 py-2 rounded-xl bg-${alertProps.color}-50 dark:bg-${alertProps.color}-900/10`}
        >
          <p
            className={`text-center text-${alertProps.color}-600 dark:text-${alertProps.color}-400 font-medium`}
          >
            {alertProps.message}
          </p>
        </div>
      )}

      <Textarea
        placeholder="Создать запись..."
        maxLength={100}
        name="text"
        value={formik.values.text}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className="p-4 bg-gray-50 dark:bg-[#363636] border-2 border-[#37B34A] rounded-2xl resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-[#37B34A] transition-all duration-200"
      />

      <Button
        type="submit"
        className="self-start px-6 py-2 bg-[#37B34A] hover:bg-[#2f9a3f] text-white font-medium rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg"
      >
        Создать
      </Button>
    </form>
  );
};
