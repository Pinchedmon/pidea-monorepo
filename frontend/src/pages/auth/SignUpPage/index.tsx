/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { withZodSchema } from "formik-validator-zod";
import { useFormik } from "formik";
import { useMemo, useState } from "react";

import { useNavigate } from "react-router";
import { z } from "zod";

export const zSignUpTrpcInput = z.object({
  nick: z
    .string()
    .min(1)
    .regex(
      /^[a-z0-9-]+$/,
      "Nick may contain only lowercase letters, numbers and dashes"
    ),
  password: z.string().min(1),
  email: z.string().min(1).email(),
});

export const SignUpPage = () => {
  const trpcUtils = trpc.useUtils();
  const signUp = trpc.signUp.useMutation();
  const navigate = useNavigate();
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [submittingError, setSubmittingError] = useState<Error | null>(null);

  const formik = useFormik({
    initialValues: {
      nick: "",
      email: "",
      password: "",
      passwordAgain: "",
    },
    validate: withZodSchema(
      zSignUpTrpcInput
        .extend({
          passwordAgain: z.string().min(1, "Please confirm your password"),
        })
        .superRefine((val, ctx) => {
          if (val.password !== val.passwordAgain) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Passwords must be the same",
              path: ["passwordAgain"],
            });
          }
        })
    ),
    onSubmit: async (values, formikHelpers) => {
      try {
        setSubmittingError(null);
        const { token } = await signUp.mutateAsync(values);
        Cookies.set("token", token, { expires: 99999 });
        navigate("/");
        void trpcUtils.invalidate();
        setSuccessMessageVisible(true);
        setTimeout(() => {
          setSuccessMessageVisible(false);
        }, 3000);
        if (formikHelpers.resetForm) {
          formikHelpers.resetForm();
        }
      } catch (error: any) {
        setSubmittingError(error);
      }
    },
  });

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
        message: "Registration successful!",
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
    <div className="w-screen min-h-screen bg-gradient-to-br from-[#37B34A] to-[#2f9a3f] dark:bg-none dark:bg-opacity-0">
      <section className="container mx-auto px-4 min-h-screen flex items-center justify-center">
        <div className="fixed left-4 top-4">
          <ModeToggle />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
          <div className="text-center md:text-left">
            <h1 className="text-6xl md:text-[100px] font-bold text-white dark:text-[#37B34A] leading-tight">
              / π /
            </h1>
            <p className="text-4xl md:text-[47px] text-wrap font-bold text-white dark:text-[#37B34A] mt-2">
              твоё будущее
            </p>
          </div>

          <div className="w-full max-w-[400px]">
            <form
              onSubmit={formik.handleSubmit}
              className="bg-white dark:bg-[#2c2c2c] shadow-2xl rounded-3xl border-4 border-black/10 dark:border-white/10 p-8"
            >
              <div className="flex flex-col items-center mb-8">
                <h2 className="inline-block px-6 py-3 rounded-full text-xl font-bold border-3 border-[#37B34A] shadow-md mb-4">
                  / π - Форум /
                </h2>
                <p className="text-2xl font-bold dark:text-white">
                  РЕГИСТРАЦИЯ
                </p>
              </div>

              {!alertProps.hidden && (
                <div
                  className={`text-center text-${alertProps.color}-500 mb-6 font-medium`}
                >
                  {alertProps.message}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Логин"
                    name="nick"
                    value={formik.values.nick}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="rounded-xl border-2 border-black/20 dark:border-white/20 focus:border-[#37B34A] transition-colors"
                  />
                  {formik.touched.nick && formik.errors.nick && (
                    <p className="mt-1 text-red-500 text-sm">
                      {formik.errors.nick}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    placeholder="Почта"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="rounded-xl border-2 border-black/20 dark:border-white/20 focus:border-[#37B34A] transition-colors"
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-red-500 text-sm">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    placeholder="Пароль"
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="rounded-xl border-2 border-black/20 dark:border-white/20 focus:border-[#37B34A] transition-colors"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="mt-1 text-red-500 text-sm">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <Input
                    placeholder="Повторный пароль"
                    name="passwordAgain"
                    type="password"
                    value={formik.values.passwordAgain}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="rounded-xl border-2 border-black/20 dark:border-white/20 focus:border-[#37B34A] transition-colors"
                  />
                  {formik.touched.passwordAgain &&
                    formik.errors.passwordAgain && (
                      <p className="mt-1 text-red-500 text-sm">
                        {formik.errors.passwordAgain}
                      </p>
                    )}
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center">
                <Button
                  type="submit"
                  className="w-full bg-[#37B34A] hover:bg-[#2f9b3f] text-white rounded-xl py-3 font-medium transition-colors"
                >
                  Создать аккаунт
                </Button>

                <Button
                  variant="link"
                  type="button"
                  onClick={() => navigate("/sign-in")}
                  className="mt-4 text-[#37B34A] hover:text-[#2f9b3f] transition-colors"
                >
                  Уже есть аккаунт? Войти
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
