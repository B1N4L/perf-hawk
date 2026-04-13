import {useEffect, useState} from "react";

export function useStatistics (dataPointCount: number, ): Statistics[] {

    const [value, setValue] = useState<Statistics[]>([]);

    // when this component re-renders or unmounts unsubscribe from the statistics event to prevent memory leaks and unnecessary event handling.
    // (eg: otherwise you may keep calling a listener after the component is unmounted, which will cause stale updates, cause errors in the console and potentially crash the app if not handled properly.)
    useEffect(() => {
        // @ts-ignore
        const unSub = window.electron.subscribeStatistics(stats => {
            setValue(prev => {
                const newData = [...prev, stats];

                if(newData.length > dataPointCount){ //keep only latest data points
                    newData.shift()
                }

                return newData;
            })
        });
        // return () => {
        //     unSub();
        // };
        return unSub;
    }, []);

    return value;
}