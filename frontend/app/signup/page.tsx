import { Suspense } from "react";
import AuthForm from "../(auth)/AuthForm";

export const metadata = {
  title: "Create account — Indira",
};

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
