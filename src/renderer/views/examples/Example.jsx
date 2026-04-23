import React from "react";
import useDataMallas from "../../hooks/useDataMallas";

const ExampleView = () => {
  const { mallas, loading, error } = useDataMallas();
  return (
    <div>
      <h1>Example</h1>
    </div>
  );
};

export default ExampleView;
