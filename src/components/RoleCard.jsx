import React from "react";

function RoleCard({ role }) {
	if (!role) return null;

	return (
		<div className="role-card">
			<div className="role-card-content">
				<h4 className="role-name">{role.roleName}</h4>
				<p className="role-description">{role.description}</p>
			</div>
		</div>
	);
}

export default RoleCard;
