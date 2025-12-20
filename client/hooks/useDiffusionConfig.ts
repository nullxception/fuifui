import { useTRPC } from "@/lib/query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { defaultUserConfig } from "server/defaults";
import type { DiffusionParams } from "server/types";

export function useDiffusionConf<K extends keyof DiffusionParams>(paramKey: K) {
  const rpc = useTRPC();
  const queryClient = useQueryClient();
  const defaults = defaultUserConfig().diffusion[paramKey];
  const { data } = useQuery(rpc.conf.diffusion.queryOptions(paramKey));
  const value = (data?.[paramKey] ?? defaults) as DiffusionParams[K];

  const mutation = useMutation(
    rpc.conf.saveDiffusion.mutationOptions({
      onMutate: async (newConf) => {
        const queryKey = rpc.conf.diffusion.queryKey(paramKey);
        await queryClient.cancelQueries({ queryKey });
        const lastConf = queryClient.getQueryData(queryKey);
        queryClient.setQueryData(queryKey, { [paramKey]: newConf.paramValue });
        return { lastConf, newConf };
      },
      onSettled: () => {
        const queryKey = rpc.conf.diffusion.queryKey(paramKey);
        return queryClient.invalidateQueries({ queryKey });
      },
    }),
  );

  return {
    value,
    update: (newValue: DiffusionParams[K]) =>
      mutation.mutateAsync({ paramKey, paramValue: newValue }),
    unset: () => mutation.mutate({ paramKey, paramValue: undefined }),
  };
}
