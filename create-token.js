const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } = require('@metaplex-foundation/umi');
const { createMintWithAssociatedToken, mintTokensTo, mplToolbox } = require('@metaplex-foundation/mpl-toolbox');
const { createMetadataAccountV3, TokenStandard } = require('@metaplex-foundation/mpl-token-metadata');
const bs58 = require('bs58');

async function createToken() {
  try {

    console.log('尝试连接到 Solana 主网...');
    const umi = createUmi('https://api.mainnet-beta.solana.com');  



    console.log('注册 SPL Token 程序...');
    umi.use(mplToolbox());

    const base58PrivateKey = "钱包私钥";
    const privateKey = bs58.decode(base58PrivateKey);
    const payerKeypair = umi.eddsa.createKeypairFromSecretKey(privateKey);
    const payer = createSignerFromKeypair(umi, payerKeypair);
    umi.use(signerIdentity(payer));

    console.log(`使用的钱包地址: ${payer.publicKey}`);

    const mint = generateSigner(umi);
    
    console.log('创建代币和关联代币账户...');
    const createMintResult = await createMintWithAssociatedToken(umi, {
      mint,
      owner: payer.publicKey,
      amount: 3000000000000n, // 500亿 (考虑到2位小数)
      decimals: 2,
      mintAuthority: payer,
      freezeAuthority: payer.publicKey,
    }).sendAndConfirm(umi);
    console.log('创建代币结果:', createMintResult);

    console.log(`代币创建成功: ${mint.publicKey}`);

    // 设置代币元数据
    const metadataUrl = "https://arweave.net/DMrBdEQzJLEcLjocQSJH9w6Q5eArcfpSAOFYj8lHrE0";
    console.log('设置代币元数据...');
    const createMetadataResult = await createMetadataAccountV3(umi, {
      mint: mint.publicKey,
      mintAuthority: payer,
      updateAuthority: payer.publicKey,
      data: {
        name: "Sheng Chan Link",
        symbol: "SCL",
        uri: metadataUrl,
        sellerFeeBasisPoints: percentAmount(0),
        creators: null,
        collection: null,
        uses: null,
      },
      isMutable: true,
      collectionDetails: null,
      tokenStandard: TokenStandard.Fungible,
    }).sendAndConfirm(umi);
    console.log('设置元数据结果:', createMetadataResult);

    console.log('元数据设置成功');

    console.log('代币创建、元数据设置和铸造完成');
    console.log(`已铸造 ${3000000000000n / 100n} 个代币到钱包地址`);

  } catch (error) {
    console.error('发生错误:', error);
    if (error.logs) {
      console.error('错误日志:', error.logs);
    }
  }
}

createToken().catch(console.error);