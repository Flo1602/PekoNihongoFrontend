export interface ITraceTargetChanger<T> {
  changeTarget(targetIdentifier: T): void;
}