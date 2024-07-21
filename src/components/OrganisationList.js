import React from 'react';

// Utility function to format the organization name
const formatOrgName = (name) => {
  // Capitalize the first letter and replace special characters with spaces
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/[^a-zA-Z0-9\s]/g, ' ');
};

const OrganisationList = ({ organisations, selectedOrg, onSelectOrg }) => {
  return (
    <div className="organisation-list">
      {organisations.map((org) => (
        <button
          key={org.Organisation}
          onClick={() => onSelectOrg(org.Organisation)}
          className={selectedOrg === org.Organisation ? 'selected' : ''}
        >
          {formatOrgName(org.Organisation)}
        </button>
      ))}
    </div>
  );
};

export default OrganisationList;
