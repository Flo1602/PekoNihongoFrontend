import {useState} from "react";
import {useDebounce} from "react-use";

interface Props{
    isLoading: boolean;
}

const Loading = ({isLoading}: Props) => {
    const [debouncedLoading, setDebouncedLoading] = useState<boolean>();
    useDebounce(() => setDebouncedLoading(isLoading), 250, [isLoading]);

    if (!debouncedLoading) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
            <span className="loading loading-spinner loading-xl text-white"></span>
        </div>
    )
}
export default Loading
