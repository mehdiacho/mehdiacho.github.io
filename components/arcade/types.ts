/** What every weekly game screen gets from the arcade shell, and hands back when a round ends. */
export type GameScreenProps = {
  week: string;
  /** Called once per finished round with the exact run the worker will replay. */
  onRun(run: { replay: unknown; score: number }): void;
};
