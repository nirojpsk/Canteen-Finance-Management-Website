import { useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { useSelector } from "react-redux";
import { FiCamera, FiCheckCircle, FiKey, FiShield } from "react-icons/fi";
import Message from "../../components/common/Message";
import {
  useChangeAdminPasswordMutation,
  useUpdateAdminProfileMutation,
} from "../../features/auth/authApiSlice";
import getErrorMessage from "../../utils/getErrorMessage";

const ProfilePage = () => {
  const { adminInfo } = useSelector((state) => state.auth);
  const [profileForm, setProfileForm] = useState({
    name: adminInfo?.name || "",
    email: adminInfo?.email || "",
    profilePicture: adminInfo?.profilePicture || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [updateProfile, updateState] = useUpdateAdminProfileMutation();
  const [changePassword, passwordState] = useChangeAdminPasswordMutation();

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");

    try {
      const response = await updateProfile(profileForm).unwrap();
      setProfileMessage(response.message || "Profile updated");
    } catch (error) {
      setProfileError(getErrorMessage(error, "Unable to update profile"));
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    try {
      const response = await changePassword(passwordForm).unwrap();
      setPasswordMessage(response.message || "Password changed");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPasswordError(getErrorMessage(error, "Unable to change password"));
    }
  };

  return (
    <section className="page-stack profile-screen">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>Profile</h2>
          <p className="page-subtitle">Public identity, administrative contact, and security controls.</p>
        </div>
      </div>

      {profileMessage ? (
        <div className="status-banner">
          <FiCheckCircle aria-hidden="true" />
          <span>{profileMessage}</span>
        </div>
      ) : null}

      <div className="profile-grid">
        <Card className="panel-card admin-profile-card">
          <Card.Body>
            <div className="profile-card-header">
              <div>
                <h3>Admin Details</h3>
                <p>Manage your public identity and administrative contact information.</p>
              </div>
              <div className="profile-photo">
                {profileForm.profilePicture ? <img src={profileForm.profilePicture} alt="" /> : null}
                <button type="button" aria-label="Update profile picture">
                  <FiCamera aria-hidden="true" />
                </button>
              </div>
            </div>
            <Message variant="danger">{profileError}</Message>
            <Form className="profile-form-grid" onSubmit={handleProfileSubmit}>
              <Form.Group controlId="profileName">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="profileEmail">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
              </Form.Group>
              <Form.Group className="profile-picture-field" controlId="profilePicture">
                <Form.Label>Profile picture URL</Form.Label>
                <Form.Control
                  name="profilePicture"
                  value={profileForm.profilePicture}
                  onChange={handleProfileChange}
                />
              </Form.Group>
              <div className="profile-actions">
                <Button type="submit" disabled={updateState.isLoading}>
                  {updateState.isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <div className="security-stack">
          <Card className="panel-card password-card">
            <Card.Body>
              <div className="security-heading">
                <span>
                  <FiKey aria-hidden="true" />
                </span>
                <div>
                  <h3>Password Security</h3>
                  <p>Ensure your account uses a long, random password.</p>
                </div>
              </div>
              <Message variant="success">{passwordMessage}</Message>
              <Message variant="danger">{passwordError}</Message>
              <Form className="password-form" onSubmit={handlePasswordSubmit}>
                <Form.Group controlId="currentPassword">
                  <Form.Label>Current password</Form.Label>
                  <Form.Control
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="newPassword">
                  <Form.Label>New password</Form.Label>
                  <Form.Control
                    name="newPassword"
                    type="password"
                    minLength={6}
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="confirmPassword">
                  <Form.Label>Confirm new password</Form.Label>
                  <Form.Control
                    name="confirmPassword"
                    type="password"
                    minLength={6}
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
                <Button type="submit" variant="secondary" disabled={passwordState.isLoading}>
                  {passwordState.isLoading ? "Saving..." : "Update Password"}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <section className="two-factor-card">
            <FiShield aria-hidden="true" />
            <h3>Two-Factor Authentication</h3>
            <p>Your account is currently secured with mobile authenticator approval.</p>
            <button type="button">Manage 2FA Settings</button>
          </section>
        </div>
      </div>

      <div className="profile-footnotes">
        <span><strong>Account Status</strong> Active / Premium Plan</span>
        <span><strong>Last Security Review</strong> Current Session</span>
        <span><strong>Login Activity</strong> View Login History</span>
      </div>
    </section>
  );
};

export default ProfilePage;
