import type { ITraceLineListener } from "./ITraceLineListener";
import type { ITraceTargetChanger } from "./ITraceTargetChanger";
import type { TraceMode } from "./TraceMode";
import type { ITraceVerificationLogic } from "./verification/ITraceVerificationLogic";

export interface ITraceLogic<T> extends ITraceTargetChanger<T> {
  startTracing(traceMode: TraceMode): void;

  addTraceLineListener(listenerToAdd: ITraceLineListener): void;

  removeTraceLineListener(listenerToAdd: ITraceLineListener): void;

  getVerificationLogic(): ITraceVerificationLogic;
}