import { useAtom } from "jotai";
import { VAULT_TAGS, metadataAtom } from "@/lib/atoms";
import Input from "@/components/inputs/Input";
import { useEffect, useState } from "react";


function MetadataConfiguration() {
  const [metadata, setMetadata] = useAtom(metadataAtom);
  const [tags, setTags] = useState({});

  useEffect(() => {
    const newTags = {};
    VAULT_TAGS.forEach((tag) => {
      // @ts-ignore
      newTags[tag] = metadata?.tags?.includes(tag)
    });
    setTags(newTags);
  }, [])

  function handleChange(value: string) {
    const newTags = { ...tags };
    // @ts-ignore
    newTags[value] = !newTags[value];
    setTags(newTags);
    // @ts-ignore
    setMetadata((prefState) => { return { ...prefState, tags: Object.keys(newTags).filter((tag) => newTags[tag]) } })
  }

  console.log({ metadata })

  return (
    <section className="flex flex-col">
      <div className="mb-4">
        <p className="text-sm text-white mb-2">Name</p>
        <Input
          onChange={(e) =>
            setMetadata((prefState) => {
              return {
                ...prefState,
                name: (e.target as HTMLInputElement).value,
              };
            })
          }
          defaultValue={metadata?.name}
          placeholder="..."
          autoComplete="off"
          autoCorrect="off"
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
                // @ts-ignore
                className={`border rounded-[4px] px-2 py-0.5 transition-all ease-in-out duration-300 hover:bg-[#D7D7D7] hover:border-[#D7D7D7] hover:text-white  ${tags[tag] ? "text-black border-white bg-white" : "text-white border-[#ffffff80]"}`}
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
