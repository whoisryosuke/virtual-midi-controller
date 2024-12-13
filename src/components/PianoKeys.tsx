import React from "react";
import PianoKey from "./PianoKey";

type Props = {};

const PianoKeys = (props: Props) => {
  const octave = 4;
  const keys = [...new Array(12)].map((_, index) => index);
  const keyComponents = keys.map((key) => (
    <PianoKey key={key} octave={octave} note={key} />
  ));
  return <div className="piano-keys-container">{keyComponents}</div>;
};

export default PianoKeys;
