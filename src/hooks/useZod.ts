import { useState } from "react";
import { z, ZodError, ZodObject, ZodRawShape } from "zod";

const useZod = <T extends ZodRawShape>(schema: ZodObject<T>) => {
	// We create all these generics to make this type safe
	type ZodInput = z.infer<typeof schema>;
	type ZodErrorObject = {
		[key in keyof ZodInput]?: string;
	};
	const [errors, setErrors] = useState({} as ZodErrorObject);

	/**
	 * It validates a given object against the schema
	 * 
	 * @param value The object to validate
	 * @returns true if the object is valid, false otherwise
	 */
	const validate = (value: ZodInput) => {
		try {
			schema.parse(value)
			return true;
		} catch (err) {
			// Check anyways if the error is a ZodError
			if (err instanceof ZodError) {
				// Fill the errors object with the encountered zod issues
				const errorObject = {} as ZodErrorObject;
				err.issues.forEach(issue => {
					const path = issue.path[0] as keyof ZodInput;
					errorObject[path] = issue.message;
				});
				setErrors(errorObject);
			}
			return false;
		}
	};

	return {
		validate,
		errors,
		setErrors
	}
};

export default useZod;