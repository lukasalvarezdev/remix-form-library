import type { useFetcher } from '@remix-run/react';
import { useActionData, useTransition } from '@remix-run/react';

type FetcherType<T> = ReturnType<typeof useFetcher<T>>;
type TransitionType = ReturnType<typeof useTransition>;
type RouteOrFetcherType<WithFetcher extends boolean, T> = {
	data: T | undefined;
	transition: WithFetcher extends true ? FetcherType<T> : TransitionType;
};

export function useRouteDataOrFetcher<T>(
	fetcher: FetcherType<T> | undefined,
): RouteOrFetcherType<true, T>;
export function useRouteDataOrFetcher<T = any>(): RouteOrFetcherType<false, T>;
export function useRouteDataOrFetcher<T = any>(fetcher?: FetcherType<T>) {
	const defaultTransition = useTransition();
	const actionData = useActionData();
	const data: T | undefined = fetcher ? fetcher?.data : actionData;
	const transition = fetcher ? fetcher : defaultTransition;

	return { data, transition };
}
