import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { metadataAtom } from "@/lib/atoms";
import Input from "@/components/inputs/Input";

interface Tags { [key: string]: boolean }

function MetadataConfiguration() {
  const [metadata, setMetadata] = useAtom(metadataAtom);
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    // wipe old ipfs hash
    if (metadata?.ipfsHash !== "") {
      setMetadata((prefState) => { return { ...prefState, ipfsHash: "" } })
    }

    const newTags: Tags = {};
  }, [])

  function handleNameChange(value: string) {
    setMetadata((prefState) => { return { ...prefState, name: value } })
  }

  function verifyName(value: string) {
    // Set Error
    if (value.length < 3) {
      setError("Name must be at least 3 characters long")
    }
    // Clear Error
    if (value.length >= 3 && error) {
      setError(undefined)
    }
  }

  return (
    <section className="flex flex-col">
      <div>
        <p className="text-sm text-white mb-2">Name</p>
        <Input
          onChange={(e) => handleNameChange((e.target as HTMLInputElement).value)}
          defaultValue={metadata?.name}
          placeholder="Type vault name"
          autoComplete="off"
          autoCorrect="off"
          onBlur={(e) => verifyName((e.target as HTMLInputElement).value)}
          errors={error ? [error] : undefined}
        />
      </div>
    </section>
  );
}

export default MetadataConfiguration;
