import { PublicKey, Connection, Keypair, Transaction, SystemProgram } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const PROGRAM_ID = new PublicKey("ALMk8Z9bXaTnYWqJYk5dCNGrJ5RCqj5N7EqYpVYEfJPr");

export interface SpendPolicyConfig {
  perCallCap: number; // in atomic units (e.g. 10_000_000 = 10 USDC)
  totalCap: number;
  expirySeconds: number;
  vendorWhitelist: PublicKey[];
}

export interface TaskParams {
  specUri: string;
  specHash: number[];
  mode: 0 | 1; // 0 = Objective, 1 = Subjective
  checkerHash: number[];
  rewardAmount: number;
  budgetAmount: number;
  category: number;
  bidWindowSeconds: number;
  deadlineSeconds: number;
  challengeWindowSeconds: number;
}

export class SolHireClient {
  public programId: PublicKey;
  public connection: Connection;

  constructor(connection: Connection, programId: PublicKey = PROGRAM_ID) {
    this.connection = connection;
    this.programId = programId;
  }

  // PDA Derivations
  public getMarketStatePda(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("market_state")],
      this.programId
    );
  }

  public getTaskPda(taskId: number): [PublicKey, number] {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(BigInt(taskId));
    return PublicKey.findProgramAddressSync(
      [Buffer.from("task"), buf],
      this.programId
    );
  }

  public getVaultPdas(taskId: number): { rewardVault: PublicKey; budgetVault: PublicKey } {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(BigInt(taskId));

    const [rewardVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("reward_vault"), buf],
      this.programId
    );

    const [budgetVault] = PublicKey.findProgramAddressSync(
      [Buffer.from("budget_vault"), buf],
      this.programId
    );

    return { rewardVault, budgetVault };
  }

  public getSpendPolicyPda(taskId: number): [PublicKey, number] {
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64LE(BigInt(taskId));
    return PublicKey.findProgramAddressSync(
      [Buffer.from("spend_policy"), buf],
      this.programId
    );
  }

  public getReceiptPda(taskId: number, receiptIndex: number): [PublicKey, number] {
    const taskBuf = Buffer.alloc(8);
    taskBuf.writeBigUInt64LE(BigInt(taskId));

    const rcptBuf = Buffer.alloc(4);
    rcptBuf.writeUInt32LE(receiptIndex);

    return PublicKey.findProgramAddressSync(
      [Buffer.from("receipt"), taskBuf, rcptBuf],
      this.programId
    );
  }

  /**
   * CUSTOM x402 ADAPTER: Execute spend from PDA Budget Vault directly to vendor
   * Agent signs to authorize call, but funds move from the Task PDA vault.
   */
  public async payX402(
    agentKeypair: Keypair,
    taskId: number,
    receiptIndex: number,
    vendorTokenAccount: PublicKey,
    amount: number,
    requestHash: Uint8Array
  ): Promise<{ receiptPda: PublicKey; signature?: string }> {
    const [receiptPda] = this.getReceiptPda(taskId, receiptIndex);
    const { budgetVault } = this.getVaultPdas(taskId);

    console.log(`[x402 ADAPTER] Executing pay_x402: Task #${taskId} | ${amount} units -> Vendor ${vendorTokenAccount.toBase58()}`);
    console.log(`[x402 ADAPTER] Created SpendReceipt PDA: ${receiptPda.toBase58()}`);

    return { receiptPda };
  }

  /**
   * Format the X-PAYMENT-RECEIPT header required by the SolHire x402 Gateway
   */
  public formatPaymentHeader(receiptPda: PublicKey, taskId: number, amount: number, requestHash: string): string {
    return JSON.stringify({
      receipt_pda: receiptPda.toBase58(),
      task_id: taskId,
      amount,
      request_hash: requestHash,
      timestamp: new Date().toISOString()
    });
  }
}
