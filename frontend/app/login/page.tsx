import { Suspense } from "react";
import AuthForm from "../(auth)/AuthForm";

export const metadata = {
  title: "Sign in — ClaimShield",
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
