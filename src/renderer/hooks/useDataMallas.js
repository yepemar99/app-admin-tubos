import useSWR from "swr";
import { PAGE_SIZE } from "../../utils/constants";

const useDataMallas = ({ page = 1, filters = [] } = {}) => {
  const fetcher = () =>
    window.api.mallas.getAll({
      page: page,
      pageSize: PAGE_SIZE,
    });

  const { data, error, isLoading, mutate } = useSWR(
    [
      "mallas",
      page ? page : "",
      filters ? filters.map((f) => f.value).join("-") : "",
    ],
    fetcher
  );

  return {
    mallas: data?.data || [],
    total: data?.total || 0,
    loading: isLoading,
    error,
    mutate,
  };
};

export default useDataMallas;
