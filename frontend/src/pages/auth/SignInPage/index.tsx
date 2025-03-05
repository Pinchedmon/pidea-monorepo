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

export const zSignInTrpcInput = z.object({
  name: z.string(),
  password: z.string(),
});
export const SignInPage = () => {
  const trpcUtils = trpc.useUtils();
  const signIn = trpc.signIn.useMutation();
  const navigate = useNavigate();
  const [successMessageVisible, setSuccessMessageVisible] = useState(false);
  const [submittingError, setSubmittingError] = useState<Error | null>(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      password: "",
    },
    validate: withZodSchema(zSignInTrpcInput),
    onSubmit: async (values, formikHelpers) => {
      try {
        setSubmittingError(null);
        const { token } = await signIn.mutateAsync(values);
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
        // Handle the specific error from the API
        if (error.message === "Wrong nick or password") {
          setSubmittingError(new Error("Неверный логин или пароль"));
        } else {
          setSubmittingError(new Error("Произошла ошибка при входе"));
        }
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
        message: "Заполните все поля правильно",
        color: "red",
      };
    }
    if (successMessageVisible) {
      return {
        hidden: false,
        message: "Вход выполнен успешно!",
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
            <p className="text-4xl md:text-[64px] font-bold text-white dark:text-[#37B34A] mt-2">
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
                <p className="text-2xl font-bold dark:text-white">ВХОД</p>
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
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="rounded-xl border-2 border-black/20 dark:border-white/20 focus:border-[#37B34A] transition-colors"
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-1 text-red-500 text-sm">
                      {formik.errors.name}
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

                <Button
                  type="submit"
                  className="w-full rounded-xl bg-[#37B34A] hover:bg-[#2f9a3f] text-white font-medium py-2 transition-colors"
                >
                  Войти
                </Button>

                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate("/sign-up")}
                  className="w-full text-[#37B34A] hover:text-[#2f9a3f] font-medium underline-offset-4"
                >
                  Нет аккаунта? Зарегистрируйтесь
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
