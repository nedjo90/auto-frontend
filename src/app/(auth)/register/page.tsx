import { RegistrationForm } from "@/components/auth/registration-form";

export const metadata = {
  title: "Créer un compte | Auto",
  description: "Créez votre compte Auto pour accéder à la plateforme",
};

export default function RegisterPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
          Créer un compte
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-muted-foreground">
          Remplissez le formulaire ci-dessous pour rejoindre Auto
        </p>
      </div>
      <RegistrationForm />
    </>
  );
}
