// @ts-ignore
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
      <Hero />
      <Products />
    </NoSSR>
  );
};

export default IndexPage;
