import type {ElementType} from "react";

interface Props {
    icon: ElementType;
    label: string;
}

const TextIconButton = ({label, icon: Icon}: Props) => {
    return (
        <div className={`
        card  bg-base-100
        flex flex-row items-center justify-between
        p-5 rounded-lg
        border-2 border-transparent
        shadow-sm hover:shadow-md
        transition active:scale-95`}>
            <span className="text-2xl font-medium text-base-content">
                {label}
            </span>
            <Icon className="w-8 h-8 text-primary ml-4" aria-hidden="true"/>
        </div>
    )
}
export default TextIconButton
