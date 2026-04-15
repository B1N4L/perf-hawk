import {useEffect, useState} from "react";

export default function useStaticData() {
    const [staticData, setStaticData] = useState<StaticData | null>(null);

    useEffect(() => {
        (async () => {
            setStaticData(await window.electron.getStaticData());
        })();
    }, []);

    return staticData;
}