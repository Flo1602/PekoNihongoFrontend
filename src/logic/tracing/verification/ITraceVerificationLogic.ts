import type { Polygon } from "@/model/Polygon";
import type { VerifyResult } from "./VerifyResult";

export interface ITraceVerificationLogic {
  verify(source: Polygon, toVerify: Polygon): VerifyResult;

  resetTries(): void;
}