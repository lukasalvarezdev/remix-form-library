import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { z } from 'zod';
import { useServerInput } from 'remix-form-builder';

export async function action({ request }: ActionArgs) {
	const form = await request.formData();
	const name = form.get('name');

	if (!name) {
		return json({ fieldErrors: { name: 'Name is required' } }, 400);
	}

	return json({ ok: true });
}

export default function Index() {
	return (
		<div className="container">
			<h1 className="text-4xl font-bold mb-4">Remix form</h1>

			<Form method="post">
				<NameInput />

				<button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50">
					Submit
				</button>
			</Form>
		</div>
	);
}

function NameInput() {
	const { error, getServerInputProps, getServerErrorElementProps } = useServerInput(
		'name',
		z.string().min(3),
	);

	return (
		<>
			<label className="label mb-2">
				Name
				<input
					{...getServerInputProps({ name: 'name', placeholder: 'Name', className: 'input' })}
				/>
			</label>

			{error && (
				<p {...getServerErrorElementProps({ className: 'text-red-500 text-sm mb-2' })}>
					{error}
				</p>
			)}
		</>
	);
}
