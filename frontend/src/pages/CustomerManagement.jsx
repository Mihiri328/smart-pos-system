import { useState } from 'react';
import './CustomerManagement.css';

const initialCustomers = [
  { id: 1, name: 'Kamal Perera', phone: '0771234567', email: 'kamal@example.com', purchases: 12, spent: 24500 },
  { id: 2, name: 'Nimali Silva', phone: '0712345678', email: 'nimali@example.com', purchases: 8, spent: 15800 },
  { id: 3, name: 'Amal Fernando', phone: '0763456789', email: 'amal@example.com', purchases: 15, spent: 32700 },
  { id: 4, name: 'Saman Kumara', phone: '0754567890', email: 'saman@example.com', purchases: 5, spent: 9200 },
];

function CustomerManagement() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.phone} ${customer.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalSpent = customers.reduce(
    (total, customer) => total + customer.spent,
    0
  );

  function addCustomer(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) return;

    setCustomers([
      ...customers,
      {
        ...form,
        id: Date.now(),
        purchases: 0,
        spent: 0,
      },
    ]);

    setForm({ name: '', phone: '', email: '' });
    setShowForm(false);
  }

  return (
    <section className="customer-page">
      <div className="page-heading">
        <div>
          <h2>Customer Management</h2>
          <p>View and manage your customer information.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowForm(!showForm)}
        >
          + Add Customer
        </button>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon blue">♙</div>
          <p>Total Customers</p>
          <h3>{customers.length}</h3>
          <span>Registered customers</span>
        </div>

        <div className="summary-card">
          <div className="summary-icon green">↗</div>
          <p>Total Customer Spending</p>
          <h3>Rs. {totalSpent.toLocaleString()}</h3>
          <span>Combined purchase value</span>
        </div>

        <div className="summary-card">
          <div className="summary-icon purple">▤</div>
          <p>Total Purchases</p>
          <h3>
            {customers.reduce((total, customer) => total + customer.purchases, 0)}
          </h3>
          <span>Recorded purchases</span>
        </div>
      </div>

      {showForm && (
        <form className="customer-form" onSubmit={addCustomer}>
          <h3>Add New Customer</h3>

          <div className="form-grid">
            <label>
              Customer Name *
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter customer name"
                required
              />
            </label>

            <label>
              Phone Number *
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Enter phone number"
                required
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Enter email address"
              />
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Save Customer
            </button>
          </div>
        </form>
      )}

      <div className="customer-table-card">
        <div className="table-heading">
          <div>
            <h3>All Customers</h3>
            <p>Customer details and purchase history</p>
          </div>

          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            aria-label="Search customers"
          />
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Purchases</th>
                <th>Total Spent</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-name-cell">
                      <div className="customer-avatar">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <strong>{customer.name}</strong>
                    </div>
                  </td>
                  <td>{customer.phone}</td>
                  <td>{customer.email || '—'}</td>
                  <td>{customer.purchases}</td>
                  <td>Rs. {customer.spent.toLocaleString()}</td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default CustomerManagement;