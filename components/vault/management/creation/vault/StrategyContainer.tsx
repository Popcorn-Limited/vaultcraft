import { VaultCreationContainerProps } from ".";
import VaultCreationCard from "@/components/vault/management/creation/VaultCreationCard";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { adapterAtom, adapterConfigAtom } from "@/lib/atoms";
import { verifyInitParamValidity } from "@/lib/utils/helpers";
import StrategyConfiguration from "@/components/deploymentSections/StrategyConfiguration";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";
import MainActionButton from "@/components/button/MainActionButton";

export function isConfigValid(adapter: any, adapterConfig: string[]): boolean {
  if (adapter.initParams && adapter.initParams.length > 0) {
    return adapterConfig.every(
      (param: string, i: number) =>
        verifyInitParamValidity(param, adapter.initParams[i]).length === 0
    );
  }
  return true;
}

export default function StrategyContainer({
  route,
  stages,
  activeStage,
}: VaultCreationContainerProps): JSX.Element {
  const router = useRouter();
  const [adapter] = useAtom(adapterAtom);
  const [adapterConfig] = useAtom(adapterConfigAtom);

  return (
    <VaultCreationCard activeStage={activeStage} stages={stages}>
      <div className={`mb-6`}>
        <h1 className="text-white text-2xl mb-2">Strategy Configuration</h1>
        <p className="text-white">
          Your Strategy will be auto configured. Change values only if they dont
          load or you dislike the default values.
        </p>
      </div>

      <StrategyConfiguration />

      <div className="flex justify-end gap-3 mt-6">
        <SecondaryActionButton
          label="Back"
          handleClick={() => router.push(`/create-vault/${route}/basics`)}
        />
        <MainActionButton
          label="Next"
          handleClick={() => router.push(`/create-vault/${route}/fees`)}
          disabled={!isConfigValid(adapter, adapterConfig)}
        />
      </div>
    </VaultCreationCard>
  );
}
