import type {ElementType, ReactNode} from "react";
import {Link} from "react-router-dom";
import TextIconButton from "@/components/TextIconButton.tsx";

interface Props {
    elements: {
        path: string;
        icon: ElementType;
        label: string;
    }[]
    children?: ReactNode;
}

const SubMenu = (props: Props) => {
    return (
        <div className="flex-1 bg-base-300 flex flex-col items-center p-6">
            <h1 className="text-5xl font-bold mb-14">{props.children}</h1>

            <ul className="w-full max-w-md flex-1 space-y-8">
                {props.elements.map(({path, icon: Icon, label}) => {
                    return (
                        <li key={label} className="hover:scale-105">
                            <Link to={path} className="block">
                                <TextIconButton label={label} icon={Icon}/>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
export default SubMenu
