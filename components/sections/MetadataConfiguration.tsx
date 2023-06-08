import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { VAULT_TAGS, metadataAtom } from "@/lib/atoms";
import Input from "@/components/inputs/Input";

interface Tags { [key: string]: boolean }


function MetadataConfiguration() {
  const [metadata, setMetadata] = useAtom(metadataAtom);
  const [tags, setTags] = useState<Tags>({});
  const [error, setError] = useState<string | undefined>(undefined)

  useEffect(() => {
    // wipe old ipfs hash
    if (metadata?.ipfsHash !== "") {
      setMetadata((prefState) => { return { ...prefState, ipfsHash: "" } })
    }

    const newTags: Tags = {};
    VAULT_TAGS.forEach((tag: string) => {
      newTags[tag] = metadata?.tags?.includes(tag)
    });
    setTags(newTags);
  }, [])

  function handleChange(value: string) {
    const newTags = { ...tags };
    newTags[value] = !newTags[value];
    setTags(newTags);
    setMetadata((prefState) => { return { ...prefState, tags: Object.keys(newTags).filter((tag) => newTags[tag]) } })
  }

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
      <div className="mb-4">
        <p className="text-sm text-white mb-2">Name</p>
        <Input
          onChange={(e) => handleNameChange((e.target as HTMLInputElement).value)}
          defaultValue={metadata?.name}
          placeholder="..."
          autoComplete="off"
          autoCorrect="off"
          onBlur={(e) => verifyName((e.target as HTMLInputElement).value)}
          errors={error ? [error] : undefined}
        />
      </div>

      <div className="mb-4">
        <p className="text-sm text-white mb-2">Categories</p>
        <div className="flex flex-row space-x-2">
          {VAULT_TAGS.map((tag) => {
            return (
              <button
                key={`tag-element-${tag}`}
                type="button"
                className={`${tags[tag] ? "text-black border-white bg-white" : "text-white border-[#ffffff80]"} border rounded-[4px]
                px-2 py-0.5 transition-all ease-in-out duration-300 hover:bg-[#D7D7D7] hover:border-[#D7D7D7] hover:text-white`}
                onClick={() => handleChange(tag)}>
                {tag[0].toUpperCase() + tag.slice(1)}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default MetadataConfiguration;
