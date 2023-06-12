const ADDRESSES = {
    56: [
        "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
        "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        "0x55d398326f99059ff775485246999027b3197955",
        "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        "0x14016e85a25aeb13065688cafb43044c2ef86784",
        "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
        "0x2170ed0880ac9a755fd29b2688956bd959f933f8"
    ], // bnb
    250: [
        "0xad996a45fd2373ed0b10efa4a8ecb9de445a4302",
        "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
        "0x6c021ae822bea943b2e66552bde1d2696a53fbb7"
    ] // ftm
} as { [chainId: number]: string[] };

export async function alpacaV1({ chainId }: { chainId: number }) {
    return ADDRESSES[chainId] || [];
}