import useSWR from "swr";

const useDataExamples = () => {
  const { data, error, isLoading, mutate } = useSWR(["example"], () => {
    return [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
  });

  return {
    examples: data,
    loading: isLoading,
    error,
    mutate,
  };
};

export default useDataExamples;
