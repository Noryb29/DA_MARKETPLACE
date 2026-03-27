import { Link, useRouteError } from "react-router-dom";

export default function ErrorElement() {
  const error = useRouteError();

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        
        <h1 className="text-5xl font-bold text-green-700 mb-4">
          Oops!
        </h1>

        <p className="text-gray-600 mb-4">
          Something went wrong in the Farm Marketplace.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          {error?.statusText || error?.message}
        </p>

        <Link
          to={-1}
          className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Go Back
        </Link>

      </div>
    </div>
  );
}