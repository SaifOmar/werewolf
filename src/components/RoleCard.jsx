import React from 'react';

function RoleCard({ role }) {
  if (!role) return null;
  return (
    <div className="role-card">
      <h4>{role.roleName}</h4>
      <p>Team: {role.team.name}</p>
      <p><em>{role.description}</em></p>
    </div>
  );
}

export default RoleCard;
