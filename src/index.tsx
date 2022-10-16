import * as React from 'react';
import type { useFetcher } from '@remix-run/react';
import type { z } from 'zod';
import { useRouteDataOrFetcher } from './utils';

export function useInput(zodSchema?: z.ZodSchema<any>) {
	const [error, setError] = React.useState('');
	const errorId = React.useId();
	const isInvalid = Boolean(error);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;

		const result = zodSchema?.safeParse(value);
		const message = result?.success ? '' : result?.error.issues[0]?.message || 'Invalid input';
		setError(message);
	}

	function getInputProps({
		required,
		className = '',
		onErrorClassName,
		...props
	}: React.InputHTMLAttributes<HTMLInputElement> & { onErrorClassName?: string }) {
		if (typeof props.value !== 'undefined' && !props.onChange) {
			console.error(
				'You provided a value prop without an onChange handler, see: https://reactjs.org/docs/uncontrolled-components.html',
			);
		}

		return {
			...props,
			'aria-invalid': isInvalid,
			'aria-describedby': error ? errorId : undefined,
			'aria-required': required,
			className: `${className} ${isInvalid ? onErrorClassName || 'input-error' : ''}`,
			onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
				handleChange(e);
				props.onChange?.(e);
			},
		};
	}
	type ErrorElementProps = { className?: string; onErrorClassName?: string };
	function getErrorElementProps({ className = '', onErrorClassName }: ErrorElementProps) {
		return {
			id: errorId,
			role: 'alert',
			className: `${className} remix-form-library-error ${
				isInvalid ? onErrorClassName || 'block' : 'hidden'
			}`,
		};
	}

	return { error, getInputProps, getErrorElementProps };
}

type ActionData = { fieldErrors: Record<string, string> } & Record<any, any>;
export function useServerInput(
	name: string,
	zodSchema?: z.ZodSchema<any>,
	fetcher?: ReturnType<typeof useFetcher<ActionData>>,
) {
	const [changed, setChanged] = React.useState(false);
	const {
		data,
		transition: { type },
	} = useRouteDataOrFetcher(fetcher);
	const { error: localError, getInputProps, getErrorElementProps } = useInput(zodSchema);
	const serverError = changed ? undefined : data?.fieldErrors?.[name];
	const error = localError || serverError;
	const isInvalid = Boolean(error);

	React.useEffect(() => {
		if (type === 'actionReload') setChanged(false);
	}, [type]);

	function getServerInputProps(...args: Parameters<typeof getInputProps>) {
		const { onErrorClassName } = args[0] || {};
		const props = getInputProps(...args);

		return {
			...props,
			'aria-invalid': isInvalid,
			className: `${props.className} ${isInvalid ? onErrorClassName || 'input-error' : ''}`,
			onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
				setChanged(true);
				props.onChange?.(e);
			},
		};
	}

	function getServerErrorElementProps(...args: Parameters<typeof getErrorElementProps>) {
		const { onErrorClassName, className } = args[0] || {};
		const props = getErrorElementProps(...args);

		return {
			...props,
			className: `${className} ${isInvalid ? onErrorClassName || 'block' : 'hidden'}`,
		};
	}

	return { error, getServerInputProps, getServerErrorElementProps };
}
