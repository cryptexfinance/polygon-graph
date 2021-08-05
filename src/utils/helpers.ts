import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Protocol,
} from "../../generated/schema";


export function updateVaultCreated(id: string, address: Address): void {
  let protocol = Protocol.load(id);
  if (protocol == null) {
    protocol = new Protocol(id);
    protocol.address = address;
    protocol.totalCollateral = BigInt.fromI32(0);
    protocol.totalDebt = BigInt.fromI32(0);
    protocol.totalBurnFee = BigInt.fromI32(0);
    protocol.createdVaults = BigInt.fromI32(1);
    protocol.totalTransactions = BigInt.fromI32(1); 
  }
  else {
    protocol.createdVaults = protocol.createdVaults.plus(BigInt.fromI32(1));
    protocol.totalTransactions = protocol.totalTransactions.plus(BigInt.fromI32(1));
  }
    
  protocol.save();
}

export function updateVaultCollateralTotals(id: string, address: Address, collateral: BigInt, isAdding: boolean): void {
  let protocol = Protocol.load(id);
  if (protocol == null) {
    protocol = new Protocol(id);
    protocol.address = address;
  }
  protocol.totalTransactions = protocol.totalTransactions.plus(
    BigInt.fromI32(1)
  );
  if (isAdding) 
    protocol.totalCollateral = protocol.totalCollateral.plus(collateral) 
  else 
    protocol.totalCollateral = protocol.totalCollateral.minus(collateral) 

  protocol.save()
}

export function updateVaultDebtTotals(id: string, address: Address, debt: BigInt, minting: boolean, burnFee: BigInt): void {
  let protocol = Protocol.load(id);
  if (protocol == null) {
    protocol = new Protocol(id);
    protocol.address = address;
  }
  protocol.totalTransactions = protocol.totalTransactions.plus(
    BigInt.fromI32(1)
  );
  if (minting)
    protocol.totalDebt = protocol.totalDebt.plus(debt);
  else {
    protocol.totalDebt = protocol.totalDebt.minus(debt);
    protocol.totalBurnFee = protocol.totalBurnFee.plus(burnFee)
  }
    
  protocol.save()
}
