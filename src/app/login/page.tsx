import AuthForm from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <AuthForm mode="login" />
    </div>
  );
}
