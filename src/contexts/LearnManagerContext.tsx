import {createContext} from "react";
import type {LearnManagerContextType} from "@/components/learn/learnview/types.ts";

export const LearnManagerContext = createContext<LearnManagerContextType | null>(null)