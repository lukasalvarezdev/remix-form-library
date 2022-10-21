# Remix Form Library

A minimalist library to validate your remix forms end to end, from server to client.

## Installation

```
  npm install remix-form-library
```

## API reference

### useInput
The `useInput` function provides you the ability to perform atomic client side validations with [zod](https://www.npmjs.com/package/zod). The validate function will be triggered with the `onChange` event.


```typescript
function AgeInput() {
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
```

### useServerInput
The `useServerInput` function provides you the same capabilities as `useInput`. It will also listen to the data that you return in your [action function](https://remix.run/docs/en/v1/api/conventions#action) through the `useActionData` hook from the package `@remix-run/react`, or if you are using a fetcher, you must provide the fetcher as the third argument. It will give more priority to the client side validation than to the server error, so if you have an error in both client and server side, it will show the client error first.

For it to work, you need to return the errors from the action function in a `fieldErrors` object, with the key that has the error and the error.


```typescript
// app/routes/index.tsx

export async function action({ request }: ActionArgs) {
  const form = await request.formData();
  const name = form.get('name');

  if (!name) {
    return json({ 
      // fieldErrors object convention
      fieldErrors: {
        name: 'Name is required'  // name of the failing input and the error
      } 
    }, 400);
  }

  return json({ ok: true });
}

function NameInput() {
  const fetcher = useFetcher()
  const { error, getServerInputProps, getServerErrorElementProps } = useServerInput(
    'name',
    z.string().min(3, 'Name must be at least 3 characters'),
    fetcher // fetcher is optional
  );

  return (
   <fetcher.Form method="post">
      <label>
        Name
        <input {...getServerInputProps({ name: 'name' })} />
      </label>

      {error && <p {...getServerErrorElementProps({})}>{error}</p>}
   <fetcher.Form />
  );
 }
```

## Author

- [Lukas Álvarez](https://github.com/lukasalvarezdev)

## License

- MIT License
