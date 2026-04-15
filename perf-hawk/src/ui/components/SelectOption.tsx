import {Chart} from "./Chart";

export default function SelectOption(props: {
    title: string;
    view: View;
    subTitle: string;
    data: number[];
    onClick: () => void;
}) {
    return (
        <button className="selectOption" onClick={props.onClick}>
            <div className="selectOptionTitle">
                <div>{props.title}</div>
                <div>{props.subTitle}</div>
            </div>
            <div className="selectOptionChart">
                <Chart selectedView={props.view} data={props.data} maxDataPoints={10} />
            </div>
        </button>
    );
}