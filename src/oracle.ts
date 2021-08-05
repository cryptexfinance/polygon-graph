import { AnswerUpdated } from "../generated/TCAP/Oracle";
import { Oracle } from "../generated/schema";
import { dataSource } from "@graphprotocol/graph-ts";

export function handleAnswerUpdated(event: AnswerUpdated): void {
  let oracleEntity = new Oracle(event.params.updatedAt.toHex());
  oracleEntity.updatedAt = event.params.updatedAt;
  // Entity fields can be set based on event parameters
  oracleEntity.answer = event.params.current;
  oracleEntity.roundId = event.params.roundId;
  oracleEntity.address = dataSource.address();
  // Entities can be written to the store with `.save()`
  oracleEntity.save();
}