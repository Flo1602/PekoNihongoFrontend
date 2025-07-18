export type LearnViewKey = 'jteMatch' | 'jteMatchR' | 'atjMatch' | 'ateMatch' | 'jtkMatch' | 'jtkMatchR' | 'kanjiDraw' | 'wordKanjiSelect';

export interface ToolbarAction {
    key: string;
    label: string;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}

export interface LearnManagerContextType {
    onComplete: (correct: boolean) => void;
    setToolbarActions: (actions: ToolbarAction[]) => void;
}