export type LearnViewKey = 'jteMatch' | 'jteMatchR' | 'atjMatch' | 'ateMatch' | 'jtkMatch';

export interface LearnManagerContextType {
    onComplete: (correct: boolean) => void;

    /** Neu: der Manager übergibt Dir diese Funktion,
     *  mit der Du Deine Toolbar füllst */
    //setToolbarActions: (actions: ToolbarAction[]) => void;
}