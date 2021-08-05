import {
  NewBurnFee,
  NewLiquidationPenalty,
  NewRatio,
  NewTreasury,
  OwnershipTransferred,
  Paused,
} from "../generated/MaticState/MATICVault";
import { State } from "../generated/schema";
import { dataSource } from "@graphprotocol/graph-ts";

export function handleNewBurnFee(event: NewBurnFee): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.owner = event.params._owner;
  }
  state.burnFee = event.params._burnFee;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleNewLiquidationPenalty(
  event: NewLiquidationPenalty
): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.owner = event.params._owner;
  }
  state.liquidationPenalty = event.params._liquidationPenalty;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleNewRatio(event: NewRatio): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.owner = event.params._owner;
  }
  state.ratio = event.params._ratio;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleNewTreasury(event: NewTreasury): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.owner = event.params._owner;
  }
  state.treasuryContract = event.params._tresury;
  // Entities can be written to the store with `.save()`
  state.save();
}


export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
  }
  state.owner = event.params.newOwner;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handlePaused(event: Paused): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.owner = event.params.account;
  }
  state.isPaused = true;
  // Entities can be written to the store with `.save()`
  state.save();
}

export function handleUnpaused(event: Paused): void {
  let state = State.load(dataSource.address().toHex());

  if (state == null) {
    state = new State(dataSource.address().toHex());
    state.owner = event.params.account;
  }
  state.isPaused = false;
  // Entities can be written to the store with `.save()`
  state.save();
}