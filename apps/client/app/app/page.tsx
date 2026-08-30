import Dashboard from "@/modules/app/dashboard";
import Onboarding from "@/modules/app/onboarding";
import Header from "@/modules/header";

export default function Application(){
    return (
        <>
          <Header />

          <Dashboard />
          <Onboarding /> 

        </>
    )
}