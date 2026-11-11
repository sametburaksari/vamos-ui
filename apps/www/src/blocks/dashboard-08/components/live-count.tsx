"use client";

import * as React from "react";
import { CountUp, type CountUpProps } from "@vamos-ui/react/motion";

/** CountUp that, after the first reveal, counts from the previous value instead of from zero. */
export function LiveCount(props: CountUpProps) {
  const prev = React.useRef(props.value);
  const from = prev.current;
  React.useEffect(() => {
    prev.current = props.value;
  }, [props.value]);
  return <CountUp {...props} from={from === props.value ? props.from : from} />;
}
