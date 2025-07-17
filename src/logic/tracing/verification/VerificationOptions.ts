/**
 * Options for polygon verification.
 */
export interface VerificationOptions {
  /**
   * Amount of drawn overlapping lines; higher values improve result smoothness.
   */
  gradientLines: number;

  /**
   * Size of the line within a perfect score can be achieved (main line width).
   */
  minGradientLineWidth: number;

  /**
   * Size of the line within any score can be achieved.
   */
  maxGradientLineWidth: number;

  /**
   * Size of the control line, should be smaller than minGradientLineWidth.
   */
  toVerifyDotSize: number;

  /**
   * Exponent to punish color inaccuracy.
   * - 1.0: All vertices must be in minGradientLineWidth for high score.
   * - <1.0: Decreases difficulty.
   * - >1.0: Increases difficulty (wrong pixels are punished more).
   */
  colorCorrectnessExp: number;

  /**
   * Exponent to punish length inaccuracy.
   * - 1.0: Requires exact length for 100%.
   * - <1.0: Decreases difficulty.
   * - >1.0: Increases difficulty.
   */
  lengthCorrectnessExp: number;

  /**
   * Max angle range (in degrees) to score points. (1 - 360)
   */
  maxAngleRangeToScore: number;

  /**
   * Max number of angles compared within the polygon.
   */
  angularDiffMaxCheckSamples: number;

  /**
   * Max attempts to verify a polygon before giving up.
   */
  maxTries: number;

  /**
   * Minimum required image similarity to be correct. (0.0 - 1.0)
   */
  minImageSimilarity: number;

  /**
   * Minimum required length similarity to be correct. (0.0 - 1.0)
   */
  minLengthSimilarity: number;

  /**
   * Minimum required angular similarity to be correct. (0.0 - 1.0)
   */
  minAngularSimilarity: number;

  /**
   * Width of the verification field; x values should be within this.
   */
  fieldWidth: number;

  /**
   * Height of the verification field; y values should be within this.
   */
  fieldHeight: number;

  /**
   * Enable debug output and/or canvas.
   */
  debug: boolean;
}