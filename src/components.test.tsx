import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MockedFunction } from 'vitest';
import { vi } from 'vitest';
import { z } from 'zod';
import { useInput, useServerInput } from '.';
import { useRouteDataOrFetcher } from './utils';

describe('form library components', () => {
	vi.mock('./utils', () => ({
		useRouteDataOrFetcher: vi.fn(() => ({
			data: undefined,
			transition: { type: '' },
		})),
	}));

	afterAll(() => {
		vi.resetModules();
	});

	it('should validate normal zod schema', async () => {
		render(<BasicInput />);

		const input = screen.getByRole('textbox', { name: /name/i });

		expect(screen.queryByText(/name must be at least 3 characters/i)).not.toBeInTheDocument();

		await userEvent.type(input, 'a');

		expect(screen.queryByText(/name must be at least 3 characters/i)).toBeInTheDocument();

		await userEvent.type(input, 'bc');

		expect(screen.queryByText(/name must be at least 3 characters/i)).not.toBeInTheDocument();
	});

	it('should validate number zod schema', async () => {
		render(<NumberInput />);

		const input = screen.getByRole('spinbutton', { name: /age/i });

		expect(screen.queryByText(/you must be 18 years old/i)).not.toBeInTheDocument();

		await userEvent.type(input, '10');

		expect(screen.queryByText(/you must be 18 years old/i)).toBeInTheDocument();

		await userEvent.clear(input);
		await userEvent.type(input, '20');

		expect(screen.queryByText(/you must be 18 years old/i)).not.toBeInTheDocument();
	});

	it('should give more priority to local error', async () => {
		const mockedUseRouteDataOrFetcher = useRouteDataOrFetcher as unknown as MockedFunction<
			typeof useRouteDataOrFetcher<any>
		>;
		mockedUseRouteDataOrFetcher.mockReturnValueOnce({
			data: { fieldErrors: { name: 'Name is already taken' } },
			transition: { type: 'idle' } as any,
		});

		render(<ServerInput />);

		const input = screen.getByRole('textbox', { name: /name/i });

		expect(screen.queryByText(/name is already taken/i)).toBeInTheDocument();

		await userEvent.type(input, 'a');

		expect(screen.queryByText(/name must be at least 3 characters/i)).toBeInTheDocument();

		await userEvent.type(input, 'bc');

		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});
});

function BasicInput() {
	const { getErrorElementProps, error, getInputProps } = useInput(
		z.string().min(3, 'Name must be at least 3 characters'),
	);

	return (
		<>
			<label>
				Name
				<input {...getInputProps({ name: 'name' })} />
			</label>

			{error && <p {...getErrorElementProps({})}>{error}</p>}
		</>
	);
}

function NumberInput() {
	const { getErrorElementProps, error, getInputProps } = useInput(
		z.number().min(18, 'You must be 18 years old'),
	);

	return (
		<>
			<label>
				Age
				<input {...getInputProps({ name: 'age', type: 'number' })} />
			</label>

			{error && <p {...getErrorElementProps({})}>{error}</p>}
		</>
	);
}

function ServerInput() {
	const { error, getServerInputProps, getServerErrorElementProps } = useServerInput(
		'name',
		z.string().min(3, 'Name must be at least 3 characters'),
	);

	return (
		<>
			<label>
				Name
				<input {...getServerInputProps({ name: 'name' })} />
			</label>

			{error && <p {...getServerErrorElementProps({})}>{error}</p>}
		</>
	);
}
