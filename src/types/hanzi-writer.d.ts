// Type declarations for Hanzi Writer (no @types package exists)
declare module 'hanzi-writer' {
  interface HanziWriterOptions {
    width?: number;
    height?: number;
    padding?: number;
    showOutline?: boolean;
    showCharacter?: boolean;
    strokeAnimationSpeed?: number;
    delayBetweenStrokes?: number;
    radicalColor?: string;
    strokeColor?: string;
    outlineColor?: string;
    drawingColor?: string;
    highlightColor?: string;
    charDataLoader?: (char: string, onLoad: (data: any) => void, onError: (err: any) => void) => void;
    onLoadCharDataSuccess?: (data: any) => void;
    onLoadCharDataError?: (error: any) => void;
  }

  interface QuizOptions {
    onMistake?: (strokeData: any) => void;
    onCorrectStroke?: (strokeData: any) => void;
    onComplete?: (summaryData: any) => void;
    showHintAfterMisses?: number;
    highlightOnComplete?: boolean;
  }

  export default class HanziWriter {
    constructor(element: HTMLElement | string, options?: HanziWriterOptions);
    static create(
      element: HTMLElement | string,
      character: string,
      options?: HanziWriterOptions
    ): HanziWriter;
    static loadCharacterData(
      character: string,
      options?: HanziWriterOptions
    ): Promise<any>;
    animateCharacter(): void;
    animateStroke(strokeNum: number): void;
    loopCharacterAnimation(): void;
    pauseAnimation(): void;
    resumeAnimation(): void;
    quiz(options?: QuizOptions): void;
    cancelQuiz(): void;
    showCharacter(): void;
    hideCharacter(): void;
    showOutline(): void;
    hideOutline(): void;
    updateColor(colorName: string, colorValue: string): void;
    setCharacter(character: string): void;
    destroy(): void;
  }
}
