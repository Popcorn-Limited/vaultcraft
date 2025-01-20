import NoSSR from "react-no-ssr";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import FlagshipVaultContainer from "@/components/vault/FlagshipVaultContainer";

const IndexPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (window.location.pathname !== "/") {
      router.replace(window.location.pathname);
    }
  }, [router.pathname]);

  return (
    <FlagshipVaultContainer />
  );
};

export default IndexPage;
