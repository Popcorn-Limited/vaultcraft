import NoSSR from "react-no-ssr";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Hero from "@/components/landing/Hero";
import Products from "@/components/landing/Products";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  return (
    <NoSSR>
      <div className="bg-primaryYellow rounded-md py-3 md:px-4 px-8 mx-4">
        <p>
          <span className="font-bold"> V1.5 is live.{" "}</span>
          Depositors earn: Smart Vault APR + oVCX perpetual call options + Eigenlayer Points + LRT points 🔥
        </p>
      </div>
      <Hero />
      <Products />
    </NoSSR>
  );
};

export default IndexPage;
