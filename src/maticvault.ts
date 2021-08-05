import { dataSource, BigInt } from "@graphprotocol/graph-ts";
import {
  MATICVault,
  CollateralAdded,
  TokensBurned,
  VaultCreated,
  VaultLiquidated,
  TokensMinted,
  CollateralRemoved,
} from "../generated/MATICVault/MATICVault";
import { Vault, State } from "../generated/schema";
import { updateVaultCreated, updateVaultCollateralTotals, updateVaultDebtTotals } from "./utils/helpers";
import { PROTOCOL_ENTITY_MATIC_ID } from "./utils/constants";


export function handleCollateralAdded(event: CollateralAdded): void {
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._id.toString());
  let vault = Vault.load(id);

  if (vault == null) {
    vault = new Vault(id);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }
  if (vault.collateral) {
    vault.collateral = vault.collateral.plus(event.params._amount);
  } else {
    vault.collateral = event.params._amount;
  }
  vault.currentRatio = getRatio(event.params._id);
  vault.save();

  //State Update
  let state = State.load(dataSource.address().toHex());
  if (state.amountStaked) {
    state.amountStaked = state.amountStaked.plus(event.params._amount);
  } else {
    state.amountStaked = event.params._amount;
  }
  state.save();

  updateVaultCollateralTotals(PROTOCOL_ENTITY_MATIC_ID, event.address, event.params._amount, true);
}

export function handleTokensBurned(event: TokensBurned): void {
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._id.toString());
  let vault = Vault.load(id);

  if (vault == null) {
    vault = new Vault(id);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }
  if (vault.debt) {
    vault.debt = vault.debt.minus(event.params._amount);
  }
  vault.currentRatio = getRatio(event.params._id);

  // Entities can be written to the store with `.save()`
  vault.save();

  //Get burn fee
  let contract = MATICVault.bind(event.address);
  let burnFee = contract.getFee(event.params._amount);
  
  updateVaultDebtTotals(PROTOCOL_ENTITY_MATIC_ID, event.address, event.params._amount, false, burnFee);
}

export function handleVaultCreated(event: VaultCreated): void {
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._id.toString());
  let vault = new Vault(id);
  vault.owner = event.params._owner;
  vault.address = dataSource.address();
  vault.vaultId = event.params._id;
  vault.collateral = new BigInt(0);
  vault.debt = new BigInt(0);
  vault.currentRatio = new BigInt(0);

  // Entities can be written to the store with `.save()`
  vault.save();
  
  updateVaultCreated(PROTOCOL_ENTITY_MATIC_ID,  event.address);
}

export function handleVaultLiquidated(event: VaultLiquidated): void {
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._vaultId.toString());
  let vault = Vault.load(id);

  if (vault == null) {
    vault = new Vault(id);
    vault.vaultId = event.params._vaultId;
    vault.address = dataSource.address();
  }

  if (vault.debt) {
    vault.debt = vault.debt.minus(event.params._liquidationCollateral);
  }

  if (vault.collateral) {
    vault.collateral = vault.collateral.minus(event.params._reward);
  }

  let contract = MATICVault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(event.params._vaultId);
  vault.currentRatio = currentRatio;

  // Entities can be written to the store with `.save()`
  vault.save();

  //State Update
  let state = State.load(dataSource.address().toHex());
  if (state.amountStaked) {
    state.amountStaked = state.amountStaked.minus(event.params._reward);
  }
  state.save();

  //Get burn fee
  let burnFee = contract.getFee(event.params._liquidationCollateral);

  updateVaultCollateralTotals(PROTOCOL_ENTITY_MATIC_ID, event.address, event.params._reward, false);
  updateVaultDebtTotals(PROTOCOL_ENTITY_MATIC_ID, event.address, event.params._liquidationCollateral, false, burnFee)
}

export function handleTokensMinted(event: TokensMinted): void {
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._id.toString());
  let vault = Vault.load(id);

  if (vault == null) {
    vault = new Vault(id);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }
  if (vault.debt) {
    vault.debt = vault.debt.plus(event.params._amount);
  } else {
    vault.debt = event.params._amount;
  }
  vault.currentRatio = getRatio(event.params._id);
  // Entities can be written to the store with `.save()`
  vault.save();

  updateVaultDebtTotals(PROTOCOL_ENTITY_MATIC_ID, event.address, event.params._amount, true, BigInt.fromI32(0));
}

export function handleCollateralRemoved(event: CollateralRemoved): void {
  let id = dataSource
    .address()
    .toHex()
    .concat("-")
    .concat(event.params._id.toString());
  let vault = Vault.load(id);

  if (vault == null) {
    vault = new Vault(id);
    vault.address = dataSource.address();
    vault.vaultId = event.params._id;
  }

  if (vault.collateral) {
    vault.collateral = vault.collateral.minus(event.params._amount);
  }
  vault.currentRatio = getRatio(event.params._id);
  // Entities can be written to the store with `.save()`
  vault.save();

  //State Update
  let state = State.load(dataSource.address().toHex());
  if (state.amountStaked) {
    state.amountStaked = state.amountStaked.minus(event.params._amount);
  }
  state.save();

  updateVaultCollateralTotals(PROTOCOL_ENTITY_MATIC_ID, event.address, event.params._amount, false);
}

function getRatio(id: BigInt): BigInt {
  let contract = MATICVault.bind(dataSource.address());
  let currentRatio = contract.getVaultRatio(id);
  return currentRatio;
}
