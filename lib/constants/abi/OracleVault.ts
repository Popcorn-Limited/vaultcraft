export const OracleVaultAbi = [{"inputs":[{"components":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"address","name":"owner","type":"address"},{"components":[{"internalType":"uint256","name":"depositLimit","type":"uint256"},{"internalType":"uint256","name":"minAmount","type":"uint256"}],"internalType":"struct Limits","name":"limits","type":"tuple"},{"components":[{"internalType":"uint64","name":"performanceFee","type":"uint64"},{"internalType":"uint64","name":"managementFee","type":"uint64"},{"internalType":"uint64","name":"withdrawalIncentive","type":"uint64"},{"internalType":"uint64","name":"feesUpdatedAt","type":"uint64"},{"internalType":"uint256","name":"highWaterMark","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"internalType":"struct Fees","name":"fees","type":"tuple"}],"internalType":"struct InitializeParams","name":"params","type":"tuple"},{"internalType":"address","name":"oracle_","type":"address"},{"internalType":"address","name":"safe_","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint256","name":"fee","type":"uint256"}],"name":"InvalidFee","type":"error"},{"inputs":[],"name":"Misconfigured","type":"error"},{"inputs":[],"name":"ZeroAmount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"components":[{"internalType":"uint256","name":"upper","type":"uint256"},{"internalType":"uint256","name":"lower","type":"uint256"}],"indexed":false,"internalType":"struct Bounds","name":"prev","type":"tuple"},{"components":[{"internalType":"uint256","name":"upper","type":"uint256"},{"internalType":"uint256","name":"lower","type":"uint256"}],"indexed":false,"internalType":"struct Bounds","name":"next","type":"tuple"}],"name":"BoundsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"caller","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"assets","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"shares","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"components":[{"internalType":"uint64","name":"performanceFee","type":"uint64"},{"internalType":"uint64","name":"managementFee","type":"uint64"},{"internalType":"uint64","name":"withdrawalIncentive","type":"uint64"},{"internalType":"uint64","name":"feesUpdatedAt","type":"uint64"},{"internalType":"uint256","name":"highWaterMark","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"indexed":false,"internalType":"struct Fees","name":"prev","type":"tuple"},{"components":[{"internalType":"uint64","name":"performanceFee","type":"uint64"},{"internalType":"uint64","name":"managementFee","type":"uint64"},{"internalType":"uint64","name":"withdrawalIncentive","type":"uint64"},{"internalType":"uint64","name":"feesUpdatedAt","type":"uint64"},{"internalType":"uint256","name":"highWaterMark","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"indexed":false,"internalType":"struct Fees","name":"next","type":"tuple"}],"name":"FeesUpdated","type":"event"},{"anonymous":false,"inputs":[{"components":[{"internalType":"uint256","name":"depositLimit","type":"uint256"},{"internalType":"uint256","name":"minAmount","type":"uint256"}],"indexed":false,"internalType":"struct Limits","name":"prev","type":"tuple"},{"components":[{"internalType":"uint256","name":"depositLimit","type":"uint256"},{"internalType":"uint256","name":"minAmount","type":"uint256"}],"indexed":false,"internalType":"struct Limits","name":"next","type":"tuple"}],"name":"LimitsUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"controller","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"OperatorSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnerNominated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"controller","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"uint256","name":"requestId","type":"uint256"},{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"assets","type":"uint256"}],"name":"RedeemRequest","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"controller","type":"address"},{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"shares","type":"uint256"}],"name":"RedeemRequestCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"controller","type":"address"},{"indexed":true,"internalType":"address","name":"fulfiller","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"shares","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"assets","type":"uint256"}],"name":"RedeemRequestFulfilled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"controller","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"requestId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"assets","type":"uint256"}],"name":"RedeemRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":false,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"RoleUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"caller","type":"address"},{"indexed":true,"internalType":"address","name":"receiver","type":"address"},{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"assets","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"shares","type":"uint256"}],"name":"Withdraw","type":"event"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PAUSER_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"accruedFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"asset","outputs":[{"internalType":"contract ERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"controller","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"authorizations","outputs":[{"internalType":"bool","name":"used","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"controller","type":"address"},{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes","name":"signature","type":"bytes"}],"name":"authorizeOperator","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"bounds","outputs":[{"internalType":"uint256","name":"upper","type":"uint256"},{"internalType":"uint256","name":"lower","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"controller","type":"address"},{"internalType":"address","name":"receiver","type":"address"}],"name":"cancelRedeemRequest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"controller","type":"address"}],"name":"cancelRedeemRequest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"controller","type":"address"}],"name":"claimableRedeemRequest","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"name":"convertToAssets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"name":"convertToLowBoundAssets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"assets","type":"uint256"}],"name":"convertToShares","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"assets","type":"uint256"},{"internalType":"address","name":"receiver","type":"address"}],"name":"deposit","outputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"assets","type":"uint256"}],"name":"deposit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"fees","outputs":[{"internalType":"uint64","name":"performanceFee","type":"uint64"},{"internalType":"uint64","name":"managementFee","type":"uint64"},{"internalType":"uint64","name":"withdrawalIncentive","type":"uint64"},{"internalType":"uint64","name":"feesUpdatedAt","type":"uint64"},{"internalType":"uint256","name":"highWaterMark","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"shares","type":"uint256[]"},{"internalType":"address[]","name":"controllers","type":"address[]"}],"name":"fulfillMultipleRedeems","outputs":[{"internalType":"uint256","name":"total","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"},{"internalType":"address","name":"controller","type":"address"}],"name":"fulfillRedeem","outputs":[{"internalType":"uint256","name":"assets","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getBounds","outputs":[{"components":[{"internalType":"uint256","name":"upper","type":"uint256"},{"internalType":"uint256","name":"lower","type":"uint256"}],"internalType":"struct Bounds","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getFees","outputs":[{"components":[{"internalType":"uint64","name":"performanceFee","type":"uint64"},{"internalType":"uint64","name":"managementFee","type":"uint64"},{"internalType":"uint64","name":"withdrawalIncentive","type":"uint64"},{"internalType":"uint64","name":"feesUpdatedAt","type":"uint64"},{"internalType":"uint256","name":"highWaterMark","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"internalType":"struct Fees","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"controller","type":"address"}],"name":"getRequestBalance","outputs":[{"components":[{"internalType":"uint256","name":"pendingShares","type":"uint256"},{"internalType":"uint256","name":"requestTime","type":"uint256"},{"internalType":"uint256","name":"claimableShares","type":"uint256"},{"internalType":"uint256","name":"claimableAssets","type":"uint256"}],"internalType":"struct RequestBalance","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"address","name":"","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"isOperator","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"limits","outputs":[{"internalType":"uint256","name":"depositLimit","type":"uint256"},{"internalType":"uint256","name":"minAmount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"maxDeposit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"maxMint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"controller","type":"address"}],"name":"maxRedeem","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"controller","type":"address"}],"name":"maxWithdraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"},{"internalType":"address","name":"receiver","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"assets","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"name":"mint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"nominateNewOwner","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"nominatedOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"oracle","outputs":[{"internalType":"contract IPriceOracle","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"controller","type":"address"}],"name":"pendingRedeemRequest","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"assets","type":"uint256"}],"name":"previewDeposit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"name":"previewMint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"previewRedeem","outputs":[{"internalType":"uint256","name":"assets","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"previewWithdraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"address","name":"controller","type":"address"}],"name":"redeem","outputs":[{"internalType":"uint256","name":"assets","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"name":"redeem","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"requestBalances","outputs":[{"internalType":"uint256","name":"pendingShares","type":"uint256"},{"internalType":"uint256","name":"requestTime","type":"uint256"},{"internalType":"uint256","name":"claimableShares","type":"uint256"},{"internalType":"uint256","name":"claimableAssets","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"},{"internalType":"address","name":"controller","type":"address"},{"internalType":"address","name":"owner","type":"address"}],"name":"requestRedeem","outputs":[{"internalType":"uint256","name":"requestId","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"name":"requestRedeem","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"safe","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"upper","type":"uint256"},{"internalType":"uint256","name":"lower","type":"uint256"}],"internalType":"struct Bounds","name":"bounds_","type":"tuple"}],"name":"setBounds","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint64","name":"performanceFee","type":"uint64"},{"internalType":"uint64","name":"managementFee","type":"uint64"},{"internalType":"uint64","name":"withdrawalIncentive","type":"uint64"},{"internalType":"uint64","name":"feesUpdatedAt","type":"uint64"},{"internalType":"uint256","name":"highWaterMark","type":"uint256"},{"internalType":"address","name":"feeRecipient","type":"address"}],"internalType":"struct Fees","name":"fees_","type":"tuple"}],"name":"setFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"uint256","name":"depositLimit","type":"uint256"},{"internalType":"uint256","name":"minAmount","type":"uint256"}],"internalType":"struct Limits","name":"limits_","type":"tuple"}],"name":"setLimits","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setOperator","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"share","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"takeFees","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalAssets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"updateRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"assets","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"assets","type":"uint256"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"address","name":"controller","type":"address"}],"name":"withdraw","outputs":[{"internalType":"uint256","name":"shares","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}] as const