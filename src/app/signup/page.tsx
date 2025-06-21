import AuthForm from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <AuthForm mode="signup" />
    </div>
  );
}
