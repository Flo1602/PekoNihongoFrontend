import {createContext} from "react";
import type {LearnData} from "@/components/learn/session/types.ts";

export const LearnDataContext = createContext<LearnData | null>({})