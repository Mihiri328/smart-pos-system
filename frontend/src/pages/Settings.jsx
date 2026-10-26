import { useState } from 'react';
import './Settings.css';

function Settings() {
  const [store, setStore] = useState({
    name: 'Smart POS Store',
    phone: '0112345678',
    email: 'store@example.com',
    address: 'Colombo, Sri Lanka',
  });

  const [tax, setTax] = useState('0');
  const [currency, setCurrency] = useState('LKR');
  const [saved, setSaved] = useState(false);

  function handleSave(event) {
    event.preventDefault();
    setSaved(true);
  }

  function updateStore(field, value) {
    setStore({ ...store, [field]: value });
    setSaved(false);
  }

  return (
    <section className="settings-page">
      <div className="page-heading">
        <div>
          <h2>System Settings</h2>
          <p>Manage your store and billing preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">▣</div>
            <div>
              <h3>Store Information</h3>
              <p>Basic information about your store.</p>
            </div>
          </div>

          <div className="settings-fields">
            <label>
              Store Name
              <input
                value={store.name}
                onChange={(e) => updateStore('name', e.target.value)}
                required
              />
            </label>

            <label>
              Phone Number
              <input
                value={store.phone}
                onChange={(e) => updateStore('phone', e.target.value)}
                required
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                value={store.email}
                onChange={(e) => updateStore('email', e.target.value)}
              />
            </label>

            <label>
              Store Address
              <input
                value={store.address}
                onChange={(e) => updateStore('address', e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">▤</div>
            <div>
              <h3>Tax & Billing</h3>
              <p>Configure basic billing preferences.</p>
            </div>
          </div>

          <div className="settings-fields">
            <label>
              Tax Rate (%)
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={tax}
                onChange={(e) => {
                  setTax(e.target.value);
                  setSaved(false);
                }}
              />
            </label>

            <label>
              Currency
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  setSaved(false);
                }}
              >
                <option value="LKR">LKR - Sri Lankan Rupee</option>
                <option value="USD">USD - US Dollar</option>
                <option value="INR">INR - Indian Rupee</option>
              </select>
            </label>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">♙</div>
            <div>
              <h3>Users & Permissions</h3>
              <p>Current account information.</p>
            </div>
          </div>

          <div className="settings-user-row">
            <div className="settings-user-avatar">A</div>
            <div className="settings-user-details">
              <strong>Administrator</strong>
              <span>Admin account · Full access (demo)</span>
            </div>
            <span className="settings-status">Active</span>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-heading-icon">▧</div>
            <div>
              <h3>Backup & Security</h3>
              <p>Database backup and security features.</p>
            </div>
          </div>

          <div className="settings-info">
            <strong>Database connection not configured</strong>
            <p>
              Automatic backups and account security need to be connected
              to the backend before they can work.
            </p>
          </div>
        </div>

        <div className="settings-footer">
          {saved && (
            <span className="settings-success">
              Settings saved for this session.
            </span>
          )}

          <button type="submit" className="primary-btn">
            Save Settings
          </button>
        </div>
      </form>
    </section>
  );
}

export default Settings;