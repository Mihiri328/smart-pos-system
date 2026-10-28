
import { ChevronUp, ChevronDown } from "lucide-react";

function SortIcon({ sort, field }) {
  return (
    <span className="sort-icon">
      <ChevronUp
        size={13}
        className={
          sort.key === field && sort.direction === "asc"
            ? "sort-active"
            : ""
        }
      />
      <ChevronDown
        size={13}
        className={
          sort.key === field && sort.direction === "desc"
            ? "sort-active"
            : ""
        }
      />
    </span>
  );
}

export default function CustomerTable({
  customers,
  sort,
  changeSort,
}) {
  const columns = [
    { label: "ID", field: "id" },
    { label: "Avatar", field: null },
    { label: "Full Name", field: "name" },
    { label: "Contact Email", field: "email" },
    { label: "Phone Number", field: "phone" },
    { label: "Status", field: "status" },
    { label: "Actions", field: null },
  ];

  return (
    <section className="table-card">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.label}>
                  {column.field ? (
                    <button
                      className="sort-button"
                      onClick={() => changeSort(column.field)}
                    >
                      {column.label}
                      <SortIcon
                        sort={sort}
                        field={column.field}
                      />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td className="product-name">{customer.name}</td>
                <td>{customer.category}</td>
                <td>{customer.email}</td>

                <td>
                  <div className="phone-cell">
                    <span>{customer.phone}</span>

                    <div className="progress-track">
                      <div
                        className={`progress-fill ${
                          customer.status === "Low Stock"
                            ? "low-progress"
                            : ""
                        }`}
                        style={{
                          width: `${customer.phone}%`,
                        }}
                      />
                    </div>
                  </div>
                </td>

                <td>
                  <span
                    className={`status-pill ${
                      customer.status === "Low Stock"
                        ? "low-stock"
                        : customer.status === "Recorder"
                          ? "recorder"
                          : "status-active"
                    }`}
                  >
                    {customer.status}
                  </span>
                </td>

                <td className="actions-cell">
                  <button
                    className="action-button"
                    title={`View ${customer.name}`}
                    onClick={() =>
                      window.alert(
                        `${customer.name}\n${customer.category}\n${customer.email}`
                      )
                    }
                  >
                    ⋯
                  </button>
                </td>
              </tr>
            ))}

            {customers.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-state">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-bottom-id">
        {customers.length > 0
          ? customers[customers.length - 1].id
          : ""}
      </div>
    </section>
  );
}
