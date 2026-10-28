
export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  setPage,
  search,
}) {
  const start = totalItems === 0
    ? 0
    : (currentPage - 1) * pageSize + 1;

  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <footer className="pagination">
      <span className="results-count">
        Showing {start}-{end} of{" "}
        {search ? totalItems : "1234"} customers
      </span>

      <span className="pagination-divider">|</span>
      <span className="pages-label">Pages</span>

      <div className="page-buttons">
        {[1, 2, 3].map((page) => (
          <button
            key={page}
            className={`page-number ${
              currentPage === page ? "selected" : ""
            }`}
            disabled={page > totalPages}
            onClick={() => setPage(page)}
          >
            {page}
          </button>
        ))}

        <span className="page-dots">....</span>

        <button
          className={`page-number ${
            currentPage === totalPages ? "selected" : ""
          }`}
          onClick={() => setPage(totalPages)}
        >
          {search ? totalPages : 124}
        </button>

        <button
          className="next-button"
          disabled={currentPage >= totalPages}
          onClick={() =>
            setPage(Math.min(currentPage + 1, totalPages))
          }
        >
          Next &gt;
        </button>
      </div>
    </footer>
  );
}
