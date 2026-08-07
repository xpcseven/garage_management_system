import RegisterForm from "@/components/auth/RegisterForm";
import { getActiveGaragesForDriverRegistration } from "@/lib/action/auth/register";

export default async function RegisterPage() {
  const garages = await getActiveGaragesForDriverRegistration();
  return <RegisterForm garageOptions={garages} />;
}
