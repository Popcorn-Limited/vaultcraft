import NoSSR from "react-no-ssr";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Hero from "@/components/landing/Hero";
import Products from "@/components/landing/Products";
import Carousel from "@/components/common/Carousel";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  return (
    <NoSSR>
      <Carousel />
      <Hero />
      <Products />
    </NoSSR>
  );
};

export default IndexPage;
