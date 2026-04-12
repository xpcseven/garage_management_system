const Pagination = ({
  currentPage,
  totalItems,
  pageSize,
  query,
}: {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  query: string;
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages === 0) return null; // Avoid rendering if no pages exist

  const renderPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 4) pages.push("...");
      if (currentPage > 3 && currentPage < totalPages - 2)
        pages.push(currentPage);
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    }
    return pages;
  };

  const pages = renderPages();

  return (
    <div className="flex justify-center mt-3">
      <nav aria-label="Pagination Navigation">
        <ul className="inline-flex items-center space-x-1">
          {/* Previous Button */}
          <li>
            <a
              href={`?query=${query}&page=${Math.max(1, currentPage - 1)}`}
              className={`${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              } inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              السابق
            </a>
          </li>
          {/* Page Numbers */}
          {pages.map((page, index) =>
            page === "..." ? (
              <li key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </li>
            ) : (
              <li key={page}>
                <a
                  href={`?query=${query}&page=${page}`}
                  className={`${
                    currentPage === page
                      ? "text-titlecolor bg-blue-500 border-blue-500"
                      : "text-gray-700 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                  } inline-flex items-center px-3 py-2 text-sm font-medium border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  {page}
                </a>
              </li>
            )
          )}
          {/* Next Button */}
          <li>
            <a
              href={`?query=${query}&page=${Math.min(
                totalPages,
                currentPage + 1
              )}`}
              className={`${
                currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : ""
              } inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              التالي
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
